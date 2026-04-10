/**
 * API: Reportes del Gestor Documental
 *
 * GET — Genera CSV con radicados filtrados para exportación
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
    const formato = searchParams.get("formato") ?? "csv"
    const tipo = searchParams.get("tipo")
    const estado = searchParams.get("estado")
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")
    const dependenciaId = searchParams.get("dependenciaId")

    const prisma = await getTenantPrisma()

    // Construir filtros
    const where: Record<string, unknown> = {}
    if (tipo) where.tipo = tipo
    if (estado) where.estado = estado
    if (dependenciaId) where.dependenciaId = dependenciaId
    if (desde || hasta) {
      where.createdAt = {
        ...(desde ? { gte: new Date(desde) } : {}),
        ...(hasta ? { lte: new Date(hasta + "T23:59:59Z") } : {}),
      }
    }

    const radicados = await prisma.gdRadicado.findMany({
      where,
      include: {
        dependencia: { select: { codigo: true, nombre: true } },
        tramitador: { select: { nombre: true, apellido: true } },
        remitentes: { select: { nombre: true, tipoPersona: true } },
        _count: { select: { documentos: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10000, // Límite seguro para exportación
    })

    if (formato === "csv") {
      // Generar CSV
      const BOM = "\uFEFF" // UTF-8 BOM para Excel
      const cabeceras = [
        "Número", "Tipo", "Estado", "Prioridad",
        "Asunto", "Dependencia", "Tramitador",
        "Remitente Principal", "Fecha Radicación",
        "Fecha Vencimiento", "Documentos",
      ].join(",")

      const filas = radicados.map(r => [
        `"${r.numero}"`,
        r.tipo,
        r.estado,
        r.prioridad,
        `"${(r.asunto || "").replace(/"/g, '""')}"`,
        `"${r.dependencia.codigo} - ${r.dependencia.nombre}"`,
        `"${r.tramitador ? r.tramitador.nombre + " " + r.tramitador.apellido : "Sin asignar"}"`,
        `"${r.remitentes[0]?.nombre || "N/A"}"`,
        new Date(r.createdAt).toLocaleDateString("es-CO"),
        r.fechaVencimiento ? new Date(r.fechaVencimiento).toLocaleDateString("es-CO") : "N/A",
        r._count.documentos,
      ].join(","))

      const csv = BOM + cabeceras + "\n" + filas.join("\n")

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="radicados_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // JSON por defecto
    return NextResponse.json({
      total: radicados.length,
      radicados,
      filtros: { tipo, estado, desde, hasta, dependenciaId },
    })
  } catch (error: any) {
    console.error("[/api/admin/gd/reportes] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 })
  }
}
