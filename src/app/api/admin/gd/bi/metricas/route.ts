/**
 * API: Métricas BI del Gestor Documental
 *
 * GET /api/admin/gd/bi/metricas?desde=&hasta=
 *
 * Todas las métricas calculadas en servidor con queries optimizados.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const desde = searchParams.get("desde")
      ? new Date(searchParams.get("desde")!)
      : new Date(new Date().getFullYear(), 0, 1) // Enero 1 del año actual
    const hasta = searchParams.get("hasta")
      ? new Date(searchParams.get("hasta")! + "T23:59:59Z")
      : new Date()

    const prisma = await getTenantPrisma()

    const rangoFiltro = { createdAt: { gte: desde, lte: hasta } }

    // 1. Total radicados en rango
    const totalRadicados = await prisma.gdRadicado.count({ where: rangoFiltro })

    // 2. % respondidos en término (≤ 15 días hábiles)
    const [respondidosTiempo, respondidosTotal] = await Promise.all([
      prisma.gdRadicado.count({
        where: {
          ...rangoFiltro,
          estado: "RESPONDIDO",
          fechaVencimiento: { not: null },
          updatedAt: { lte: prisma.gdRadicado.fields?.fechaVencimiento as any },
        },
      }).catch(() => 0),
      prisma.gdRadicado.count({
        where: { ...rangoFiltro, estado: "RESPONDIDO" },
      }),
    ])

    // Calcular respondidos en término con una query más precisa
    const respondidosConVencimiento = await prisma.gdRadicado.findMany({
      where: {
        ...rangoFiltro,
        estado: "RESPONDIDO",
        fechaVencimiento: { not: null },
      },
      select: { updatedAt: true, fechaVencimiento: true },
    })

    const enTermino = respondidosConVencimiento.filter(
      r => r.fechaVencimiento && r.updatedAt <= r.fechaVencimiento
    ).length

    const porcentajeEnTermino = respondidosConVencimiento.length > 0
      ? Math.round((enTermino / respondidosConVencimiento.length) * 100)
      : 100

    // 3. Tiempo promedio de respuesta por tipo
    const radicadosRespondidos = await prisma.gdRadicado.findMany({
      where: { ...rangoFiltro, estado: "RESPONDIDO" },
      select: { tipo: true, createdAt: true, updatedAt: true },
    })

    const tiempoPorTipo: Record<string, { total: number; count: number }> = {}
    for (const r of radicadosRespondidos) {
      const dias = (r.updatedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      if (!tiempoPorTipo[r.tipo]) tiempoPorTipo[r.tipo] = { total: 0, count: 0 }
      tiempoPorTipo[r.tipo].total += dias
      tiempoPorTipo[r.tipo].count++
    }

    const tiempoPromedioRespuesta = Object.entries(tiempoPorTipo).map(([tipo, { total, count }]) => ({
      tipo,
      promedioDias: Math.round((total / count) * 10) / 10,
      totalRespondidos: count,
    }))

    // 4. Tasa VoBo
    const [voboAprobados, voboRechazados, voboPendientes] = await Promise.all([
      prisma.gdVoBo.count({ where: { estado: "APROBADO", createdAt: { gte: desde, lte: hasta } } }),
      prisma.gdVoBo.count({ where: { estado: "RECHAZADO", createdAt: { gte: desde, lte: hasta } } }),
      prisma.gdVoBo.count({ where: { estado: "PENDIENTE", createdAt: { gte: desde, lte: hasta } } }),
    ])

    // 5. Volumen mensual (últimos 12 meses)
    const hace12Meses = new Date()
    hace12Meses.setMonth(hace12Meses.getMonth() - 12)

    const radicadosMensuales = await prisma.gdRadicado.findMany({
      where: { createdAt: { gte: hace12Meses } },
      select: { createdAt: true },
    })

    const volumenMensual: Record<string, number> = {}
    for (const r of radicadosMensuales) {
      const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`
      volumenMensual[key] = (volumenMensual[key] ?? 0) + 1
    }

    // 6. Heat map por hora del día
    const radicadosHora = await prisma.gdRadicado.findMany({
      where: rangoFiltro,
      select: { createdAt: true },
    })

    const heatMap = Array.from({ length: 24 }, (_, h) => ({
      hora: h,
      cantidad: radicadosHora.filter(r => r.createdAt.getHours() === h).length,
    }))

    // 7. Ranking dependencias por cumplimiento
    const porDependencia = await prisma.gdRadicado.groupBy({
      by: ["dependenciaId"],
      where: rangoFiltro,
      _count: true,
    })

    const dependencias = await prisma.gdTrdDependencia.findMany({
      where: { id: { in: porDependencia.map(d => d.dependenciaId) } },
      select: { id: true, codigo: true, nombre: true },
    })

    const rankingDependencias = porDependencia.map(d => {
      const dep = dependencias.find(dd => dd.id === d.dependenciaId)
      return {
        dependenciaId: d.dependenciaId,
        codigo: dep?.codigo ?? "?",
        nombre: dep?.nombre ?? "Desconocida",
        totalRadicados: d._count,
      }
    }).sort((a, b) => b.totalRadicados - a.totalRadicados)

    // 8. Por estado
    const porEstado = await prisma.gdRadicado.groupBy({
      by: ["estado"],
      where: rangoFiltro,
      _count: true,
    })

    return NextResponse.json({
      periodo: { desde, hasta },
      totalRadicados,
      porcentajeEnTermino,
      respondidosTotal,
      enTermino,
      tiempoPromedioRespuesta,
      vobo: { aprobados: voboAprobados, rechazados: voboRechazados, pendientes: voboPendientes },
      volumenMensual: Object.entries(volumenMensual).map(([mes, cantidad]) => ({ mes, cantidad })).sort((a, b) => a.mes.localeCompare(b.mes)),
      heatMap,
      rankingDependencias: rankingDependencias.slice(0, 20),
      porEstado: porEstado.map(e => ({ estado: e.estado, count: e._count })),
    })
  } catch (error: any) {
    console.error("[/api/admin/gd/bi/metricas] error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al calcular métricas" }, { status: 500 })
  }
}
