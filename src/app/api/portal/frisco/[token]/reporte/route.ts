/**
 * /api/portal/frisco/[token]/reporte — endpoint público para que el
 * depositario registre su reporte mensual. Validado por token (sin login).
 *
 * Idempotente por periodo: un depositario puede actualizar el reporte del
 * mes en curso, pero no crear duplicados (unique [depositarioId, periodo]).
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { after } from "next/server"
import { z } from "zod"
import { Prisma, FriscoEstadoFisico } from "@prisma/client"
import { getTenantPrisma, getTenantId, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import { resolverAcceso, periodoActual } from "@/lib/frisco-portal"
import { validateBody } from "@/lib/validations"
import { analizarReporte } from "@/lib/frisco-reporte-ia"

type Params = { params: Promise<{ token: string }> }

const schema = z.object({
  estadoBien: z.nativeEnum(FriscoEstadoFisico),
  novedades:  z.string().min(5).max(4000),
  fotoUrl:    z.string().url().max(500).optional().nullable(),
  adjuntoUrl: z.string().url().max(500).optional().nullable(),
})

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isTenantModuleActive(MODULO_IDS.PORTAL_EXTERNO))) {
    return NextResponse.json({ error: "Portal no habilitado" }, { status: 404 })
  }

  const { token } = await params
  const prisma = await getTenantPrisma()
  const acceso = await resolverAcceso(prisma, token)
  if (!acceso) {
    return NextResponse.json({ error: "Acceso inválido o expirado" }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 }) }

  const validated = validateBody(schema, body)
  if (!validated.success) return validated.response
  const data = validated.data

  const periodo = periodoActual()
  const depositarioId = acceso.depositario.id

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || req.headers.get("x-real-ip")
            || null

  const ahora = new Date()
  const reporte = await prisma.$transaction(async (tx) => {
    const r = await tx.friscoReporteDepositario.upsert({
      where: { depositarioId_periodo: { depositarioId, periodo } },
      create: {
        depositarioId, periodo,
        estadoBien: data.estadoBien,
        novedades:  data.novedades,
        fotoUrl:    data.fotoUrl    ?? null,
        adjuntoUrl: data.adjuntoUrl ?? null,
        ipOrigen:   ip,
      },
      update: {
        estadoBien: data.estadoBien,
        novedades:  data.novedades,
        fotoUrl:    data.fotoUrl    ?? null,
        adjuntoUrl: data.adjuntoUrl ?? null,
        ipOrigen:   ip,
      },
    })
    await tx.friscoDepositario.update({
      where: { id: depositarioId },
      data:  { ultimoReporte: ahora },
    })
    return r
  })

  // Análisis IA: se ejecuta DESPUÉS de enviar la respuesta al cliente.
  // `after()` garantiza que la función completa incluso en Vercel serverless
  // (reemplaza el patrón `void fire-and-forget` que podía cortarse antes de terminar).
  after(async () => {
    await dispararAnalisisIA({
      reporteId:    reporte.id,
      novedades:    data.novedades,
      estadoBien:   data.estadoBien,
      polizaVencida: acceso.depositario.polizaVigenteHasta != null &&
                     acceso.depositario.polizaVigenteHasta.getTime() < Date.now(),
      bienCodigo:   acceso.depositario.bien.codigo,
      bienTipo:     acceso.depositario.bien.tipo,
    })
  })

  return NextResponse.json({ ok: true, reporte: { id: reporte.id, periodo: reporte.periodo } }, { status: 201 })
}

async function dispararAnalisisIA(input: {
  reporteId: string
  novedades: string
  estadoBien: FriscoEstadoFisico
  polizaVencida: boolean
  bienCodigo: string
  bienTipo: string
}): Promise<void> {
  try {
    const tenantId = await getTenantId()
    const analisis = await analizarReporte({
      tenantId,
      novedades:  input.novedades,
      estadoBien: input.estadoBien,
      contexto: {
        polizaVencida: input.polizaVencida,
        bienCodigo:    input.bienCodigo,
        bienTipo:      input.bienTipo,
      },
    })
    const prisma = await getTenantPrisma()
    await prisma.friscoReporteAnalisisIA.upsert({
      where: { reporteId: input.reporteId },
      create: {
        reporteId:       input.reporteId,
        urgencia:        analisis.urgencia,
        etiquetas:       analisis.etiquetas,
        resumen:         analisis.resumen,
        confianza:       analisis.confianza,
        modelo:          analisis.modelo,
        proveedor:       analisis.proveedor,
        promptVersion:   analisis.promptVersion,
        raw:             analisis.raw == null ? Prisma.JsonNull : (analisis.raw as Prisma.InputJsonValue),
        tokensPrompt:    analisis.tokensPrompt,
        tokensRespuesta: analisis.tokensRespuesta,
        errorMsg:        analisis.errorMsg,
      },
      update: {
        urgencia:        analisis.urgencia,
        etiquetas:       analisis.etiquetas,
        resumen:         analisis.resumen,
        confianza:       analisis.confianza,
        modelo:          analisis.modelo,
        proveedor:       analisis.proveedor,
        promptVersion:   analisis.promptVersion,
        raw:             analisis.raw == null ? Prisma.JsonNull : (analisis.raw as Prisma.InputJsonValue),
        tokensPrompt:    analisis.tokensPrompt,
        tokensRespuesta: analisis.tokensRespuesta,
        errorMsg:        analisis.errorMsg,
        revisadoPor:     null,
        revisadoEn:      null,
      },
    })
  } catch (err) {
    console.error("[frisco-reporte-ia] análisis falló:", err instanceof Error ? err.message : String(err))
  }
}
