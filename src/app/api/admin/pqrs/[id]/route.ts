import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { pqrsUpdateSchema, validateBody } from "@/lib/validations"

interface Params {
  params: Promise<{ id: string }>
}

// GET - Obtener una PQRS por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (error) return error

    const prisma = await getTenantPrisma()

    const { id } = await params

    const pqrs = await prisma.pQRS.findUnique({
      where: { id },
      include: {
        asignado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        registradoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        historial: {
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
        },
      },
    })

    if (!pqrs) {
      return NextResponse.json(
        { error: "PQRS no encontrada" },
        { status: 404 }
      )
    }

    // Calcular información adicional
    const hoy = new Date()
    const vencimiento = pqrs.fechaVencimiento ? new Date(pqrs.fechaVencimiento) : null
    const diasRestantes = vencimiento
      ? Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
      : null

    return NextResponse.json({
      ...pqrs,
      diasRestantes,
      estaVencida: diasRestantes !== null && diasRestantes < 0,
      proximaAVencer: diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 3,
    })
  } catch (error) {
    console.error("Error al obtener PQRS:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener PQRS" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una PQRS
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const validated = validateBody(pqrsUpdateSchema, body)
    if (!validated.success) return validated.response

    const {
      estado,
      prioridad,
      asignadoId,
      observacionesInternas,
    } = body

    const prisma = await getTenantPrisma()
    // Obtener PQRS actual
    const pqrsActual = await prisma.pQRS.findUnique({
      where: { id },
    })

    if (!pqrsActual) {
      return NextResponse.json(
        { error: "PQRS no encontrada" },
        { status: 404 }
      )
    }

    const estadoAnterior = pqrsActual.estado

    // Preparar datos de actualización
    const updateData: Record<string, any> = {}

    if (estado && estado !== estadoAnterior) {
      updateData.estado = estado
      
      // Si se está resolviendo, registrar fecha
      if (estado === "RESUELTO") {
        updateData.fechaResolucion = new Date()
      }
    }

    if (prioridad) {
      updateData.prioridad = prioridad
    }

    if (asignadoId !== undefined) {
      updateData.asignadoId = asignadoId || null
    }

    if (observacionesInternas !== undefined) {
      updateData.observacionesInternas = observacionesInternas
    }

    const pqrs = await prisma.pQRS.update({
      where: { id },
      data: updateData,
      include: {
        asignado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    // Registrar en historial si hubo cambio de estado
    if (estado && estado !== estadoAnterior) {
      await prisma.historialPQRS.create({
        data: {
          pqrsId: id,
          usuarioId: user!.id,
          accion: "CAMBIO_ESTADO",
          descripcion: `Estado cambiado de ${estadoAnterior} a ${estado}`,
          estadoAnterior,
          estadoNuevo: estado,
        },
      })
    }

    // Registrar cambio de asignación
    if (asignadoId !== undefined && asignadoId !== pqrsActual.asignadoId) {
      await prisma.historialPQRS.create({
        data: {
          pqrsId: id,
          usuarioId: user!.id,
          accion: "ASIGNACION",
          descripcion: asignadoId
            ? `PQRS asignada a nuevo responsable`
            : `PQRS desasignada`,
        },
      })
    }

    return NextResponse.json(pqrs)
  } catch (error) {
    console.error("Error al actualizar PQRS:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al actualizar PQRS" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una PQRS (solo admin)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
    if (error) return error

    const prisma = await getTenantPrisma()

    const { id } = await params

    const existingPqrs = await prisma.pQRS.findUnique({
      where: { id },
    })

    if (!existingPqrs) {
      return NextResponse.json(
        { error: "PQRS no encontrada" },
        { status: 404 }
      )
    }

    // No permitir eliminar PQRS que ya tienen respuestas
    const tieneHistorial = await prisma.historialPQRS.count({
      where: { pqrsId: id },
    })

    if (tieneHistorial > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una PQRS con historial registrado" },
        { status: 400 }
      )
    }

    await prisma.pQRS.delete({
      where: { id },
    })

    return NextResponse.json({ message: "PQRS eliminada correctamente" })
  } catch (error) {
    console.error("Error al eliminar PQRS:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al eliminar PQRS" },
      { status: 500 }
    )
  }
}
