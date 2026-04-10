/**
 * Días Hábiles Colombia — Ley Emiliani (Ley 51 de 1983)
 *
 * Calcula fechas de vencimiento contando solo días hábiles,
 * descontando fines de semana y festivos oficiales colombianos.
 *
 * Fuentes de festivos:
 * - API pública Nager.Date (https://date.nager.at)
 * - Caché local en BD (GdFestivoColombia)
 */

import { getTenantPrisma } from "@/lib/tenant"

// ─── Cache en memoria durante el request ──────────────────────────────────────

const festivosCache = new Map<number, Set<string>>()

/**
 * Obtiene festivos de Colombia para un año dado.
 * Primero intenta desde BD (GdFestivoColombia), si no hay datos los descarga.
 */
export async function obtenerFestivos(anio: number): Promise<Set<string>> {
  if (festivosCache.has(anio)) return festivosCache.get(anio)!

  const prisma = await getTenantPrisma()
  const registros = await prisma.gdFestivoColombia.findMany({
    where: { anio },
    select: { fecha: true },
  })

  if (registros.length > 0) {
    const set = new Set(registros.map((r) => formatKey(r.fecha)))
    festivosCache.set(anio, set)
    return set
  }

  // No hay festivos en BD → descargar desde API pública
  const descargados = await descargarFestivos(anio)
  const set = new Set(descargados.map((f) => formatKey(f.fecha)))
  festivosCache.set(anio, set)
  return set
}

/**
 * Descarga festivos desde la API pública Nager.Date y los guarda en BD.
 */
export async function descargarFestivos(anio: number) {
  const prisma = await getTenantPrisma()

  // Intentar múltiples APIs (fallback)
  const festivos = await fetchFestivosNagerDate(anio)

  if (festivos.length === 0) {
    // Fallback: festivos fijos colombianos calculados con Ley Emiliani
    const calculados = calcularFestivosEmiliani(anio)
    for (const f of calculados) {
      await prisma.gdFestivoColombia.upsert({
        where: { fecha: f.fecha },
        update: {},
        create: { fecha: f.fecha, nombre: f.nombre, anio, ley: "Ley 51 de 1983" },
      })
    }
    return calculados
  }

  // Guardar en BD
  for (const f of festivos) {
    await prisma.gdFestivoColombia.upsert({
      where: { fecha: f.fecha },
      update: {},
      create: { fecha: f.fecha, nombre: f.nombre, anio, ley: f.ley },
    })
  }

  return festivos
}

/**
 * Verifica si una fecha es día hábil (lunes-viernes, no festivo).
 */
export async function esDiaHabil(fecha: Date): Promise<boolean> {
  const diaSemana = fecha.getDay()
  if (diaSemana === 0 || diaSemana === 6) return false // Fin de semana

  const festivos = await obtenerFestivos(fecha.getFullYear())
  return !festivos.has(formatKey(fecha))
}

/**
 * Calcula la fecha de vencimiento sumando N días hábiles
 * a partir de una fecha base. Usa calendario oficial colombiano.
 */
export async function calcularFechaVencimientoHabil(
  diasHabiles: number,
  fechaBase: Date = new Date()
): Promise<Date> {
  const resultado = new Date(fechaBase)
  let diasContados = 0

  // Pre-cargar festivos de los años que podamos necesitar
  await obtenerFestivos(resultado.getFullYear())

  while (diasContados < diasHabiles) {
    resultado.setDate(resultado.getDate() + 1)

    // Si cambiamos de año, cargar nuevos festivos
    const anio = resultado.getFullYear()
    if (!festivosCache.has(anio)) {
      await obtenerFestivos(anio)
    }

    if (await esDiaHabil(resultado)) {
      diasContados++
    }
  }

  return resultado
}

/**
 * Calcula los días hábiles restantes hasta una fecha de vencimiento.
 * Retorna negativo si ya venció.
 */
export async function getDiasHabilesRestantes(fechaVencimiento: Date): Promise<number> {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const vence = new Date(fechaVencimiento)
  vence.setHours(0, 0, 0, 0)

  if (vence <= hoy) {
    // Contar días hábiles negativos (cuánto se pasó)
    let dias = 0
    const cursor = new Date(vence)
    while (cursor < hoy) {
      cursor.setDate(cursor.getDate() + 1)
      if (await esDiaHabil(cursor)) dias--
    }
    return dias
  }

  // Contar días hábiles positivos
  let dias = 0
  const cursor = new Date(hoy)
  while (cursor < vence) {
    cursor.setDate(cursor.getDate() + 1)
    if (await esDiaHabil(cursor)) dias++
  }
  return dias
}

/**
 * Plazos legales según tipo de solicitud.
 * Basado en Ley 1755 de 2015 (CPACA) y normativa colombiana.
 */
export const PLAZOS_HABILES: Record<string, number> = {
  PETICION:  15, // Derecho de petición general
  QUEJA:     15,
  RECLAMO:   15,
  CONSULTA:  30, // Consultas requieren más tiempo
  DENUNCIA:  10, // Denuncias tienen plazo más corto
  SUGERENCIA: 15,
  SOLICITUD_INFO: 10, // Solicitud de acceso a información pública
  DEFAULT:   15,
}

