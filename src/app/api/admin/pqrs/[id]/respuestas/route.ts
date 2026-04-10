import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { pqrsRespuestaSchema, validateBody } from "@/lib/validations"

interface Params {
  params: Promise<{ id: string }>
}

// POST - Agregar respuesta a una PQRS
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const { id } = await params
    const body = await request.json()
    const validated = validateBody(pqrsRespuestaSchema, body)
    if (!validated.success) return validated.response
    const { contenido, esRespuestaFinal, esInterna } = body

    if (!contenido) {
      return NextResponse.json(
        { error: "El contenido es requerido" },
        { status: 400 }
      )
    }

    // Verificar que la PQRS existe
    const pqrs = await prisma.pQRS.findUnique({
      where: { id },
    })

    if (!pqrs) {
      return NextResponse.json(
        { error: "PQRS no encontrada" },
        { status: 404 }
      )
    }

    const estadoAnterior = pqrs.estado

    // Si es respuesta final, actualizar estado y guardar texto en PQRS
    if (esRespuestaFinal) {
      await prisma.pQRS.update({
        where: { id },
        data: {
          estado: "RESPONDIDA",
          respuesta: contenido,
          fechaRespuesta: new Date(),
        },
      })
    }

    // Registrar en historial (actúa como tabla de respuestas)
    const registro = await prisma.historialPQRS.create({
      data: {
        pqrsId: id,
        usuarioId: user!.id,
        accion: esRespuestaFinal
          ? "RESPUESTA_FINAL"
          : esInterna
          ? "NOTA_INTERNA"
          : "RESPUESTA",
        descripcion: contenido,
        estadoAnterior: esRespuestaFinal ? estadoAnterior : undefined,
        estadoNuevo: esRespuestaFinal ? "RESPONDIDA" : undefined,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    return NextResponse.json(registro, { status: 201 })
  } catch (error) {
    console.error("Error al crear respuesta:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al crear respuesta" },
      { status: 500 }
    )
  }
}

// GET - Obtener respuestas de una PQRS
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const { id } = await params

    const respuestas = await prisma.historialPQRS.findMany({
      where: {
        pqrsId: id,
        accion: { in: ["RESPUESTA", "RESPUESTA_FINAL", "NOTA_INTERNA"] },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(respuestas)
  } catch (error) {
    console.error("Error al obtener respuestas:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener respuestas" },
      { status: 500 }
    )
  }
}
