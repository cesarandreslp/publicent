import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AuditoriaClient } from './AuditoriaClient';

export const metadata: Metadata = {
  title: 'Auditoría - Panel de Administración',
  description: 'Registro de auditoría del sistema',
};

export default async function AuditoriaPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <AuditoriaClient />;
}
