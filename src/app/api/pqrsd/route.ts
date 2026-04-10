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
import { getTenantPrisma, getTenantModulos, MODULO_IDS } from "@/lib/tenant"
import { isModuleActive, getVentanillaConfig } from "@/lib/modules"
import { TipoPQRS } from "@prisma/client"
import { pqrsPublicoSchema, validateBody } from "@/lib/validations"

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

async function guardarLocal(payload: PQRSPayload, tipo: TipoPQRS): Promise<string> {
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

    // Obtener la primera dependencia TRD activa (receptora de PQRS)
    const depPrincipal = await prisma.gdTrdDependencia.findFirst({
      where: { activa: true, padreId: null },
      orderBy: { codigo: "asc" },
    })

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

  return radicado
}

// ─── Handler principal POST ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
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
      { error: "Faltan validar el CAPTCHA" },
      { status: 400 }
    )
  }

  // Validar el token de Turnstile con Cloudflare
  try {
    const formData = new URLSearchParams()
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA')
    formData.append('response', payload.turnstileToken)

    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })
    
    const turnstileResult = await turnstileRes.json()

    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: "Verificación de CAPTCHA fallida. Intente recargar la página." },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error al verificar Turnstile:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error de servidor al validar CAPTCHA" },
      { status: 500 }
    )
  }

  try {
    const modulos = await getTenantModulos()

    // ── Despacho: Ventanilla Única ───────────────────────────────────────────
    if (isModuleActive(modulos, MODULO_IDS.VENTANILLA_UNICA)) {
      const vuConfig = getVentanillaConfig(modulos)

      if (vuConfig.apiUrl && vuConfig.apiKey) {
        const resultado = await delegarAVentanillaUnica(
          vuConfig.apiUrl,
          vuConfig.apiKey,
          payload
        )

        if (resultado) {
          // Delegación exitosa — retornar el radicado del sistema externo
          return NextResponse.json({ radicado: resultado.radicado })
        }

        // Si la delegación falló, verificar si se permite fallback
        if (!vuConfig.usarFallback) {
          return NextResponse.json(
            { error: "El sistema de Ventanilla Única no está disponible en este momento. Intente más tarde." },
            { status: 503 }
          )
        }
        // Fallback: continuar con almacenamiento local
      }
    }

    // ── Almacenamiento local (sitio web básico o fallback) ────────────────────
    const radicado = await guardarLocal(payload, tipo)
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
        } catch (err) {
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
        }
      }
    })

    if (!pqrs) {
      return NextResponse.json({ error: "Radicado no encontrado" }, { status: 404 })
    }

    const seguimiento: any[] = [
      { 
        fecha: pqrs.createdAt.toISOString().slice(0, 10), 
        estado: 'Radicado', 
        descripcion: 'PQRS recibida e indexada en el sistema web.' 
      }
    ]

    const respuestasOficiales: any[] = []

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
      const radicadosHijos = await prisma.gdRadicado.findMany({
        where: { radicadoOrigen: pqrs.gdRadicado.numero, tipo: "SALIDA" },
        include: { documentos: { include: { firmaQr: true } } } as any
      })

      radicadosHijos.forEach((hijo: any) => {
        // En NextJS TypeScript, a veces el linter se queja con forEach, se recomienda usar map o of, pero aquí mapeamos el doc.
        const docPrincipal = hijo.documentos.find((d: any) => d.esPrincipal)
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

    return NextResponse.json({
      radicado: pqrs.radicado,
      tipo: pqrs.tipo,
      estado: estadoUI,
      fechaRadicacion: pqrs.createdAt.toISOString().slice(0, 10),
      fechaVencimiento: pqrs.fechaVencimiento ? pqrs.fechaVencimiento.toISOString().slice(0, 10) : "Por definir",
      asunto: pqrs.asunto,
      dependencia: pqrs.gdRadicado?.dependencia?.nombre || "Atención al Ciudadano",
      seguimiento,
      respuestas: respuestasOficiales
    })
  } catch (err) {
    console.error("[/api/pqrsd] GET Error:", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error interno al consultar" }, { status: 500 })
  }
}
