/**
 * GET  /api/pqrsd/[id]/chat  — Obtener mensajes del chat de un radicado
 * POST /api/pqrsd/[id]/chat  — Enviar un mensaje (ciudadano o funcionario)
 *
 * Acceso:
 *  - Ciudadano: autenticado con el número de radicado (sin cuenta)
 *  - Funcionario: autenticado con NextAuth (sesión activa)
 *
 * Los mensajes con esInterno=true solo son visibles para funcionarios.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from '@/lib/tenant'
import { auth } from '@/lib/auth'
import { sendMail } from '@/lib/mail'

// ─── GET: listar mensajes ─────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pqrsId } = await params
  const { searchParams } = new URL(req.url)
  // El ciudadano se identifica con el número de radicado como token de acceso
  const radicadoToken = searchParams.get('token')

  try {
    const prisma = await getTenantPrisma()

    // Verificar que el radicado existe
    const pqrs = await prisma.pQRS.findUnique({
      where: { id: pqrsId },
      select: { id: true, radicado: true, email: true },
    })
    if (!pqrs) {
      return NextResponse.json({ error: 'Radicado no encontrado' }, { status: 404 })
    }

    // Validar acceso: funcionario autenticado o ciudadano con token de radicado
    const session = await auth()
    const esFuncionario = !!session?.user

    if (!esFuncionario && radicadoToken !== pqrs.radicado) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 })
    }

    const mensajes = await prisma.vuChatMensaje.findMany({
      where: {
        pqrsId,
        // Los ciudadanos no ven notas internas
        ...(esFuncionario ? {} : { esInterno: false }),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        usuario: { select: { nombre: true, apellido: true, cargo: true } },
      },
    })

    // Marcar como leídos los mensajes del otro lado
    if (esFuncionario) {
      // Funcionario leyendo → marcar mensajes del ciudadano como leídos
      await prisma.vuChatMensaje.updateMany({
        where: { pqrsId, usuarioId: null, leido: false },
        data: { leido: true },
      })
    }

    return NextResponse.json({
      mensajes: mensajes.map(m => ({
        id:        m.id,
        contenido: m.contenido,
        archivoUrl: m.archivoUrl,
        esInterno: m.esInterno,
        esCiudadano: m.usuarioId === null,
        remitente: m.usuario
          ? `${m.usuario.nombre} ${m.usuario.apellido}${m.usuario.cargo ? ` — ${m.usuario.cargo}` : ''}`
          : 'Ciudadano',
        leido:     m.leido,
        fecha:     m.createdAt.toISOString(),
      })),
    })
  } catch (err) {
    console.error('[chat GET]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ─── POST: enviar mensaje ─────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pqrsId } = await params

  let body: { contenido?: string; esInterno?: boolean; token?: string; archivoUrl?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { contenido, esInterno = false, token, archivoUrl } = body

  if (!contenido?.trim()) {
    return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 })
  }

  try {
    const prisma = await getTenantPrisma()
    const vuActivo = await isTenantModuleActive(MODULO_IDS.VENTANILLA_UNICA)
    if (!vuActivo) {
      return NextResponse.json({ error: 'Módulo Ventanilla Única no activo' }, { status: 403 })
    }

    // Verificar radicado
    const pqrs = await prisma.pQRS.findUnique({
      where: { id: pqrsId },
      select: { id: true, radicado: true, email: true, asunto: true, anonimo: true },
    })
    if (!pqrs) {
      return NextResponse.json({ error: 'Radicado no encontrado' }, { status: 404 })
    }

    const session = await auth()
    const esFuncionario = !!session?.user

    // Ciudadanos no pueden escribir notas internas
    if (!esFuncionario && esInterno) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Validar acceso ciudadano
    if (!esFuncionario && token !== pqrs.radicado) {
      return NextResponse.json({ error: 'Token de radicado inválido' }, { status: 401 })
    }

    // Crear mensaje
    const mensaje = await prisma.vuChatMensaje.create({
      data: {
        pqrsId,
        contenido: contenido.trim(),
        archivoUrl:  archivoUrl ?? null,
        esInterno,
        usuarioId: esFuncionario ? (session.user as any).id : null,
      },
      include: {
        usuario: { select: { nombre: true, apellido: true } },
      },
    })

    // ── Notificación por correo ───────────────────────────────────────────────
    // Si es funcionario respondiendo → notificar al ciudadano (si no es anónimo)
    // Si es ciudadano → notificar al funcionario asignado
    if (!esInterno) {
      try {
        if (esFuncionario && !pqrs.anonimo && pqrs.email && !pqrs.email.includes('placeholder')) {
          await sendMail({
            to:      pqrs.email,
            subject: `Nuevo mensaje en su radicado ${pqrs.radicado}`,
            html: `
              <p>La entidad ha enviado un nuevo mensaje en su solicitud <strong>${pqrs.radicado}</strong>.</p>
              <blockquote style="border-left:4px solid #ccc;margin:16px 0;padding:8px 16px;color:#555">
                ${contenido.trim()}
              </blockquote>
              <p>Puede responder ingresando al portal de consulta con su número de radicado.</p>
            `,
          })
        } else if (!esFuncionario) {
          // Notificar al funcionario asignado
          const asignado = await prisma.pQRS.findUnique({
            where: { id: pqrsId },
            include: { asignado: { select: { email: true, nombre: true } } },
          })
          if (asignado?.asignado?.email) {
            await sendMail({
              to:      asignado.asignado.email,
              subject: `El ciudadano respondió en el radicado ${pqrs.radicado}`,
              html: `
                <p>El ciudadano ha enviado un mensaje en el radicado <strong>${pqrs.radicado}</strong> — ${pqrs.asunto}.</p>
                <blockquote style="border-left:4px solid #ccc;margin:16px 0;padding:8px 16px;color:#555">
                  ${contenido.trim()}
                </blockquote>
                <p>Ingrese al panel de administración para responder.</p>
              `,
            })
          }
        }
      } catch (mailErr) {
        // No bloquear el chat si el correo falla
        console.error('[chat POST] Error enviando notificación:', mailErr instanceof Error ? mailErr.message : mailErr)
      }
    }

    return NextResponse.json({
      id:         mensaje.id,
      contenido:  mensaje.contenido,
      esInterno:  mensaje.esInterno,
      esCiudadano: mensaje.usuarioId === null,
      remitente:  mensaje.usuario
        ? `${mensaje.usuario.nombre} ${mensaje.usuario.apellido}`
        : 'Ciudadano',
      fecha: mensaje.createdAt.toISOString(),
    }, { status: 201 })

  } catch (err) {
    console.error('[chat POST]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
