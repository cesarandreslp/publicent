/**
 * POST /api/admin/ventanilla/[id]/reasignar
 * Reasigna un radicado a otro funcionario o dependencia.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from '@/lib/tenant'
import { auth } from '@/lib/auth'
import { sendMail } from '@/lib/mail'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const vuActivo = await isTenantModuleActive(MODULO_IDS.VENTANILLA_UNICA)
  if (!vuActivo) return NextResponse.json({ error: 'Módulo VU no activo' }, { status: 403 })

  const { id: pqrsId } = await params

  let body: { funcionarioId: string; motivo?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { funcionarioId, motivo } = body
  if (!funcionarioId) return NextResponse.json({ error: 'funcionarioId requerido' }, { status: 400 })

  try {
    const prisma = await getTenantPrisma()
    const reasignadorId = (session.user as any).id as string

    const [pqrs, nuevoFuncionario] = await Promise.all([
      prisma.pQRS.findUnique({
        where: { id: pqrsId },
        select: { id: true, radicado: true, asunto: true, asignadoId: true },
      }),
      prisma.usuario.findUnique({
        where: { id: funcionarioId },
        select: { id: true, nombre: true, apellido: true, email: true },
      }),
    ])

    if (!pqrs)           return NextResponse.json({ error: 'Radicado no encontrado' }, { status: 404 })
    if (!nuevoFuncionario) return NextResponse.json({ error: 'Funcionario destino no encontrado' }, { status: 404 })

    await prisma.pQRS.update({
      where: { id: pqrsId },
      data:  { asignadoId: funcionarioId, estado: 'EN_TRAMITE' as any },
    })

    await prisma.historialPQRS.create({
      data: {
        pqrsId,
        accion:      'REASIGNACION',
        descripcion: motivo
          ? `Reasignado a ${nuevoFuncionario.nombre} ${nuevoFuncionario.apellido}. Motivo: ${motivo}`
          : `Reasignado a ${nuevoFuncionario.nombre} ${nuevoFuncionario.apellido}`,
        usuarioId: reasignadorId,
      },
    })

    // Notificar al nuevo funcionario
    if (nuevoFuncionario.email) {
      await sendMail({
        to:      nuevoFuncionario.email,
        subject: `Radicado ${pqrs.radicado} asignado a usted`,
        html: `
          <p>Estimado/a ${nuevoFuncionario.nombre},</p>
          <p>Se le ha asignado el radicado <strong>${pqrs.radicado}</strong> — ${pqrs.asunto}.</p>
          ${motivo ? `<p><strong>Motivo de reasignación:</strong> ${motivo}</p>` : ''}
          <p>Ingrese al panel de administración para gestionar esta solicitud.</p>
        `,
      }).catch(e => console.error('[reasignar] Error enviando correo:', e instanceof Error ? e.message : e))
    }

    return NextResponse.json({
      mensaje: `Radicado reasignado a ${nuevoFuncionario.nombre} ${nuevoFuncionario.apellido}`,
    })
  } catch (err) {
    console.error('[POST reasignar]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
