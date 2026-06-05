import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isTenantModuleActive, MODULO_IDS, getTenantPrisma } from '@/lib/tenant'
import ChatIaClientPage from './client-page'

export const metadata = { title: 'Chat IA Ciudadano' }

export default async function ChatIaPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const activo = await isTenantModuleActive(MODULO_IDS.CHAT_IA_CIUDADANO)
  if (!activo) {
    return (
      <div className="p-8 text-center text-slate-500">
        El módulo Chat IA Ciudadano no está habilitado para este tenant.
      </div>
    )
  }

  const prisma = await getTenantPrisma()
  const totalChunks = await prisma.chatIaChunk.count()

  return <ChatIaClientPage totalChunksInicial={totalChunks} />
}
