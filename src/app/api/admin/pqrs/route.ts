import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { pqrsAdminSchema, validateBody } from "@/lib/validations"
import type { TipoPQRS, EstadoPQRS, PrioridadPQRS } from "@prisma/client"

// GET - Listar PQRS con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const prisma = await getTenantPrisma()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const tipo = searchParams.get("tipo") || undefined
    const estado = searchParams.get("estado") || undefined
    const prioridad = searchParams.get("prioridad") || undefined
    const vencidas = searchParams.get("vencidas") === "true"

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { radicado: { contains: search, mode: "insensitive" as const } },
          { asunto: { contains: search, mode: "insensitive" as const } },
          { nombreSolicitante: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(tipo && { tipo: tipo as unknown as TipoPQRS }),
      ...(estado && { estado: estado as unknown as EstadoPQRS }),
      ...(prioridad && { prioridad: prioridad as unknown as PrioridadPQRS }),
      ...(vencidas && {
        fechaVencimiento: {
          lt: new Date(),
        },
        estado: {
          notIn: ["RESPONDIDA", "CERRADA", "ANULADA"] as EstadoPQRS[],
        },
      }),
    }

    const [pqrs, total] = await Promise.all([
      prisma.pQRS.findMany({
        where,
        include: {
          asignado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          _count: {
            select: { historial: true },
          },
        },
        orderBy: [
          { prioridad: "desc" },
          { fechaVencimiento: "asc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.pQRS.count({ where }),
    ])

    // Calcular días restantes para cada PQRS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pqrsConDias = pqrs.map((p: { fechaVencimiento: Date | null; [key: string]: unknown }) => {
      const hoy = new Date()
      const vencimiento = p.fechaVencimiento ? new Date(p.fechaVencimiento) : null
      const diasRestantes = vencimiento
        ? Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
        : null

      return {
        ...p,
        diasRestantes,
        estaVencida: diasRestantes !== null && diasRestantes < 0,
        proximaAVencer: diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 3,
      }
    })

    return NextResponse.json({
      pqrs: pqrsConDias,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener PQRS:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener PQRS" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva PQRS (desde el panel admin)
export async function POST(request: NextRequest) {
  try {
    const { error, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (error) return error

    const body = await request.json()
    const validated = validateBody(pqrsAdminSchema, body)
    if (!validated.success) return validated.response
    const {
      tipo, asunto, descripcion, nombreCiudadano, tipoDocumento,
      numeroDocumento, email, telefono, direccion, municipio,
      anonimo, prioridad, asignadoId,
    } = validated.data

    const prisma = await getTenantPrisma()

    // Generar radicado único
    const año = new Date().getFullYear()
    const ultimoPqrs = await prisma.pQRS.findFirst({
      where: {
        radicado: {
          startsWith: `PQRS-${año}`,
        },
      },
      orderBy: { radicado: "desc" },
    })

    let consecutivo = 1
    if (ultimoPqrs) {
      const match = ultimoPqrs.radicado.match(/PQRS-\d{4}-(\d+)/)
      if (match) {
        consecutivo = parseInt(match[1]) + 1
      }
    }

    const radicado = `PQRS-${año}-${consecutivo.toString().padStart(5, "0")}`

    // Calcular fecha de vencimiento según tipo (Ley 1755 de 2015) con días HÁBILES
    const { calcularVencimientoPQRS } = await import("@/lib/dias-habiles")
    const fechaVencimiento = await calcularVencimientoPQRS(tipo, new Date())

    const pqrs = await prisma.pQRS.create({
      data: {
        radicado,
        tipo: tipo as unknown as TipoPQRS,
        asunto,
        descripcion,
        nombreSolicitante: anonimo ? "ANÓNIMO" : (nombreCiudadano ?? "Sin nombre"),
        tipoDocumento: anonimo ? "N/A" : (tipoDocumento ?? "N/A"),
        numeroDocumento: anonimo ? "N/A" : (numeroDocumento ?? "N/A"),
        email: anonimo ? "anonimo@sin-email.local" : (email ?? ""),
        telefono: anonimo ? null : (telefono ?? null),
        direccion: direccion ?? null,
        municipio: municipio ?? null,
        anonimo: anonimo || false,
        estado: "RECIBIDA",
        prioridad: (prioridad || "NORMAL") as unknown as PrioridadPQRS,
        fechaRadicacion: new Date(),
        fechaVencimiento,
        canal: "PRESENCIAL",
        registradoPorId: user!.id,
        asignadoId,
      },
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

    // Crear registro en historial
    await prisma.historialPQRS.create({
      data: {
        pqrsId: pqrs.id,
        usuarioId: user!.id,
        accion: "CREACION",
        descripcion: `PQRS radicada con número ${radicado}`,
        estadoAnterior: null,
        estadoNuevo: "RECIBIDA",
      },
    })

    return NextResponse.json(pqrs, { status: 201 })
  } catch (error) {
    console.error("Error al crear PQRS:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al crear PQRS" },
      { status: 500 }
    )
  }
}
