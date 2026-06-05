import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma, getTenantId } from "@/lib/tenant"
import { requireIntegracionesEstado } from "@/lib/frisco-guard"
import { getSecopConfig, consultarProcesosSecop } from "@/lib/integraciones/secop"

/**
 * POST /api/admin/contratacion/sincronizar-secop
 * Concilia los procesos internos con los publicados en SECOP II:
 * trae los procesos de la entidad desde datos.gov.co (paginando) y, para los
 * que coinciden por referencia == numero interno, guarda el id/URL/fase de SECOP
 * en el proceso interno. Devuelve el resumen de la conciliación.
 */
export async function POST(_: NextRequest) {
  const { error } = await requireIntegracionesEstado(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const tenantId = await getTenantId()
  const config = await getSecopConfig(tenantId)
  if (!config)
    return NextResponse.json(
      { error: 'SECOP no configurado para este tenant.' },
      { status: 422 }
    )

  const prisma = await getTenantPrisma()

  try {
    // Traer todos los procesos de la entidad (paginado, tope defensivo 2000)
    const secopProcesos: Awaited<ReturnType<typeof consultarProcesosSecop>> = []
    const pageSize = 200
    for (let offset = 0; offset < 2000; offset += pageSize) {
      const page = await consultarProcesosSecop(config, { limit: pageSize, offset })
      secopProcesos.push(...page)
      if (page.length < pageSize) break
    }

    // Indexar por referencia para match rápido
    const porReferencia = new Map(secopProcesos.map(p => [p.referencia, p]))

    const internos = await prisma.conProceso.findMany({ select: { id: true, numero: true } })
    const ahora = new Date()
    let conciliados = 0

    for (const interno of internos) {
      const match = porReferencia.get(interno.numero)
      if (!match) continue
      await prisma.conProceso.update({
        where: { id: interno.id },
        data: {
          secopId:     match.idProceso || null,
          secopUrl:    match.url,
          secopEstado: match.fase ? `SECOP: ${match.fase}` : 'PUBLICADO',
          secopSyncAt: ahora,
        },
      }).catch(() => null)
      conciliados++
    }

    const referenciasInternas = new Set(internos.map(i => i.numero))
    const soloEnSecop = secopProcesos.filter(p => !referenciasInternas.has(p.referencia)).length

    return NextResponse.json({
      totalSecop:   secopProcesos.length,
      totalInterno: internos.length,
      conciliados,
      soloEnSecop,
      mensaje: `Conciliación completada: ${conciliados} proceso(s) interno(s) vinculado(s) a SECOP. ${soloEnSecop} en SECOP sin registro interno.`,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error sincronizando con SECOP II' },
      { status: 502 }
    )
  }
}
