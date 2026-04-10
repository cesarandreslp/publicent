import { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import TransparenciaMipgClient from './client-page'
import { getTenantPrisma } from '@/lib/tenant'

export const metadata: Metadata = {
  title: 'Desempeño Institucional MIPG | Personería Buga',
  description: 'Conozca los resultados y mediciones del Modelo Integrado de Planeación y Gestión (MIPG) de la entidad.',
}

export default async function TransparenciaMipgPage() {
  const anioActual = new Date().getFullYear()
  const prisma = await getTenantPrisma()
  
  // Extraer las evaluaciones de la BD y precalcular para el ciudadano
  const evaluaciones = await prisma.mipgEvaluacion.findMany({
    where: { anioVigencia: anioActual },
    include: {
      politica: { include: { dimension: true } }
    }
  })

  const datosRadiales = Object.values(evaluaciones.reduce((acc: any, curr) => {
    const dimNombre = curr.politica.dimension.nombre
    const dimCodigo = curr.politica.dimension.codigo
    
    if (!acc[dimCodigo]) {
      acc[dimCodigo] = { dimension: dimNombre, codigo: dimCodigo, sumaPuntajes: 0, cantidad: 0, puntajePromedio: 0 }
    }
    
    acc[dimCodigo].sumaPuntajes += curr.puntaje
    acc[dimCodigo].cantidad += 1
    acc[dimCodigo].puntajePromedio = Math.round((acc[dimCodigo].sumaPuntajes / acc[dimCodigo].cantidad) * 10) / 10
    
    return acc
  }, {}))

  const promedioIDI = datosRadiales.length > 0 ? 
      Math.round((datosRadiales.reduce((sum: number, dim: any) => sum + dim.puntajePromedio, 0) / datosRadiales.length) * 10) / 10 : 0

  return (
    <>
      <PageHeader
        title="Desempeño Institucional MIPG"
        description="Conozca nuestra gestión orientada a resultados"
        breadcrumbItems={[
          { label: 'Transparencia', href: '/transparencia' },
          { label: 'Desempeño Institucional MIPG' },
        ]}
      />
      
      <TransparenciaMipgClient 
        datosRadiales={datosRadiales}
        evaluacionesTotales={evaluaciones.length}
        promedioIDI={promedioIDI}
        anio={anioActual}
      />
    </>
  )
}
