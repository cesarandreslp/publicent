/**
 * POST /api/admin/disc/procesos/[id]/avanzar
 * Avanza la máquina de estados del proceso disciplinario al siguiente estado válido.
 *
 * - Valida la transición contra la tabla de transiciones (disc-terminos.ts).
 * - Recalcula la fecha de vencimiento de la nueva etapa.
 * - Registra una DiscActuacion automática.
 * - Actualiza las fechas clave del proceso según el estado alcanzado.
 * - Si llega a fallo/ejecutoria, notifica al instructor por email.
 */

import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireDisc } from "@/lib/frisco-guard"
import { registrarAuditoria } from "@/lib/auditoria"
import { sendMail } from "@/lib/mail"
import { discAvanzarSchema, validateBody } from "@/lib/validations"
import {
  esTransicionValida,
  calcularFechaVencimientoEtapa,
  calcularTerminoEtapa,
  ACTUACION_POR_ESTADO,
} from "@/lib/disc-terminos"
import type { DiscEstadoProceso, Prisma } from "@prisma/client"

type Params = { params: Promise<{ id: string }> }

/** Mapea el estado alcanzado a la fecha clave que debe registrarse. */
function fechasClavePorEstado(estado: DiscEstadoProceso, ahora: Date): Prisma.DiscProcesoUpdateInput {
  switch (estado) {
    case 'INVESTIGACION_DISCIPLINARIA': return { fechaApertura: ahora }
    case 'PLIEGO_DE_CARGOS':            return { fechaPliegoCargos: ahora }
    case 'DESCARGOS':                   return { fechaDescargos: ahora }
    case 'FALLO_PRIMERA_INSTANCIA':     return { fechaFallo: ahora }
    case 'EJECUTORIADO':                return { fechaEjecutoria: ahora }
    default:                            return {}
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params
  const body = await req.json().catch(() => null)
  const v = validateBody(discAvanzarSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const proceso = await prisma.discProceso.findUnique({
    where: { id },
    include: { instructor: { select: { email: true, nombre: true, apellido: true } } },
  })
  if (!proceso) return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 })

  const { nuevoEstado, motivoAvance } = v.data

  if (!esTransicionValida(proceso.estado, nuevoEstado)) {
    return NextResponse.json(
      { error: `Transición no permitida: ${proceso.estado} → ${nuevoEstado}` },
      { status: 409 }
    )
  }

  const ahora = new Date()
  const fechaVencimiento = await calcularFechaVencimientoEtapa(ahora, nuevoEstado, proceso.tipo)
  const terminoDiasHabiles = calcularTerminoEtapa(nuevoEstado, proceso.tipo)
  const descripcionActuacion = motivoAvance?.trim()
    ? `${ACTUACION_POR_ESTADO[nuevoEstado]} — ${motivoAvance.trim()}`
    : ACTUACION_POR_ESTADO[nuevoEstado]

  const actualizado = await prisma.$transaction(async (tx) => {
    const p = await tx.discProceso.update({
      where: { id },
      data: {
        estado: nuevoEstado,
        fechaVencimiento,
        terminoDiasHabiles: terminoDiasHabiles || null,
        ...fechasClavePorEstado(nuevoEstado, ahora),
      },
    })
    await tx.discActuacion.create({
      data: {
        procesoId:   id,
        tipo:        nuevoEstado,
        descripcion: descripcionActuacion,
        usuarioId:   guard.user!.id,
      },
    })
    return p
  })

  try {
    await registrarAuditoria({
      accion: 'UPDATE',
      entidad: 'DiscProceso',
      entidadId: id,
      usuarioId: guard.user?.id,
      descripcion: `Avance del proceso ${proceso.numero}: ${proceso.estado} → ${nuevoEstado}`,
    })
  } catch { /* no crítico */ }

  // Notificar al instructor cuando se llega a fallo o superior.
  const estadosNotificables: DiscEstadoProceso[] = ['FALLO_PRIMERA_INSTANCIA', 'FALLO_SEGUNDA_INSTANCIA', 'EJECUTORIADO']
  if (estadosNotificables.includes(nuevoEstado) && proceso.instructor?.email) {
    sendMail({
      to: proceso.instructor.email,
      subject: `Proceso disciplinario ${proceso.numero} — ${ACTUACION_POR_ESTADO[nuevoEstado]}`,
      html: `
        <p>Estimado(a) ${proceso.instructor.nombre} ${proceso.instructor.apellido},</p>
        <p>El proceso disciplinario <strong>${proceso.numero}</strong> contra
        <strong>${proceso.disciplinadoNombre}</strong> ha alcanzado la etapa:
        <strong>${ACTUACION_POR_ESTADO[nuevoEstado]}</strong>.</p>
        ${motivoAvance ? `<p><strong>Observación:</strong> ${motivoAvance}</p>` : ''}
        <p>Ingrese al sistema para revisar el detalle y registrar las actuaciones correspondientes.</p>
      `,
    }).catch((e) => console.error('[disc/avanzar] Error email instructor:', e instanceof Error ? e.message : e))
  }

  return NextResponse.json(actualizado)
}
