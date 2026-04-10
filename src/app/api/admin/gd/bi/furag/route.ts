/**
 * GET /api/admin/gd/bi/furag
 *
 * Genera un reporte FURAG en formato XLSX con las métricas del GD.
 * Usa ExcelJS para generar el archivo en servidor.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import ExcelJS from "exceljs"

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const prisma = await getTenantPrisma()
    const anio = new Date().getFullYear()
    const desde = new Date(anio, 0, 1)
    const hasta = new Date()
    const rangoFiltro = { createdAt: { gte: desde, lte: hasta } }

    // ── Métricas ───────────────────────────────────────────────────────────

    const totalRadicados = await prisma.gdRadicado.count({ where: rangoFiltro })

    // Respondidos en término
    const respondidos = await prisma.gdRadicado.findMany({
      where: { ...rangoFiltro, estado: "RESPONDIDO", fechaVencimiento: { not: null } },
      select: { updatedAt: true, fechaVencimiento: true },
    })
    const enTermino = respondidos.filter(
      (r) => r.fechaVencimiento && r.updatedAt <= r.fechaVencimiento
    ).length
    const pctTermino = respondidos.length > 0
      ? Math.round((enTermino / respondidos.length) * 100)
      : 100

    // Por estado
    const porEstado = await prisma.gdRadicado.groupBy({
      by: ["estado"],
      where: rangoFiltro,
      _count: true,
    })

    // VoBo
    const [voboAprobados, voboRechazados, voboPendientes] = await Promise.all([
      prisma.gdVoBo.count({ where: { estado: "APROBADO", ...rangoFiltro } }),
      prisma.gdVoBo.count({ where: { estado: "RECHAZADO", ...rangoFiltro } }),
      prisma.gdVoBo.count({ where: { estado: "PENDIENTE", ...rangoFiltro } }),
    ])

    // Ranking dependencias
    const porDep = await prisma.gdRadicado.groupBy({
      by: ["dependenciaId"],
      where: rangoFiltro,
      _count: true,
    })
    const deps = await prisma.gdTrdDependencia.findMany({
      where: { id: { in: porDep.map((d) => d.dependenciaId) } },
      select: { id: true, codigo: true, nombre: true },
    })
    const ranking = porDep
      .map((d) => {
        const dep = deps.find((dd) => dd.id === d.dependenciaId)
        return { codigo: dep?.codigo ?? "?", nombre: dep?.nombre ?? "—", total: d._count }
      })
      .sort((a, b) => b.total - a.total)

    // Volumen mensual (12 meses)
    const hace12 = new Date()
    hace12.setMonth(hace12.getMonth() - 12)
    const radMensuales = await prisma.gdRadicado.findMany({
      where: { createdAt: { gte: hace12 } },
      select: { createdAt: true },
    })
    const volMensual: Record<string, number> = {}
    for (const r of radMensuales) {
      const k = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`
      volMensual[k] = (volMensual[k] ?? 0) + 1
    }

    // ── Generar XLSX ──────────────────────────────────────────────────────

    const wb = new ExcelJS.Workbook()
    wb.creator = "PublicEnt2 — SGDEA"
    wb.created = new Date()

    // Hoja 1: Resumen FURAG
    const ws1 = wb.addWorksheet("Resumen FURAG")
    ws1.columns = [
      { header: "Métrica", key: "metrica", width: 40 },
      { header: "Valor", key: "valor", width: 20 },
    ]
    ws1.getRow(1).font = { bold: true }
    ws1.addRow({ metrica: "Año de reporte", valor: anio })
    ws1.addRow({ metrica: "Total radicados", valor: totalRadicados })
    ws1.addRow({ metrica: "Respondidos", valor: respondidos.length })
    ws1.addRow({ metrica: "Respondidos en término", valor: enTermino })
    ws1.addRow({ metrica: "% en término", valor: `${pctTermino}%` })
    ws1.addRow({ metrica: "VoBo aprobados", valor: voboAprobados })
    ws1.addRow({ metrica: "VoBo rechazados", valor: voboRechazados })
    ws1.addRow({ metrica: "VoBo pendientes", valor: voboPendientes })
    ws1.addRow({})
    ws1.addRow({ metrica: "─── Desglose por Estado ───", valor: "" })
    for (const e of porEstado) {
      ws1.addRow({ metrica: `  Estado: ${e.estado}`, valor: e._count })
    }

    // Hoja 2: Por Dependencia
    const ws2 = wb.addWorksheet("Por Dependencia")
    ws2.columns = [
      { header: "Código", key: "codigo", width: 15 },
      { header: "Dependencia", key: "nombre", width: 40 },
      { header: "Total Radicados", key: "total", width: 18 },
      { header: "% del Total", key: "pct", width: 15 },
    ]
    ws2.getRow(1).font = { bold: true }
    for (const d of ranking) {
      ws2.addRow({
        codigo: d.codigo,
        nombre: d.nombre,
        total: d.total,
        pct: totalRadicados > 0 ? `${Math.round((d.total / totalRadicados) * 100)}%` : "0%",
      })
    }

    // Hoja 3: Volumen Mensual
    const ws3 = wb.addWorksheet("Volumen Mensual")
    ws3.columns = [
      { header: "Mes", key: "mes", width: 15 },
      { header: "Radicados", key: "cantidad", width: 15 },
    ]
    ws3.getRow(1).font = { bold: true }
    const mesesOrdenados = Object.entries(volMensual).sort(([a], [b]) => a.localeCompare(b))
    for (const [mes, cantidad] of mesesOrdenados) {
      ws3.addRow({ mes, cantidad })
    }

    // ── Devolver archivo ──────────────────────────────────────────────────

    const buffer = await wb.xlsx.writeBuffer()
    const uint8 = new Uint8Array(buffer as ArrayBuffer)

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="FURAG-${anio}.xlsx"`,
      },
    })
  } catch (err) {
    console.error("[FURAG XLSX]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error generando reporte FURAG" }, { status: 500 })
  }
}
