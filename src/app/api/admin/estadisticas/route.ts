import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { startOfMonth, subMonths, format } from "date-fns"

// GET - Obtener estadísticas del dashboard
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (error) return error

    const prisma = await getTenantPrisma()

    // Estadísticas generales
    const [
      totalUsuarios,
      totalNoticias,
      totalDocumentos,
      totalPQRS,
      pqrsPendientes,
      transparenciaItems,
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.noticia.count(),
      prisma.documento.count(),
      prisma.pQRS.count(),
      prisma.pQRS.count({
        where: {
          estado: { in: ["RECIBIDA", "EN_TRAMITE"] },
        },
      }),
      prisma.itemTransparencia.count(),
    ])

    // PQRS por tipo
    const pqrsPorTipo = await prisma.pQRS.groupBy({
      by: ["tipo"],
      _count: { id: true },
    })

    // PQRS por estado
    const pqrsPorEstado = await prisma.pQRS.groupBy({
      by: ["estado"],
      _count: { id: true },
    })

    // PQRS de los últimos 6 meses
    const pqrsMensuales = []
    for (let i = 5; i >= 0; i--) {
      const fecha = subMonths(new Date(), i)
      const inicio = startOfMonth(fecha)
      const fin = new Date(inicio)
      fin.setMonth(fin.getMonth() + 1)

      const count = await prisma.pQRS.count({
        where: {
          createdAt: {
            gte: inicio,
            lt: fin,
          },
        },
      })

      pqrsMensuales.push({
        mes: format(fecha, "MMM"),
        mesCompleto: format(fecha, "MMMM yyyy"),
        cantidad: count,
      })
    }

    // Noticias por categoría
    const noticiasPorCategoria = await prisma.noticia.groupBy({
      by: ["categoriaId"],
      _count: { id: true },
    })

    // Obtener nombres de categorías
    const categorias = await prisma.categoriaNoticias.findMany({
      select: { id: true, nombre: true },
    })

    const noticiasConCategoria = noticiasPorCategoria.map((n: { categoriaId: string | null; _count: { id: number } }) => ({
      categoria:
        categorias.find((c: { id: string; nombre: string }) => c.id === n.categoriaId)?.nombre || "Sin categoría",
      cantidad: n._count.id,
    }))

    // Documentos por categoría
    const documentosPorCategoria = await prisma.documento.groupBy({
      by: ["categoria"],
      _count: { id: true },
    })

    // Cumplimiento de transparencia
    const transparenciaPorCategoria = await prisma.categoriaTransparencia.findMany({
      include: {
        subcategorias: {
          include: {
            items: {
              select: { id: true, cumplido: true },
            },
          },
        },
      },
    })

    const cumplimientoTransparencia = transparenciaPorCategoria.map((cat) => {
      const allItems = cat.subcategorias.flatMap((s) => s.items)
      const total = allItems.length
      const cumplidos = allItems.filter((i) => i.cumplido).length
      const porcentaje = total > 0 ? Math.round((cumplidos / total) * 100) : 0
      return {
        categoria: cat.nombre,
        codigoITA: cat.codigoITA,
        total,
        cumplidos,
        porcentaje,
      }
    })

    // Porcentaje de cumplimiento general ITA
    const totalTransparencia = cumplimientoTransparencia.reduce(
      (acc: number, c: { total: number }) => acc + c.total,
      0
    )
    const totalCumplidos = cumplimientoTransparencia.reduce(
      (acc: number, c: { cumplidos: number }) => acc + c.cumplidos,
      0
    )
    const porcentajeCumplimientoITA =
      totalTransparencia > 0
        ? Math.round((totalCumplidos / totalTransparencia) * 100)
        : 0

    // Usuarios activos por rol
    const usuariosPorRol = await prisma.usuario.groupBy({
      by: ["rolId"],
      where: { activo: true },
      _count: { id: true },
    })

    // Actividad reciente (últimos 30 días)
    const hace30Dias = new Date()
    hace30Dias.setDate(hace30Dias.getDate() - 30)

    const [noticiasRecientes, documentosRecientes, pqrsRecientes] =
      await Promise.all([
        prisma.noticia.count({
          where: { createdAt: { gte: hace30Dias } },
        }),
        prisma.documento.count({
          where: { createdAt: { gte: hace30Dias } },
        }),
        prisma.pQRS.count({
          where: { createdAt: { gte: hace30Dias } },
        }),
      ])

    // PQRS próximos a vencer (en los próximos 3 días)
    const en3Dias = new Date()
    en3Dias.setDate(en3Dias.getDate() + 3)

    const pqrsProximosVencer = await prisma.pQRS.count({
      where: {
        estado: { in: ["RECIBIDA", "EN_TRAMITE"] },
        fechaVencimiento: {
          lte: en3Dias,
          gte: new Date(),
        },
      },
    })

    // PQRS vencidos
    const pqrsVencidos = await prisma.pQRS.count({
      where: {
        estado: { in: ["RECIBIDA", "EN_TRAMITE"] },
        fechaVencimiento: {
          lt: new Date(),
        },
      },
    })

    return NextResponse.json({
      resumen: {
        totalUsuarios,
        totalNoticias,
        totalDocumentos,
        totalPQRS,
        pqrsPendientes,
        transparenciaItems,
        porcentajeCumplimientoITA,
        pqrsProximosVencer,
        pqrsVencidos,
      },
      actividad: {
        noticiasRecientes,
        documentosRecientes,
        pqrsRecientes,
      },
      graficos: {
        pqrsPorTipo: pqrsPorTipo.map((p: { tipo: string; _count: { id: number } }) => ({
          tipo: p.tipo,
          cantidad: p._count.id,
        })),
        pqrsPorEstado: pqrsPorEstado.map((p: { estado: string; _count: { id: number } }) => ({
          estado: p.estado,
          cantidad: p._count.id,
        })),
        pqrsMensuales,
        noticiasConCategoria,
        documentosPorCategoria: documentosPorCategoria.map((d: { categoria: string; _count: { id: number } }) => ({
          categoria: d.categoria,
          cantidad: d._count.id,
        })),
        cumplimientoTransparencia,
        usuariosPorRol: usuariosPorRol.map((u: { rolId: string; _count: { id: number } }) => ({
          rol: u.rolId,
          cantidad: u._count.id,
        })),
      },
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    )
  }
}
