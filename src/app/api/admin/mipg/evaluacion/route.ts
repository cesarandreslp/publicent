import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { auth } from "@/lib/auth"
import { mipgEvaluacionSchema, validateBody } from "@/lib/validations"

// ─── GET: Obtener evaluaciones (FURAG) por vigencia ──────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const anioVigencia = searchParams.get("anioVigencia")

    if (!anioVigencia) {
      return NextResponse.json({ error: "El año de vigencia es requerido" }, { status: 400 })
    }

    const prisma = await getTenantPrisma()
    
    // Traer todas las evaluaciones del año, incluyendo a qué dimensión/política pertenecen
    const evaluaciones = await prisma.mipgEvaluacion.findMany({
      where: { anioVigencia: parseInt(anioVigencia) },
      include: {
        politica: {
          include: { dimension: true }
        },
        evaluador: {
          select: { nombre: true, email: true }
        }
      }
    })

    // Agrupación para construir el Gráfico Radial Analítico (Radar Chart)
    // Calcula el promedio de la dimensión basado en sus políticas
    const datosRadiales = Object.values(evaluaciones.reduce((acc: any, curr) => {
      const dimNombre = curr.politica.dimension.nombre
      const dimCodigo = curr.politica.dimension.codigo
      
      if (!acc[dimCodigo]) {
        acc[dimCodigo] = { dimension: dimNombre, codigo: dimCodigo, sumaPuntajes: 0, cantidad: 0, puntajePromedio: 0 }
      }
      
      acc[dimCodigo].sumaPuntajes += curr.puntaje
      acc[dimCodigo].cantidad += 1
      acc[dimCodigo].puntajePromedio = Math.round((acc[dimCodigo].sumaPuntajes / acc[dimCodigo].cantidad) * 10) / 10
      
      return acc
    }, {}))

    return NextResponse.json({
      evaluacionesTotales: evaluaciones.length,
      promedioIDI: datosRadiales.length > 0 ? 
        Math.round((datosRadiales.reduce((sum: number, dim: any) => sum + dim.puntajePromedio, 0) / datosRadiales.length) * 10) / 10 : 0,
      datosRadiales,
      detalle: evaluaciones
    })

  } catch (error: any) {
    console.error("[/api/admin/mipg/evaluacion] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al obtener las evaluaciones" }, { status: 500 })
  }
}

// ─── POST/PUT: Registrar o actualizar puntaje FURAG de una política ──────────

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"]) // Restringido solo para líderes
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await req.json()
    const validated = validateBody(mipgEvaluacionSchema, data)
    if (!validated.success) return validated.response
    const { politicaId, anioVigencia, puntaje, observaciones } = data

    if (!politicaId || !anioVigencia || puntaje === undefined) {
      return NextResponse.json(
        { error: "Política, Año y Puntaje son obligatorios" }, 
        { status: 400 }
      )
    }

    const puntajeValido = Math.max(0, Math.min(100, Number(puntaje)))

    const prisma = await getTenantPrisma()

    // UPSERT: Si ya existe evaluación para esa política y ese año, actualizar. Si no, crear.
    const evaluacion = await prisma.mipgEvaluacion.upsert({
      where: {
        politicaId_anioVigencia: { // Compound unique constraint declarado en Prisma
          politicaId,
          anioVigencia: parseInt(anioVigencia)
        }
      },
      update: {
        puntaje: puntajeValido,
        observaciones,
        evaluadorId: session.user.id
      },
      create: {
        politicaId,
        anioVigencia: parseInt(anioVigencia),
        puntaje: puntajeValido,
        observaciones,
        evaluadorId: session.user.id
      }
    })

    return NextResponse.json(evaluacion, { status: 200 })
  } catch (error: any) {
    console.error("[/api/admin/mipg/evaluacion] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al registrar la calificación" }, { status: 500 })
  }
}
