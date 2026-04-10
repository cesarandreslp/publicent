'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react'

// Estados posibles de una PQRSD
const estados = {
  radicado: { label: 'Radicado', color: 'bg-blue-100 text-blue-800', icono: FileText },
  en_tramite: { label: 'En Trámite', color: 'bg-yellow-100 text-yellow-800', icono: Clock },
  respondido: { label: 'Respondido', color: 'bg-green-100 text-green-800', icono: CheckCircle },
  cerrado: { label: 'Cerrado', color: 'bg-gray-100 text-gray-800', icono: AlertCircle },
}

// Datos de ejemplo para la demostración
const pqrsdEjemplo = {
  radicado: 'PQR-12345678',
  tipo: 'Petición',
  estado: 'en_tramite' as keyof typeof estados,
  fechaRadicacion: '2026-01-10',
  fechaVencimiento: '2026-01-31',
  asunto: 'Solicitud de certificación de residencia',
  dependencia: 'Atención al Ciudadano',
  funcionarioAsignado: 'Profesional Atención al Ciudadano',
  seguimiento: [
    { fecha: '2026-01-10', estado: 'Radicado', descripcion: 'Solicitud recibida y radicada en el sistema' },
    { fecha: '2026-01-11', estado: 'Asignado', descripcion: 'Solicitud asignada a funcionario responsable' },
    { fecha: '2026-01-12', estado: 'En Trámite', descripcion: 'Se inicia revisión de la solicitud' },
  ],
  respuestas: [] as any[],
}

export default function ConsultaContent() {
  const searchParams = useSearchParams()
  const [radicado, setRadicado] = useState(searchParams.get('radicado') || '')
  const [resultado, setResultado] = useState<typeof pqrsdEjemplo | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('radicado')) {
      handleBuscar()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBuscar = async () => {
    if (!radicado.trim()) {
      setError('Por favor ingrese un número de radicado')
      return
    }

    setBuscando(true)
    setError('')
    setResultado(null)

    try {
      const res = await fetch(`/api/pqrsd?radicado=${encodeURIComponent(radicado.trim())}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'No se encontró la solicitud')
      }

      setResultado(data)
    } catch (err: any) {
      setError(err.message || 'Error al consultar la PQRSD')
    } finally {
      setBuscando(false)
    }
  }

  const estadoInfo = resultado ? estados[resultado.estado] : null

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Formulario de búsqueda */}
        <section className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Ingrese su número de radicado
          </h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={radicado}
                onChange={(e) => setRadicado(e.target.value)}
                placeholder="Ej: PQR-12345678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
              />
            </div>
            <button
              onClick={handleBuscar}
              disabled={buscando}
              className="px-6 py-3 bg-gov-blue text-white rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              {buscando ? 'Buscando...' : 'Consultar'}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-red-600 text-sm">{error}</p>
          )}
        </section>

        {/* Resultado de la consulta */}
        {resultado && (
          <section className="space-y-6">
            {/* Estado general */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gov-blue p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Número de radicado</p>
                    <p className="text-white font-bold text-xl">{resultado.radicado}</p>
                  </div>
                  {estadoInfo && (
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${estadoInfo.color}`}>
                      {estadoInfo.label}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Tipo de solicitud</p>
                    <p className="font-medium text-gray-900">{resultado.tipo}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Asunto</p>
                    <p className="font-medium text-gray-900">{resultado.asunto}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-sm">Fecha de radicación</p>
                      <p className="font-medium text-gray-900">{resultado.fechaRadicacion}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-sm">Fecha de vencimiento</p>
                      <p className="font-medium text-gray-900">{resultado.fechaVencimiento}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-sm">Dependencia asignada</p>
                      <p className="font-medium text-gray-900">{resultado.dependencia}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Línea de tiempo */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-6">Seguimiento de la solicitud</h3>
              <div className="space-y-4">
                {resultado.seguimiento.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-gov-blue rounded-full"></div>
                      {index < resultado.seguimiento.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm text-gray-500">{item.fecha}</p>
                      <p className="font-medium text-gray-900">{item.estado}</p>
                      <p className="text-gray-600 text-sm">{item.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentos de Respuesta */}
            {resultado.respuestas && resultado.respuestas.length > 0 && (
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6 shadow-sm">
                <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Respuestas Oficiales Emitidas
                </h3>
                <div className="space-y-3">
                  {resultado.respuestas.map((resp: any, i: number) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
                      <div>
                        <p className="font-bold text-gray-900">Oficio N° {resp.numero}</p>
                        <p className="text-gray-500 text-xs">Fecha de emisión: {resp.fecha}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a href={resp.urlDescarga} target="_blank" className="text-sm font-bold bg-gov-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-center whitespace-nowrap">
                          Descargar Documento
                        </a>
                        {resp.hashVerificacion && (
                          <Link href={`/verificar?hash=${resp.hashVerificacion}`} target="_blank" className="text-sm font-bold bg-white text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors text-center whitespace-nowrap">
                            Verificar Firma
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="font-bold text-yellow-800 mb-2">¿Necesita ayuda?</h3>
              <p className="text-yellow-700 text-sm mb-4">
                Si tiene alguna inquietud sobre el estado de su solicitud, puede comunicarse con nosotros.
              </p>
              <Link
                href="/atencion-ciudadano/canales-atencion"
                className="inline-flex items-center gap-2 text-yellow-800 font-medium hover:text-yellow-900"
              >
                Ver canales de atención
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Información adicional */}
        {!resultado && !buscando && (
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-bold text-gov-blue mb-3">¿Cómo consultar su PQRSD?</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-gov-blue font-bold">1.</span>
                Ingrese el número de radicado que recibió al momento de radicar su solicitud.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gov-blue font-bold">2.</span>
                El número de radicado tiene el formato: PQR-XXXXXXXX
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gov-blue font-bold">3.</span>
                Haga clic en "Consultar" para ver el estado actual de su solicitud.
              </li>
            </ul>
            
            <div className="mt-6 pt-4 border-t border-blue-200">
              <p className="text-sm text-gray-600">
                ¿No tiene un radicado? 
                <Link href="/atencion-ciudadano/pqrsd" className="text-gov-blue hover:underline ml-1">
                  Radique una nueva solicitud
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
