import { Suspense } from 'react'
import { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import ConsultaContent from './consulta-client'

export const metadata: Metadata = {
  title: 'Consultar PQRSD | Personería Municipal de Guadalajara de Buga',
  description: 'Consulte el estado de su Petición, Queja, Reclamo, Sugerencia o Denuncia'
}

function ConsultaFallback() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </main>
  )
}

export default function ConsultaPQRSDPage() {
  return (
    <>
      <PageHeader
        title="Consultar PQRSD"
        description="Verifique el estado de su solicitud con el número de radicado"
        breadcrumbItems={[
          { label: 'Atención al Ciudadano', href: '/atencion-ciudadano' },
          { label: 'PQRSD', href: '/atencion-ciudadano/pqrsd' },
          { label: 'Consulta' },
        ]}
      />

      <Suspense fallback={<ConsultaFallback />}>
        <ConsultaContent />
      </Suspense>
    </>
  )
}