/**
 * Calcula la fecha de vencimiento según tipo de PQRS sumando días HÁBILES.
 */
export async function calcularVencimientoPQRS(
  tipo: string,
  fechaRadicacion: Date = new Date()
): Promise<Date> {
  const dias = PLAZOS_HABILES[tipo.toUpperCase()] ?? PLAZOS_HABILES.DEFAULT
  return calcularFechaVencimientoHabil(dias, fechaRadicacion)
}

// ─── API de festivos: Nager.Date ──────────────────────────────────────────────

interface FestivoRaw {
  fecha: Date
  nombre: string
  ley?: string
}

async function fetchFestivosNagerDate(anio: number): Promise<FestivoRaw[]> {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/publicholidays/${anio}/CO`, {
      next: { revalidate: 86400 * 30 }, // Caché 30 días
    })

    if (!res.ok) return []

    const data: Array<{
      date: string
      localName: string
      name: string
      types: string[]
    }> = await res.json()

    return data.map((h) => ({
      fecha: new Date(h.date + "T12:00:00Z"), // Mediodía UTC para evitar zona horaria
      nombre: h.localName || h.name,
      ley: "API Nager.Date / Ley Emiliani",
    }))
  } catch {
    return []
  }
}

// ─── Fallback: Cálculo manual Ley Emiliani ────────────────────────────────────

function calcularFestivosEmiliani(anio: number): FestivoRaw[] {
  const festivos: FestivoRaw[] = []
  const add = (mes: number, dia: number, nombre: string) =>
    festivos.push({ fecha: new Date(anio, mes - 1, dia, 12, 0, 0), nombre })

  // Festivos fijos
  add(1, 1, "Año Nuevo")
  add(5, 1, "Día del Trabajo")
  add(7, 20, "Grito de Independencia")
  add(8, 7, "Batalla de Boyacá")
  add(12, 8, "Inmaculada Concepción")
  add(12, 25, "Navidad")

  // Festivos trasladados al lunes (Ley Emiliani)
  const trasladarLunes = (mes: number, dia: number, nombre: string) => {
    const fecha = new Date(anio, mes - 1, dia, 12, 0, 0)
    const diaSemana = fecha.getDay()
    if (diaSemana === 1) { /* ya es lunes */ }
    else if (diaSemana === 0) {
      // Domingo → trasladar al lunes siguiente (+1)
      fecha.setDate(fecha.getDate() + 1)
    } else {
      // Martes-sábado → trasladar al próximo lunes
      fecha.setDate(fecha.getDate() + (8 - diaSemana))
    }
    festivos.push({ fecha, nombre })
  }

  trasladarLunes(1, 6, "Reyes Magos")
  trasladarLunes(3, 19, "San José")
  trasladarLunes(6, 29, "San Pedro y San Pablo")
  trasladarLunes(8, 15, "Asunción de la Virgen")
  trasladarLunes(10, 12, "Día de la Raza")
  trasladarLunes(11, 1, "Todos los Santos")
  trasladarLunes(11, 11, "Independencia de Cartagena")

  // Semana Santa (depende de Pascua)
  const pascua = calcularPascua(anio)
  const jueveSanto = new Date(pascua)
  jueveSanto.setDate(jueveSanto.getDate() - 3)
  const viernesSanto = new Date(pascua)
  viernesSanto.setDate(viernesSanto.getDate() - 2)
  festivos.push({ fecha: jueveSanto, nombre: "Jueves Santo" })
  festivos.push({ fecha: viernesSanto, nombre: "Viernes Santo" })

  // Festivos basados en Pascua y trasladados
  const ascension = new Date(pascua)
  ascension.setDate(ascension.getDate() + 39) // 39 días después de Pascua
  // Trasladar al lunes siguiente si no es lunes
  while (ascension.getDay() !== 1) ascension.setDate(ascension.getDate() + 1)
  festivos.push({ fecha: ascension, nombre: "Ascensión del Señor" })

  const corpus = new Date(pascua)
  corpus.setDate(corpus.getDate() + 60) // 60 días después de Pascua
  while (corpus.getDay() !== 1) corpus.setDate(corpus.getDate() + 1)
  festivos.push({ fecha: corpus, nombre: "Corpus Christi" })

  const sagradoCorazon = new Date(pascua)
  sagradoCorazon.setDate(sagradoCorazon.getDate() + 68) // 68 días después de Pascua
  while (sagradoCorazon.getDay() !== 1) sagradoCorazon.setDate(sagradoCorazon.getDate() + 1)
  festivos.push({ fecha: sagradoCorazon, nombre: "Sagrado Corazón de Jesús" })

  return festivos
}

/**
 * Algoritmo de Butcher-Meeus para calcular el Domingo de Pascua.
 */
function calcularPascua(anio: number): Date {
  const a = anio % 19
  const b = Math.floor(anio / 100)
  const c = anio % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(anio, mes, dia, 12, 0, 0)
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatKey(date: Date): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
