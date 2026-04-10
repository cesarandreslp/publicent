import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ReportesClient } from './ReportesClient';

export const metadata: Metadata = {
  title: 'Reportes - Panel de Administración',
  description: 'Generación de reportes del sistema',
};

export default async function ReportesPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <ReportesClient />;
}
