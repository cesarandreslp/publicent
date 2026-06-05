/**
 * POST /api/admin/ventanilla/[id]/responder
 * Emite una respuesta oficial a un radicado PQRSD.
 * Soporta los 6 tipos de respuesta formales definidos en la normativa colombiana.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantPrisma, getTenantId, isTenantModuleActive, MODULO_IDS } from '@/lib/tenant'
import { auth } from '@/lib/auth'
import { sendMail } from '@/lib/mail'
import { notificarCiudadano } from '@/lib/notifications'
import type { VuTipoRespuesta } from '@prisma/client'

const TIPOS_VALIDOS: VuTipoRespuesta[] = [
  'COMPETENTE', 'REMISION', 'INSISTENCIA', 'TRASLADO', 'DESISTIMIENTO', 'IMPROCEDENTE'
]

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const vuActivo = await isTenantModuleActive(MODULO_IDS.VENTANILLA_UNICA)
  if (!vuActivo) {
    return NextResponse.json({ error: 'Módulo Ventanilla Única no activo' }, { status: 403 })
  }

  const { id: pqrsId } = await params

  let body: {
    tipo:            string
    contenido:       string
    archivoUrl?:     string
    entidadDestino?: string
    radicadoDestino?: string
    firmadoPor?:     string
  }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { tipo, contenido, archivoUrl, entidadDestino, radicadoDestino, firmadoPor } = body

  if (!TIPOS_VALIDOS.includes(tipo as VuTipoRespuesta)) {
    return NextResponse.json({ error: `Tipo inválido. Válidos: ${TIPOS_VALIDOS.join(', ')}` }, { status: 400 })
  }
  if (!contenido?.trim()) {
    return NextResponse.json({ error: 'El contenido de la respuesta es obligatorio' }, { status: 400 })
  }
  if (['REMISION', 'TRASLADO'].includes(tipo) && !entidadDestino) {
    return NextResponse.json({ error: 'entidadDestino es obligatorio para REMISION y TRASLADO' }, { status: 400 })
  }

  try {
    const prisma   = await getTenantPrisma()
    const usuarioId = (session.user as any).id as string

    const pqrs = await prisma.pQRS.findUnique({
      where: { id: pqrsId },
      select: { id: true, radicado: true, email: true, telefono: true, tipo: true, asunto: true, anonimo: true, estado: true },
    })
    if (!pqrs) {
      return NextResponse.json({ error: 'Radicado no encontrado' }, { status: 404 })
    }
    if (['RESPONDIDA', 'CERRADA', 'ANULADA'].includes(pqrs.estado)) {
      return NextResponse.json({ error: 'Este radicado ya fue respondido o cerrado' }, { status: 409 })
    }

    // Crear la respuesta oficial
    const respuesta = await prisma.vuRespuesta.create({
      data: {
        pqrsId,
        tipo:           tipo as VuTipoRespuesta,
        contenido:      contenido.trim(),
        archivoUrl:     archivoUrl   ?? null,
        entidadDestino: entidadDestino ?? null,
        radicadoDestino: radicadoDestino ?? null,
        firmadoPor:     firmadoPor ?? null,
        funcionarioId:  usuarioId,
      },
    })

    // Actualizar estado del PQRS
    const nuevoEstado = tipo === 'DESISTIMIENTO' ? 'ANULADA' : 'RESPONDIDA'
    await prisma.pQRS.update({
      where: { id: pqrsId },
      data: {
        estado:        nuevoEstado as any,
        fechaRespuesta: new Date(),
        respuesta:     contenido.trim(),
        archivoRespuesta: archivoUrl ?? null,
      },
    })

    // Registrar en historial
    await prisma.historialPQRS.create({
      data: {
        pqrsId,
        accion:        'RESPUESTA_EMITIDA',
        descripcion:   `Respuesta tipo ${tipo} emitida por ${firmadoPor ?? 'funcionario'}`,
        estadoAnterior: pqrs.estado as any,
        estadoNuevo:   nuevoEstado as any,
        usuarioId,
      },
    })

    // Notificar al ciudadano por correo (si no es anónimo)
    if (!pqrs.anonimo && pqrs.email && !pqrs.email.includes('placeholder')) {
      const tipoLabel: Record<string, string> = {
        COMPETENTE:   'Respuesta de fondo',
        REMISION:     'Remisión a entidad competente',
        INSISTENCIA:  'Respuesta por insistencia',
        TRASLADO:     'Traslado por falta de competencia',
        DESISTIMIENTO: 'Desistimiento',
        IMPROCEDENTE: 'Solicitud improcedente',
      }

      const destinoInfo = entidadDestino
        ? `<p>Su solicitud ha sido dirigida a: <strong>${entidadDestino}</strong>${radicadoDestino ? ` (Radicado: ${radicadoDestino})` : ''}.</p>`
        : ''

      await sendMail({
        to:      pqrs.email,
        subject: `Respuesta a su radicado ${pqrs.radicado} — ${tipoLabel[tipo] ?? tipo}`,
        html: `
          <p>Estimado ciudadano,</p>
          <p>Su solicitud <strong>${pqrs.radicado}</strong> — ${pqrs.asunto} ha sido atendida.</p>
          <p><strong>Tipo de respuesta:</strong> ${tipoLabel[tipo] ?? tipo}</p>
          ${destinoInfo}
          <blockquote style="border-left:4px solid #1a3f6f;margin:16px 0;padding:8px 16px;color:#333;background:#f5f9ff">
            ${contenido.trim()}
          </blockquote>
          ${archivoUrl ? `<p><a href="${archivoUrl}" style="color:#1a3f6f">Descargar documento de respuesta</a></p>` : ''}
          <p>Si tiene alguna inquietud adicional puede consultar el estado de su radicado en nuestro portal de atención ciudadana.</p>
        `,
      }).catch(e => console.error('[responder] Error enviando correo:', e instanceof Error ? e.message : e))
    }

    // Notificar al ciudadano por WhatsApp (si tiene teléfono y el tenant lo configuró).
    // Fire-and-forget: no bloquea ni rompe la respuesta si WhatsApp falla.
    if (!pqrs.anonimo && pqrs.telefono && nuevoEstado === 'RESPONDIDA') {
      ;(async () => {
        try {
          const tenantId = await getTenantId()
          const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || ''
          await notificarCiudadano(tenantId, 'WHATSAPP', 'respondida', {
            telefono: pqrs.telefono,
            radicado: pqrs.radicado,
            tipo: pqrs.tipo,
            urlConsulta: `${baseUrl}/atencion-ciudadano/pqrsd/consulta?radicado=${encodeURIComponent(pqrs.radicado)}`,
          })
        } catch (e) {
          console.error('[responder] Error notificando WhatsApp:', e instanceof Error ? e.message : e)
        }
      })()
    }

    return NextResponse.json({ id: respuesta.id, estado: nuevoEstado }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/ventanilla/[id]/responder]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
