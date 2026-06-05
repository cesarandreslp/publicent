/**
 * chat-ia.ts — Lógica RAG para el módulo Chat IA Ciudadano.
 *
 * Estrategia: Full-text search nativo de PostgreSQL (to_tsvector / plainto_tsquery)
 * sobre la tabla ChatIaChunk. Sin pgvector. Suficiente para < 5.000 fragmentos.
 */

import { getTenantPrisma, getTenantInfo } from '@/lib/tenant'
import { callIaJson } from '@/lib/groq-client'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface MensajeHistorial {
  rol: 'user' | 'assistant'
  texto: string
}

export interface RespuestaChat {
  respuesta: string
  fuentes: Array<{ titulo: string; url: string | null }>
}

interface ChunkRaw {
  id: string
  titulo: string
  contenido: string
  url: string | null
  rank: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convierte un valor JSON o string al texto plano, quitando tags HTML. */
function jsonATexto(valor: unknown): string {
  const raw = typeof valor === 'string' ? valor : JSON.stringify(valor ?? '')
  return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

// ─── Fragmentación de texto ───────────────────────────────────────────────────

const CHUNK_PALABRAS = 400
const OVERLAP_PALABRAS = 50

function fragmentarTexto(texto: string): string[] {
  const palabras = texto.split(/\s+/).filter(Boolean)
  if (palabras.length <= CHUNK_PALABRAS) return [texto]

  const chunks: string[] = []
  let inicio = 0

  while (inicio < palabras.length) {
    const fin = Math.min(inicio + CHUNK_PALABRAS, palabras.length)
    chunks.push(palabras.slice(inicio, fin).join(' '))
    inicio = fin - OVERLAP_PALABRAS
    if (inicio >= palabras.length - OVERLAP_PALABRAS) break
  }

  return chunks
}

// ─── Indexar contenido ────────────────────────────────────────────────────────

/**
 * Fragmenta el contenido en chunks de ~400 palabras y hace upsert en ChatIaChunk.
 * Borra los chunks anteriores del mismo fuenteId antes de insertar los nuevos.
 */
export async function indexarContenido(
  tenantId: string,
  fuente: string,
  fuenteId: string,
  titulo: string,
  contenido: string,
  url?: string | null
): Promise<number> {
  const prisma = await getTenantPrisma()
  const textoLimpio = contenido.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!textoLimpio) return 0

  const chunks = fragmentarTexto(textoLimpio)

  await prisma.$transaction(async (tx) => {
    await tx.chatIaChunk.deleteMany({ where: { tenantId, fuenteId } })
    await tx.chatIaChunk.createMany({
      data: chunks.map((c) => ({
        tenantId,
        fuente,
        fuenteId,
        titulo,
        contenido: c,
        url: url ?? null,
      })),
    })
  })

  return chunks.length
}

// ─── Búsqueda FTS ─────────────────────────────────────────────────────────────

/**
 * Recupera los top-N chunks más relevantes para la query usando full-text search
 * nativo de PostgreSQL (to_tsvector / plainto_tsquery).
 */
export async function buscarChunksRelevantes(
  tenantId: string,
  query: string,
  limit = 5
): Promise<ChunkRaw[]> {
  const prisma = await getTenantPrisma()

  const querySanitizada = query.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]/g, ' ').trim()
  if (!querySanitizada) return []

  const resultados = await prisma.$queryRaw<ChunkRaw[]>`
    SELECT
      id,
      titulo,
      contenido,
      url,
      ts_rank(
        to_tsvector('spanish', contenido),
        plainto_tsquery('spanish', ${querySanitizada})
      ) AS rank
    FROM chat_ia_chunks
    WHERE
      tenant_id = ${tenantId}
      AND to_tsvector('spanish', contenido) @@ plainto_tsquery('spanish', ${querySanitizada})
    ORDER BY rank DESC
    LIMIT ${limit}
  `

  return resultados
}

// ─── Responder pregunta ───────────────────────────────────────────────────────

/**
 * Pipeline RAG: recupera chunks → construye prompt → llama LLM → retorna respuesta.
 */
