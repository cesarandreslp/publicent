/**
 * POST /api/pqrsd
 * Punto de entrada público para radicación de PQRS ciudadanas.
 *
 * Lógica de despacho:
 *  1. Si el módulo Ventanilla Única está activo → delega al sistema externo.
 *     Si la delegación falla y usarFallback=true → guarda localmente.
 *  2. Si Ventanilla Única está inactivo → guarda directamente en la DB del tenant.
 *
 * El ciudadano recibe siempre un número de radicado; la complejidad es transparente.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySolution } from "@/lib/altcha"
import { getTenantPrisma, getTenantModulos, MODULO_IDS } from "@/lib/tenant"
import { isModuleActive, getVentanillaConfig, getPqrsdConfig } from "@/lib/modules"
import { TipoPQRS, VuColorSemaforo, VuGenero, VuZona, VuCondicionVulnerabilidad, Prisma } from "@prisma/client"
import { pqrsPublicoSchema, validateBody } from "@/lib/validations"
import { notificarCiudadano } from "@/lib/notifications"

interface SeguimientoItem {
  fecha: string
  estado: string
  descripcion: string
}

interface RespuestaOficial {
  numero: string
  fecha: string
  urlDescarga: string | null
  hashVerificacion: string | null | undefined
}

type RadicadoHijoConDocs = Prisma.GdRadicadoGetPayload<{
  include: { documentos: { include: { firmaQr: true } } }
}>

// ─── Rate limiting por IP para endpoint público ───────────────────────────────
// Sliding window en memoria: máximo 5 radicaciones por IP por minuto.
// Protege contra spam y abuso sin depender de Redis en dev/staging.

const ipWindows = new Map<string, number[]>()
const IP_LIMIT  = 5
const WINDOW_MS = 60_000

function isIpRateLimited(ip: string): boolean {
  const now   = Date.now()
  const start = now - WINDOW_MS
  const hits  = (ipWindows.get(ip) ?? []).filter(t => t > start)
  hits.push(now)
  ipWindows.set(ip, hits)
  // Limpiar entradas viejas periódicamente para evitar memory leak
  if (ipWindows.size > 10_000) {
    for (const [k, v] of ipWindows) {
      if (v.every(t => t < start)) ipWindows.delete(k)
    }
  }
  return hits.length > IP_LIMIT
}

// ─── Tipos del cuerpo de la solicitud ──────────────────────────────────────────

interface PQRSPayload {
  tipo: string
  anonimo?: boolean
  nombreSolicitante?: string
  tipoDocumento?: string
  documentoIdentidad?: string
  email?: string
  telefono?: string
  direccion?: string
  asunto: string
  descripcion: string
  turnstileToken?: string
  // Datos demográficos voluntarios (módulo VU — FURAG POL06)
  demografia?: {
    genero?:     string
    rangoEtario?: string
    zona?:       string
    condicion?:  string
    municipioResidencia?: string
    departamento?: string
  }
}

// ─── Mapa de tipos de UI a enum Prisma ────────────────────────────────────────

const TIPO_MAP: Record<string, TipoPQRS> = {
  peticion:     TipoPQRS.PETICION,
  queja:        TipoPQRS.QUEJA,
  reclamo:      TipoPQRS.RECLAMO,
  sugerencia:   TipoPQRS.SUGERENCIA,
  denuncia:     TipoPQRS.DENUNCIA,
  felicitacion: TipoPQRS.FELICITACION,
  consulta:     TipoPQRS.CONSULTA,
}

// ─── Generador de radicado ─────────────────────────────────────────────────────

function generarRadicado(tipo: TipoPQRS): string {
  const prefijos: Record<TipoPQRS, string> = {
    PETICION:     "PET",
    QUEJA:        "QUE",
    RECLAMO:      "REC",
    SUGERENCIA:   "SUG",
    DENUNCIA:     "DEN",
    FELICITACION: "FEL",
    CONSULTA:     "CON",
  }
  const prefijo  = prefijos[tipo] ?? "PQR"
  const fecha    = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const aleatorio = Math.floor(100000 + Math.random() * 900000)
  return `${prefijo}-${fecha}-${aleatorio}`
}

// ─── Delegación a Ventanilla Única ────────────────────────────────────────────

async function delegarAVentanillaUnica(
  apiUrl: string,
  apiKey: string,
  payload: PQRSPayload
): Promise<{ radicado: string } | null> {
  try {
    const res = await fetch(`${apiUrl}/pqrsd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000), // 10s timeout
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.radicado ? { radicado: data.radicado } : null
  } catch {
    return null
  }
}

// ─── Guardar en DB local del tenant ───────────────────────────────────────────

async function guardarLocal(
  payload: PQRSPayload,
  tipo: TipoPQRS,
  modulos: Awaited<ReturnType<typeof getTenantModulos>>
): Promise<string> {
  const prisma = await getTenantPrisma()
  const radicado = generarRadicado(tipo)

  // Calcular vencimiento con días hábiles (Ley 1755/2015)
  const { calcularVencimientoPQRS } = await import("@/lib/dias-habiles")
  const fechaVencimiento = await calcularVencimientoPQRS(tipo, new Date())

  // Crear el PQRS
  const pqrs = await prisma.pQRS.create({
    data: {
      radicado,
      tipo,
      asunto:              payload.asunto,
      descripcion:         payload.descripcion,
      anonimo:             payload.anonimo ?? false,
      nombreSolicitante:   payload.anonimo ? "Anónimo" : (payload.nombreSolicitante ?? "Sin nombre"),
      tipoDocumento:       payload.anonimo ? "N/A"     : (payload.tipoDocumento     ?? "N/A"),
      numeroDocumento:     payload.anonimo ? "0"       : (payload.documentoIdentidad ?? "N/A"),
      email:               payload.anonimo ? "anonimo@sin-email.local" : (payload.email ?? "sin-email@placeholder.local"),
      telefono:            payload.anonimo ? null : (payload.telefono ?? null),
      direccion:           payload.anonimo ? null : (payload.direccion ?? null),
      estado:              "RECIBIDA",
      canal:               "WEB",
      fechaVencimiento,
    },
  })

  // ─── Puente → Gestor Documental AGN ──────────────────────────────────────
  // Intentar generar el GdRadicado oficial vinculado.
  // Si no existe TRD configurada, se omite sin bloquear al ciudadano.
  try {
    const { generarNumeroRadicado } = await import("@/lib/gd-consecutivo")

    // Resolver la dependencia receptora:
    //  1. Si el tenant la configuró explícitamente en `pqrsd.dependenciaReceptoraCodigo`
    //     → usar esa (permite entidades sin árbol jerárquico estricto).
    //  2. Si no, usar la primera dependencia raíz activa (compat. tenants legacy).
    //  3. Si tampoco hay raíz, caer a cualquier dependencia activa.
    const codigoConfigurado = getPqrsdConfig(modulos).dependenciaReceptoraCodigo?.trim()
    const depPrincipal =
      (codigoConfigurado
        ? await prisma.gdTrdDependencia.findFirst({
            where: { activa: true, codigo: codigoConfigurado },
          })
        : null)
      ?? (await prisma.gdTrdDependencia.findFirst({
            where: { activa: true, padreId: null },
            orderBy: { codigo: "asc" },
          }))
      ?? (await prisma.gdTrdDependencia.findFirst({
            where: { activa: true },
            orderBy: { codigo: "asc" },
          }))

    if (depPrincipal) {
      const numeroOficial = await generarNumeroRadicado("PQRS", depPrincipal.codigo)

      // Primer usuario administrador como tramitador por defecto
      const adminUser = await prisma.usuario.findFirst({
        where: { activo: true },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      })

      if (adminUser) {
        const gdRadicado = await prisma.gdRadicado.create({
          data: {
            numero: numeroOficial,
            tipo: "PQRS",
            medioRecepcion: "WEB",
            asunto: payload.asunto,
            folios: 1,
            prioridad: "NORMAL",
            estado: "EN_TRAMITE",
            dependenciaId: depPrincipal.id,
            tramitadorId: adminUser.id,
            creadorId: adminUser.id,
            // Remitente desde el formulario ciudadano
            remitentes: {
              create: {
                tipoPersona: payload.anonimo ? "ANONIMO" : "CIUDADANO",
                nombre: payload.anonimo ? "Anónimo" : (payload.nombreSolicitante ?? "Sin nombre"),
                documento: payload.documentoIdentidad ?? null,
                email: payload.email ?? null,
                telefono: payload.telefono ?? null,
                direccion: payload.direccion ?? null,
              },
            },
          },
          select: { id: true },
        })

        // Log de radicación
        await prisma.gdLogTransaccion.create({
          data: {
            accion: "RADICACION",
            descripcion: `PQRS ciudadano radicado automáticamente vía ventanilla web`,
            estadoNuevo: "EN_TRAMITE",
            usuarioId: adminUser.id,
            radicadoId: gdRadicado.id,
          },
        })

        // Vincular el GdRadicado al PQRS
        await prisma.pQRS.update({
          where: { id: pqrs.id },
          data: { gdRadicadoId: gdRadicado.id },
        })
      }
    }
  } catch (err) {
    // No bloquear al ciudadano si la integración GD falla
    console.error("[PQRS→GD] Error al crear GdRadicado:", err instanceof Error ? err.message : String(err))
  }

  // ─── Módulo VU: clasificación IA + demografía ──────────────────────────────
  // Solo si el módulo VU está activo para este tenant
  try {
    if (isModuleActive(modulos, MODULO_IDS.VENTANILLA_UNICA)) {
      const { classifyPQRSD, calcularSemaforo } = await import("@/lib/groq-client")
      const { getTenantId } = await import("@/lib/tenant")

      const tenantId = await getTenantId()

      // Obtener dependencias disponibles para el contexto de la IA
      const dependencias = await prisma.dependencia.findMany({
        select: { nombre: true },
      }).then(deps => deps.map(d => d.nombre)).catch(() => [])

      const tenantInfo = await import("@/lib/tenant").then(m => m.getTenantInfo())

      const clasificacion = await classifyPQRSD(tenantId, payload.descripcion, {
        nombre:      tenantInfo.nombre,
        tipoEntidad: tenantInfo.tipoEntidad,
        municipio:   tenantInfo.municipio,
        dependencias,
      })

      // Calcular color del semáforo y fecha límite real
      // Vencimiento con festivos + Ley Emiliani (vía dias-habiles), no la
      // versión simplificada de groq-client que ignora festivos.
      const { calcularFechaVencimientoHabil } = await import("@/lib/dias-habiles")
      const fechaLimiteVU = await calcularFechaVencimientoHabil(clasificacion.diasTerminoLegal, new Date())
      const colorSemaforo = calcularSemaforo(new Date(), clasificacion.diasTerminoLegal)

      // Guardar clasificación IA
      await prisma.vuAsignacionIA.create({
        data: {
          pqrsId:              pqrs.id,
          modelo:              clasificacion.modelo,
          tokensPrompt:        clasificacion.tokensPrompt,
          tokensRespuesta:     clasificacion.tokensRespuesta,
          razon:               clasificacion.razon,
          confianza:           clasificacion.confianza,
          dependenciaSugerida: clasificacion.dependenciaSugerida,
          funcionarioSugerido: clasificacion.funcionarioSugerido,
          prioridadSugerida:   clasificacion.prioridad,
          tipoDetectado:       clasificacion.tipo,
          diasTerminoLegal:    clasificacion.diasTerminoLegal,
        },
      })

      // Actualizar PQRS con semáforo, prioridad y fecha límite más precisa
      await prisma.pQRS.update({
        where: { id: pqrs.id },
        data: {
          prioridad:       clasificacion.prioridad,
          colorSemaforo:   colorSemaforo as VuColorSemaforo,
          fechaVencimiento: fechaLimiteVU,
        },
      })

      // Guardar datos demográficos si el ciudadano los proporcionó
      if (payload.demografia) {
        const d = payload.demografia
        await prisma.vuDemografia.create({
          data: {
            pqrsId:              pqrs.id,
            genero:              (d.genero as VuGenero | undefined) ?? VuGenero.PREFIERE_NO_DECIR,
            rangoEtario:         d.rangoEtario ?? null,
            zona:                (d.zona as VuZona | undefined) ?? VuZona.NO_INFORMA,
            condicion:           (d.condicion as VuCondicionVulnerabilidad | undefined) ?? VuCondicionVulnerabilidad.NINGUNA,
            municipioResidencia: d.municipioResidencia ?? null,
            departamento:        d.departamento ?? null,
          },
        })
      }
    }
  } catch (vuErr) {
    // La clasificación VU no bloquea la radicación
    console.error("[PQRS→VU] Error en clasificación IA:", vuErr instanceof Error ? vuErr.message : String(vuErr))
  }
  // ────────────────────────────────────────────────────────────────────────────

  // ─── Notificación WhatsApp al ciudadano (si configuró teléfono) ────────────
  // Fire-and-forget: si WhatsApp no está configurado o falla, no afecta la radicación.
  if (!payload.anonimo && payload.telefono) {
    const tipoLabel = payload.tipo.charAt(0).toUpperCase() + payload.tipo.slice(1).toLowerCase()
    const fechaVenceStr = fechaVencimiento
      ? fechaVencimiento.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })
      : "por definir"
    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || ""
    ;(async () => {
      try {
        const { getTenantId } = await import("@/lib/tenant")
        const tenantId = await getTenantId()
        await notificarCiudadano(tenantId, "WHATSAPP", "radicado", {
          telefono: payload.telefono,
          radicado,
          tipo: tipoLabel,
          fechaVencimiento: fechaVenceStr,
          urlConsulta: `${baseUrl}/atencion-ciudadano/pqrsd/consulta?radicado=${encodeURIComponent(radicado)}`,
        })
      } catch (waErr) {
        console.error("[PQRS→WhatsApp] Error notificando radicación:", waErr instanceof Error ? waErr.message : String(waErr))
      }
    })()
  }

  return radicado
}

// ─── Handler principal POST ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limiting por IP — máximo 5 radicaciones por minuto
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown"
  if (isIpRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espere un momento antes de intentar de nuevo." },
      { status: 429, headers: { "Retry-After": "60" } }
    )
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 })
  }

  // Validación Zod
  const validated = validateBody(pqrsPublicoSchema, rawBody)
  if (!validated.success) return validated.response
  const payload = validated.data

  const tipo = TIPO_MAP[payload.tipo.toLowerCase()]
  if (!tipo) {
    return NextResponse.json(
      { error: `Tipo de PQRS inválido: ${payload.tipo}` },
      { status: 400 }
    )
  }

  if (!payload.turnstileToken) {
    return NextResponse.json(
      { error: "Falta validar el CAPTCHA" },
      { status: 400 }
    )
  }

  // Validar el desafío ALTCHA (proof-of-work open-source, sin servicio externo).
  // El campo `turnstileToken` transporta el payload base64 que produce el widget ALTCHA.
  try {
    const hmacKey = process.env.ALTCHA_HMAC_KEY
    if (!hmacKey) {
      console.error("[PQRS] ALTCHA_HMAC_KEY no configurada")
      return NextResponse.json(
        { error: "Configuración de CAPTCHA incompleta en el servidor" },
        { status: 500 }
      )
    }
    const captchaOk = verifySolution(payload.turnstileToken, hmacKey)
    if (!captchaOk) {
      return NextResponse.json(
        { error: "Verificación de CAPTCHA fallida. Intente recargar la página." },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error al verificar ALTCHA:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error de servidor al validar CAPTCHA" },
      { status: 500 }
    )
  }

  try {
    const modulos = await getTenantModulos()

    // ── Despacho: Ventanilla Única ───────────────────────────────────────────
    // Modo externo (legacy): si el tenant tiene configurada una URL externa de VU
    // Modo interno (nuevo):  si VU está activo sin apiUrl → usa el motor IA nativo
    if (isModuleActive(modulos, MODULO_IDS.VENTANILLA_UNICA)) {
      const vuConfig = getVentanillaConfig(modulos)

      if (vuConfig.apiUrl && vuConfig.apiKey) {
        // Modo externo (delegación a sistema VU externo)
        const resultado = await delegarAVentanillaUnica(
          vuConfig.apiUrl,
          vuConfig.apiKey,
          payload
        )

        if (resultado) {
          return NextResponse.json({ radicado: resultado.radicado })
        }

        if (!vuConfig.usarFallback) {
          return NextResponse.json(
            { error: "El sistema de Ventanilla Única no está disponible. Intente más tarde." },
            { status: 503 }
          )
        }
        // Fallback a modo interno
      }
      // Modo interno: guardarLocal se encarga de llamar a classifyPQRSD
    }

    // ── Almacenamiento local (sitio web básico o fallback) ────────────────────
    const radicado = await guardarLocal(payload, tipo, modulos)
    return NextResponse.json({ radicado })
  } catch (err) {
    console.error("[/api/pqrsd] Error al radicar PQRS:", err instanceof Error ? err.message : String(err))
    return NextResponse.json(
      { error: "Error interno. Intente nuevamente." },
      { status: 500 }
    )
  }
}

// ─── Handler Consulta GET ─────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const radicado = searchParams.get("radicado")

  if (!radicado) {
    return NextResponse.json({ error: "Número de radicado requerido" }, { status: 400 })
  }

  try {
    const modulos = await getTenantModulos()

    // 1. Delegar a Ventanilla Única si está activa
    if (isModuleActive(modulos, MODULO_IDS.VENTANILLA_UNICA)) {
      const vuConfig = getVentanillaConfig(modulos)
      if (vuConfig.apiUrl && vuConfig.apiKey) {
        try {
          const res = await fetch(`${vuConfig.apiUrl}/pqrsd?radicado=${encodeURIComponent(radicado)}`, {
            headers: { "X-Api-Key": vuConfig.apiKey },
            signal: AbortSignal.timeout(10_000)
          })
          
          if (res.ok) {
            const data = await res.json()
            return NextResponse.json(data)
          }

          if (res.status === 404 && !vuConfig.usarFallback) {
             return NextResponse.json({ error: "Radicado no encontrado en el sistema" }, { status: 404 })
          }
          // Si falló pero usarFallback es true, continúa a buscar localmente
        } catch {
          if (!vuConfig.usarFallback) {
             return NextResponse.json({ error: "Sistema de consulta temporalmente no disponible" }, { status: 503 })
          }
        }
      }
    }

    // 2. Búsqueda local (Fallback o módulo inactivo + Integración completa con el Gestor Documental)
    const prisma = await getTenantPrisma()
    const pqrs = await prisma.pQRS.findUnique({
      where: { radicado },
      include: {
        gdRadicado: {
          include: {
            dependencia: true,
            transacciones: { orderBy: { createdAt: "asc" } }
          }
        },
        vuAsignacion: true,
      }
    })

    if (!pqrs) {
      return NextResponse.json({ error: "Radicado no encontrado" }, { status: 404 })
    }

    const seguimiento: SeguimientoItem[] = [
      {
        fecha: pqrs.createdAt.toISOString().slice(0, 10),
        estado: 'Radicado',
        descripcion: 'PQRS recibida e indexada en el sistema web.'
      }
    ]

    const respuestasOficiales: RespuestaOficial[] = []

    if (pqrs.gdRadicado) {
      // Inyectar el historial de transacciones reales del Gestor Documental
      pqrs.gdRadicado.transacciones.forEach(tx => {
        seguimiento.push({
          fecha: tx.createdAt.toISOString().slice(0, 10),
          estado: tx.estadoNuevo || tx.accion,
          descripcion: tx.descripcion || 'Acción de trámite interno.'
        })
      })

      // Buscar si el radicado de entrada tiene respuestas emitidas (SALIDA)
      const radicadosHijos: RadicadoHijoConDocs[] = await prisma.gdRadicado.findMany({
        where: { radicadoOrigen: pqrs.gdRadicado.numero, tipo: "SALIDA" },
        include: { documentos: { include: { firmaQr: true } } }
      })

      radicadosHijos.forEach((hijo) => {
        const docPrincipal = hijo.documentos.find((d) => d.esPrincipal)
        if (docPrincipal) {
          seguimiento.push({
            fecha: hijo.createdAt.toISOString().slice(0, 10),
            estado: 'Respuesta Emitida',
            descripcion: `Oficio N° ${hijo.numero} generado y firmado electrónicamente.`
          })
          respuestasOficiales.push({
            numero: hijo.numero,
            fecha: hijo.createdAt.toISOString().slice(0, 10),
            urlDescarga: docPrincipal.archivoUrl,
            hashVerificacion: docPrincipal.firmaQr?.hashFirma
          })
        }
      })
    }

    // Determinar estado agregado para la vista ciudadana
    let estadoUI = pqrs.estado.toLowerCase() === "recibida" ? "radicado" : pqrs.estado.toLowerCase()
    if (respuestasOficiales.length > 0) estadoUI = "respondido"
    if (pqrs.gdRadicado?.estado === "ARCHIVADO") estadoUI = "cerrado"

    // Semáforo: recalcular en tiempo real si hay fecha de vencimiento
    let colorSemaforo: VuColorSemaforo | null = pqrs.colorSemaforo ?? null
    if (pqrs.fechaVencimiento && pqrs.vuAsignacion?.diasTerminoLegal) {
      const { calcularSemaforo } = await import("@/lib/groq-client")
      colorSemaforo = calcularSemaforo(pqrs.createdAt, pqrs.vuAsignacion.diasTerminoLegal) as VuColorSemaforo
    }

    return NextResponse.json({
      radicado: pqrs.radicado,
      tipo: pqrs.tipo,
      estado: estadoUI,
      fechaRadicacion: pqrs.createdAt.toISOString().slice(0, 10),
      fechaVencimiento: pqrs.fechaVencimiento ? pqrs.fechaVencimiento.toISOString().slice(0, 10) : "Por definir",
      asunto: pqrs.asunto,
      dependencia: pqrs.gdRadicado?.dependencia?.nombre || pqrs.vuAsignacion?.dependenciaSugerida || "Atención al Ciudadano",
      colorSemaforo,
      diasTerminoLegal: pqrs.vuAsignacion?.diasTerminoLegal ?? null,
      seguimiento,
      respuestas: respuestasOficiales
    })
  } catch (err) {
    console.error("[/api/pqrsd] GET Error:", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error interno al consultar" }, { status: 500 })
  }
}
