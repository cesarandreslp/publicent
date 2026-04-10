import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AparienciaClient from './client-page'

export default async function AparienciaPage() {
  const session = await auth()
  
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    redirect('/admin')
  }

  return <AparienciaClient />
}

