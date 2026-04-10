import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { generarNumeroRadicado } from "@/lib/gd-consecutivo"
import { auth } from "@/lib/auth"
import { calcularVencimientoPQRS, calcularFechaVencimientoHabil, PLAZOS_HABILES } from "@/lib/dias-habiles"
import { validarCuotaRadicados, incrementarConteoRadicados } from "@/lib/plan-guard"
import { GdTipoRadicado, GdMedioRecepcion, GdPrioridad } from "@prisma/client"
import { gdRadicadoCreateSchema, validateBody } from "@/lib/validations"

// ─── GET: Listar Radicados con filtros ───────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get("tipo")
    const estado = searchParams.get("estado")
    const dependenciaId = searchParams.get("dependenciaId")
    const busqueda = searchParams.get("q")
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "25")
    const skip = (page - 1) * limit

    const prisma = await getTenantPrisma()

    const where: any = {}
    if (tipo) where.tipo = tipo
    if (estado) where.estado = estado
    if (dependenciaId) where.dependenciaId = dependenciaId
    if (busqueda) {
      where.OR = [
        { numero: { contains: busqueda, mode: "insensitive" } },
        { asunto: { contains: busqueda, mode: "insensitive" } },
      ]
    }

    const [radicados, total] = await Promise.all([
      prisma.gdRadicado.findMany({
        where,
        include: {
          dependencia: { select: { codigo: true, nombre: true } },
          tramitador: { select: { nombre: true, apellido: true, cargo: true } },
          remitentes: { select: { nombre: true, tipoPersona: true } },
          _count: { select: { documentos: true, transacciones: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.gdRadicado.count({ where }),
    ])

    return NextResponse.json({
      radicados,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: any) {
    console.error("[/api/admin/gd/radicados] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al listar radicados" }, { status: 500 })
  }
}

// ─── POST: Crear Radicado + Consecutivo Oficial ──────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const data = await req.json()
    const {
      tipo,
      medioRecepcion,
      asunto,
      folios,
      prioridad,
      observacion,
      dependenciaId,
      subserieId,
      tipoDocumentalId,
      tramitadorId,
      // Remitente principal
      remitente,
      // Opcionales
      pqrsId,
    } = data

    if (!tipo || !asunto || !dependenciaId || !remitente?.nombre) {
      return NextResponse.json(
        { error: "Tipo, asunto, dependencia y remitente son obligatorios" },
        { status: 400 }
      )
    }

    const prisma = await getTenantPrisma()

    // Obtener el código de la dependencia para el consecutivo
    const dependencia = await prisma.gdTrdDependencia.findUnique({
      where: { id: dependenciaId },
      select: { codigo: true },
    })

    if (!dependencia) {
      return NextResponse.json({ error: "Dependencia no encontrada" }, { status: 404 })
    }

    // Validar cuota del plan antes de crear
    const errorCuota = await validarCuotaRadicados()
    if (errorCuota) {
      return NextResponse.json({ error: errorCuota }, { status: 429 })
    }

    // Generar número oficial (transacción atómica)
    const numero = await generarNumeroRadicado(tipo as GdTipoRadicado, dependencia.codigo)

    // Calcular fecha de vencimiento en DÍAS HÁBILES (Ley Emiliani)
    const fechaVencimiento = await calcularFechaVencimientoHabil(
      PLAZOS_HABILES.DEFAULT,
      new Date()
    )

    // Crear radicado completo en una transacción
    const radicado = await prisma.$transaction(async (tx) => {
      const nuevo = await tx.gdRadicado.create({
        data: {
          numero,
          tipo: tipo as GdTipoRadicado,
          medioRecepcion: (medioRecepcion as GdMedioRecepcion) ?? "WEB",
          asunto,
          folios: folios ?? 1,
          prioridad: (prioridad as GdPrioridad) ?? "NORMAL",
          fechaVencimiento,
          observacion,
          dependenciaId,
          subserieId: subserieId ?? null,
          tipoDocumentalId: tipoDocumentalId ?? null,
          tramitadorId: tramitadorId ?? session.user.id,
          creadorId: session.user.id,
          // Puente PQRS
          ...(pqrsId ? { pqrs: { connect: { id: pqrsId } } } : {}),
          // Remitente principal
          remitentes: {
            create: {
              tipoPersona: remitente.tipoPersona ?? "CIUDADANO",
              nombre: remitente.nombre,
              documento: remitente.documento,
              email: remitente.email,
              telefono: remitente.telefono,
              direccion: remitente.direccion,
              municipio: remitente.municipio,
            },
          },
        },
        include: {
          dependencia: true,
          remitentes: true,
        },
      })

      // Primer log de transacción: RADICACION
      await tx.gdLogTransaccion.create({
        data: {
          accion: "RADICACION",
          descripcion: `Radicado creado por ${session.user.name ?? session.user.email}`,
          estadoNuevo: "EN_TRAMITE",
          usuarioId: session.user.id,
          radicadoId: nuevo.id,
        },
      })

      return nuevo
    })

    // Incrementar conteo de radicados del plan
    await incrementarConteoRadicados()

    return NextResponse.json(radicado, { status: 201 })
  } catch (error: any) {
    console.error("[/api/admin/gd/radicados] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al crear radicado" }, { status: 500 })
  }
}