export async function responderPregunta(
  tenantId: string,
  pregunta: string,
  historial: MensajeHistorial[]
): Promise<RespuestaChat> {
  const [chunks, tenantInfo] = await Promise.all([
    buscarChunksRelevantes(tenantId, pregunta, 5),
    getTenantInfo().catch(() => null),
  ])

  const nombreEntidad = tenantInfo?.nombre ?? 'la entidad'

  if (chunks.length === 0) {
    return {
      respuesta: `No tengo información suficiente sobre ese tema. Te invito a contactar directamente a ${nombreEntidad}.`,
      fuentes: [],
    }
  }

  const contextoChunks = chunks
    .map((c, i) => `[${i + 1}] ${c.titulo}\n${c.contenido}`)
    .join('\n\n---\n\n')

  const historialTexto = historial
    .slice(-6)
    .map((m) => `${m.rol === 'user' ? 'Ciudadano' : 'Asistente'}: ${m.texto}`)
    .join('\n')

  const prompt = `Eres el asistente virtual de ${nombreEntidad}. Responde únicamente con base en el siguiente contenido institucional:

${contextoChunks}

${historialTexto ? `Conversación previa:\n${historialTexto}\n` : ''}
Pregunta del ciudadano: ${pregunta}

Si la respuesta no está en el contenido, dilo claramente e invita al ciudadano a contactar a ${nombreEntidad}.
Sé claro, amable y conciso (máximo 3 párrafos).

Responde ÚNICAMENTE con este JSON (sin markdown):
{"respuesta": "<tu respuesta en texto plano>", "indices_fuentes_usadas": [<números de los bloques [N] que usaste, ej: 1, 3>]}`

  let respuestaTexto: string
  let indicesFuentes: number[] = []

  try {
    const resultado = await callIaJson(tenantId, prompt)
    const parsed = JSON.parse(resultado.raw) as { respuesta?: string; indices_fuentes_usadas?: number[] }
    respuestaTexto = typeof parsed.respuesta === 'string'
      ? parsed.respuesta
      : `No tengo información suficiente sobre ese tema. Te invito a contactar directamente a ${nombreEntidad}.`
    indicesFuentes = Array.isArray(parsed.indices_fuentes_usadas) ? parsed.indices_fuentes_usadas : []
  } catch {
    respuestaTexto = `No tengo información suficiente sobre ese tema. Te invito a contactar directamente a ${nombreEntidad}.`
    indicesFuentes = []
  }

  const fuentes = indicesFuentes
    .map((idx) => chunks[idx - 1])
    .filter((c): c is ChunkRaw => !!c)
    .reduce<Array<{ titulo: string; url: string | null }>>((acc, c) => {
      if (!acc.some((f) => f.titulo === c.titulo)) acc.push({ titulo: c.titulo, url: c.url })
      return acc
    }, [])

  return { respuesta: respuestaTexto, fuentes }
}

// ─── Indexación masiva del tenant ─────────────────────────────────────────────

export async function indexarTodoElTenant(
  tenantId: string
): Promise<{ indexados: number; errores: number }> {
  const prisma = await getTenantPrisma()
  let indexados = 0
  let errores = 0

  const procesarItem = async (
    fuente: string,
    id: string,
    titulo: string,
    contenido: string,
    url?: string | null
  ) => {
    try {
      const n = await indexarContenido(tenantId, fuente, id, titulo, contenido, url)
      indexados += n
    } catch {
      errores++
    }
  }

  // Noticias publicadas (contenido es Json/HTML)
  const noticias = await prisma.noticia.findMany({
    where: { estado: 'PUBLICADO' },
    select: { id: true, titulo: true, contenido: true, slug: true },
  })
  for (const n of noticias) {
    await procesarItem('noticia', n.id, n.titulo, jsonATexto(n.contenido), `/noticias/${n.slug}`)
  }

  // Páginas (descripcion + secciones)
  const paginas = await prisma.pagina.findMany({
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      slug: true,
      secciones: { select: { contenido: true } },
    },
  })
  for (const p of paginas) {
    const texto = [
      p.descripcion ?? '',
      ...p.secciones.map((s) => jsonATexto(s.contenido)),
    ].join(' ')
    await procesarItem('pagina', p.id, p.titulo, texto, `/${p.slug}`)
  }

  // Contenido general (servicios, trámites) — usa estado y extracto
  const contenidos = await prisma.contenido.findMany({
    where: { estado: 'PUBLICADO' },
    select: { id: true, titulo: true, extracto: true, contenido: true, tipo: true, slug: true },
  })
  for (const c of contenidos) {
    const texto = [c.extracto ?? '', jsonATexto(c.contenido)].join(' ')
    await procesarItem('servicio', c.id, c.titulo, texto, `/servicios/${c.slug}`)
  }

  // Preguntas frecuentes — usa campo 'publicada'
  const faqs = await prisma.preguntaFrecuente.findMany({
    where: { publicada: true },
    select: { id: true, pregunta: true, respuesta: true },
  })
  for (const f of faqs) {
    await procesarItem('faq', f.id, f.pregunta, f.respuesta)
  }

  // Documentos de transparencia (campo archivoUrl, no url)
  const docsTransp = await prisma.documentoTransparencia.findMany({
    select: { id: true, nombre: true, descripcion: true, archivoUrl: true },
  })
  for (const d of docsTransp) {
    if (d.descripcion) {
      await procesarItem('transparencia', d.id, d.nombre, d.descripcion, d.archivoUrl)
    }
  }

  return { indexados, errores }
}
