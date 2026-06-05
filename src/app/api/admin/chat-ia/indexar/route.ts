/**
 * /api/admin/chat-ia/indexar
 * POST — Dispara la indexación completa del contenido del tenant en ChatIaChunk.
 * Protegido: módulo chat_ia_ciudadano + roles SUPER_ADMIN / ADMIN.
 */

import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'
import { requireChatIa } from '@/lib/frisco-guard'
import { registrarAuditoria } from '@/lib/auditoria'
import { indexarTodoElTenant } from '@/lib/chat-ia'

export async function POST() {
  const guard = await requireChatIa(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  try {
    const tenantId = await getTenantId()
    const { indexados, errores } = await indexarTodoElTenant(tenantId)

    try {
      await registrarAuditoria({
        accion: 'UPDATE',
        entidad: 'ChatIaChunk',
        usuarioId: guard.user?.id,
        descripcion: `Indexación masiva: ${indexados} chunks, ${errores} errores`,
      })
    } catch { /* auditoría no crítica */ }

    return NextResponse.json({ indexados, errores })
  } catch (e) {
    console.error('[chat-ia/indexar]', e instanceof Error ? e.message : String(e))
    return NextResponse.json({ error: 'Error al indexar contenido' }, { status: 500 })
  }
}
