/**
 * POST /api/superadmin/tenants/[id]/whatsapp-test
 * Envía un mensaje de prueba por WhatsApp usando la config guardada del tenant.
 * Usa la plantilla por defecto `hello_world` (idioma en_US) que Meta provee en toda
 * cuenta nueva, de modo que sirve para verificar credenciales sin registrar plantillas.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSASession } from '@/lib/superadmin-auth'
import { getWhatsAppConfig } from '@/lib/notifications'
import { sendWhatsApp } from '@/lib/notifications/whatsapp'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  let body: { toPhone?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const toPhone = body.toPhone?.trim()
  if (!toPhone) {
    return NextResponse.json({ error: 'Número de destino requerido' }, { status: 400 })
  }

  const config = await getWhatsAppConfig(id)
  if (!config) {
    return NextResponse.json(
      { error: 'WhatsApp no está configurado para este tenant. Guarda el Phone Number ID y el Access Token primero.' },
      { status: 400 }
    )
  }

  // hello_world no lleva parámetros de body.
  const result = await sendWhatsApp(config, toPhone, 'hello_world', [], 'en_US')

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 502 })
  }

  return NextResponse.json({ success: true, messageId: result.messageId })
}
