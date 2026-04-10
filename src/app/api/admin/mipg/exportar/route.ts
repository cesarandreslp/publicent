import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"

export async function GET(req: NextRequest) {
  try {
    const auth = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (auth) return auth

    const { searchParams } = new URL(req.url)
    const anioVigencia = searchParams.get("anioVigencia")

    if (!anioVigencia) {
      return NextResponse.json({ error: "El año de vigencia es requerido" }, { status: 400 })
    }

    const prisma = await getTenantPrisma()
    
    // Obtener todas las políticas y sus evaluaciones para el año solicitado
    const politicas = await prisma.mipgPolitica.findMany({
      include: {
        dimension: true,
        evaluaciones: {
          where: { anioVigencia: parseInt(anioVigencia) },
          include: { evaluador: { select: { nombre: true, cargo: true } } }
        }
      },
      orderBy: [
        { dimension: { orden: "asc" } },
        { orden: "asc" }
      ]
    })

    // Construir tabla CSV
    let csvData = `Dimensión,Código Dimensión,Política,Código Política,Puntaje ${anioVigencia},Observaciones,Evaluador,Cargo\n`

    politicas.forEach(pol => {
      const evalActual = pol.evaluaciones[0]
      const puntaje = evalActual ? evalActual.puntaje : "Sin evaluar"
      const obs = evalActual?.observaciones ? `"${evalActual.observaciones.replace(/"/g, '""')}"` : "Ninguna"
      const evaluador = evalActual?.evaluador?.nombre || "N/A"
      const cargo = evalActual?.evaluador?.cargo || "N/A"

      // Escapar comas en campos de texto
      const dimNombre = `"${pol.dimension.nombre.replace(/"/g, '""')}"`
      const polNombre = `"${pol.nombre.replace(/"/g, '""')}"`

      csvData += `${dimNombre},${pol.dimension.codigo},${polNombre},${pol.codigo},${puntaje},${obs},"${evaluador}","${cargo}"\n`
    })

    // Añadir BOM para asegurar que Excel lea bien la codificación UTF-8
    const csvBuffer = Buffer.from('\uFEFF' + csvData, 'utf-8')

    return new NextResponse(csvBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=Reporte_FURAG_MIPG_${anioVigencia}.csv`
      }
    })

  } catch (error: any) {
    console.error("[/api/admin/mipg/exportar] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error generando reporte de exportación" }, { status: 500 })
  }
}
