'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { 
  FileText, 
  MessageSquare, 
  AlertCircle,
  Lightbulb,
  Shield,
  Upload,
  Send,
  CheckCircle,
  Info
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Turnstile } from '@marsidev/react-turnstile'

const tiposPQRSD = [
  {
    id: 'peticion',
    nombre: 'Petición',
    descripcion: 'Solicitud de información, documentos o actuación de la entidad',
    icono: FileText,
    color: 'border-blue-500 bg-blue-50',
    colorActivo: 'border-blue-500 bg-blue-100 ring-2 ring-blue-500',
  },
  {
    id: 'queja',
    nombre: 'Queja',
    descripcion: 'Inconformidad sobre la conducta de un servidor público',
    icono: MessageSquare,
    color: 'border-orange-500 bg-orange-50',
    colorActivo: 'border-orange-500 bg-orange-100 ring-2 ring-orange-500',
  },
  {
    id: 'reclamo',
    nombre: 'Reclamo',
    descripcion: 'Exigencia sobre un derecho que considera vulnerado',
    icono: AlertCircle,
    color: 'border-red-500 bg-red-50',
    colorActivo: 'border-red-500 bg-red-100 ring-2 ring-red-500',
  },
  {
    id: 'sugerencia',
    nombre: 'Sugerencia',
    descripcion: 'Propuesta para mejorar los servicios de la entidad',
    icono: Lightbulb,
    color: 'border-green-500 bg-green-50',
    colorActivo: 'border-green-500 bg-green-100 ring-2 ring-green-500',
  },
  {
    id: 'denuncia',
    nombre: 'Denuncia',
    descripcion: 'Información sobre irregularidades o hechos delictivos',
    icono: Shield,
    color: 'border-purple-500 bg-purple-50',
    colorActivo: 'border-purple-500 bg-purple-100 ring-2 ring-purple-500',
  },
]

const tiposDocumento = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'NIT', label: 'NIT' },
]

export default function PQRSDPage() {
  const [tipoPQRSD, setTipoPQRSD] = useState('')
  const [esAnonimo, setEsAnonimo] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [radicado, setRadicado] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Campos del solicitante
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [direccionLocal, setDireccionLocal] = useState('')

  // Turnstile token
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // Descripción
  const [asunto, setAsunto] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoPQRSD) return

    setLoading(true)
    setError(null)

    const nombreCompleto = esAnonimo ? undefined : `${nombres} ${apellidos}`.trim()

    try {
      const res = await fetch('/api/pqrsd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo:               tipoPQRSD,
          anonimo:            esAnonimo,
          nombreSolicitante:  esAnonimo ? undefined : nombreCompleto,
          tipoDocumento:      esAnonimo ? undefined : tipoDocumento,
          numeroDocumento:      esAnonimo ? undefined : numeroDocumento,
          email:              esAnonimo ? undefined : correo,
          telefono:           esAnonimo ? undefined : telefono,
          direccion:          esAnonimo ? undefined : `${departamento}, ${municipio}, ${direccionLocal}`,
          asunto,
          descripcion,
          turnstileToken,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al enviar la solicitud')
        return
      }

      setRadicado(data.radicado)
      setEnviado(true)
    } catch {
      setError('Error de red. Verifique su conexión e intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <>
        <PageHeader
          title="PQRSD Radicada"
          description="Su solicitud ha sido registrada exitosamente"
          breadcrumbItems={[
            { label: 'Atención al Ciudadano', href: '/atencion-ciudadano' },
            { label: 'PQRSD' },
          ]}
        />

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Solicitud Radicada Exitosamente!
              </h2>
              <p className="text-gray-600 mb-6">
                Su PQRSD ha sido recibida y será atendida en los tiempos establecidos por la ley.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-500 mb-2">Número de Radicado</p>
                <p className="text-3xl font-bold text-gov-blue">{radicado}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Guarde este número para consultar el estado de su solicitud
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/atencion-ciudadano/pqrsd/consulta?radicado=${radicado}`}
                  className="px-6 py-3 bg-gov-blue text-white rounded-lg font-medium hover:bg-gov-blue-dark transition-colors"
                >
                  Consultar Estado
                </Link>
                <Link
                  href="/atencion-ciudadano"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Volver a Atención al Ciudadano
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Radicar PQRSD"
        description="Presente sus Peticiones, Quejas, Reclamos, Sugerencias y Denuncias"
        breadcrumbItems={[
          { label: 'Atención al Ciudadano', href: '/atencion-ciudadano' },
          { label: 'PQRSD' },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Información importante */}
          <div className="bg-blue-50 border-l-4 border-gov-blue rounded-r-lg p-4 mb-8">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-gov-blue shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Información importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Los campos marcados con (*) son obligatorios</li>
                  <li>El tiempo de respuesta es de 15 días hábiles según la Ley 1755 de 2015</li>
                  <li>Recibirá una copia de su solicitud en el correo electrónico registrado</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Paso 1: Tipo de PQRSD */}
            <section className="bg-white rounded-xl shadow-sm border p-6" aria-labelledby="paso1-titulo">
              <h2 id="paso1-titulo" className="text-lg font-bold text-gray-900 mb-4">
                1. Seleccione el tipo de solicitud *
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" role="radiogroup" aria-required="true" aria-label="Tipo de solicitud PQRSD">
                {tiposPQRSD.map((tipo) => (
                  <button
                    key={tipo.id}
                    type="button"
                    role="radio"
                    aria-checked={tipoPQRSD === tipo.id}
                    onClick={() => setTipoPQRSD(tipo.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      tipoPQRSD === tipo.id ? tipo.colorActivo : tipo.color
                    }`}
                  >
                    <tipo.icono className="w-6 h-6 mb-2" aria-hidden="true" />
                    <h3 className="font-semibold text-gray-900">{tipo.nombre}</h3>
                    <p className="text-xs text-gray-600 mt-1">{tipo.descripcion}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Paso 2: Datos del solicitante */}
            <section className="bg-white rounded-xl shadow-sm border p-6" aria-labelledby="paso2-titulo">
              <div className="flex items-center justify-between mb-4">
                <h2 id="paso2-titulo" className="text-lg font-bold text-gray-900">
                  2. Datos del solicitante
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="esAnonimo"
                    checked={esAnonimo}
                    onChange={(e) => setEsAnonimo(e.target.checked)}
                    className="w-4 h-4 text-gov-blue rounded border-gray-300 focus:ring-gov-blue"
                    aria-describedby="anonimo-descripcion"
                  />
                  <span className="text-sm text-gray-600">Solicitud anónima</span>
                </label>
              </div>

              {!esAnonimo && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de documento *
                    </label>
                    <select 
                      id="tipoDocumento"
                      required
                      aria-required="true"
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                    >
                      <option value="">Seleccione...</option>
                      {tiposDocumento.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="numeroDocumento" className="block text-sm font-medium text-gray-700 mb-1">
                      Número de documento *
                    </label>
                    <input
                      type="text"
                      id="numeroDocumento"
                      required
                      aria-required="true"
                      value={numeroDocumento}
                      onChange={(e) => setNumeroDocumento(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                      placeholder="Ingrese su número de documento"
                    />
                  </div>
                  <div>
                    <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      id="nombres"
                      required
                      aria-required="true"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                      placeholder="Ingrese sus nombres"
                    />
                  </div>
                  <div>
                    <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      id="apellidos"
                      required
                      aria-required="true"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                      placeholder="Ingrese sus apellidos"
                    />
                  </div>
                  <div>
                    <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      id="correo"
                      required
                      aria-required="true"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono de contacto *
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      required
                      aria-required="true"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                      placeholder="300 123 4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento
                    </label>
                    <input
                      type="text"
                      id="departamento"
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                      placeholder="Ej. Valle del Cauca"
                    />
                  </div>
                  <div>
                    <label htmlFor="municipio" className="block text-sm font-medium text-gray-700 mb-1">
                      Municipio
                    </label>
                    <input
                      type="text"
                      id="municipio"
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                      placeholder="Ej. Guadalajara de Buga"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="direccionLocal" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección de residencia
                    </label>
                    <input
                      type="text"
                      id="direccionLocal"
                      value={direccionLocal}
                      onChange={(e) => setDireccionLocal(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                      placeholder="Ej. Calle 7 # 12-45"
                    />
                  </div>
                </div>
              )}

              {esAnonimo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" role="alert" id="anonimo-descripcion">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Al presentar una solicitud anónima, no podremos enviarle 
                    notificaciones sobre el estado de su solicitud. Sin embargo, podrá consultarla 
                    con el número de radicado que se generará.
                  </p>
                </div>
              )}
            </section>

            {/* Paso 3: Descripción de la solicitud */}
            <section className="bg-white rounded-xl shadow-sm border p-6" aria-labelledby="paso3-titulo">
              <h2 id="paso3-titulo" className="text-lg font-bold text-gray-900 mb-4">
                3. Descripción de la solicitud *
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    id="asunto"
                    required
                    aria-required="true"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
                    placeholder="Resuma brevemente su solicitud"
                  />
                </div>
                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción detallada *
                  </label>
                  <textarea
                    id="descripcion"
                    required
                    aria-required="true"
                    aria-describedby="descripcion-ayuda"
                    rows={6}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue resize-none"
                    placeholder="Describa detalladamente su solicitud, incluyendo fechas, lugares y personas involucradas si aplica..."
                  />
                  <p id="descripcion-ayuda" className="text-xs text-gray-500 mt-1">Mínimo 50 caracteres</p>
                </div>
              </div>
            </section>

            {/* Paso 4: Archivos adjuntos */}
            <section className="bg-white rounded-xl shadow-sm border p-6" aria-labelledby="paso4-titulo">
              <h2 id="paso4-titulo" className="text-lg font-bold text-gray-900 mb-4">
                4. Archivos adjuntos (opcional)
              </h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gov-blue transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-gray-600 mb-2" id="archivos-descripcion">
                  Arrastre sus archivos aquí o haga clic para seleccionar
                </p>
                <p className="text-xs text-gray-500" id="archivos-formatos">
                  Formatos permitidos: PDF, DOC, DOCX, JPG, PNG. Máximo 10MB por archivo.
                </p>
                <input
                  type="file"
                  id="archivos"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  aria-describedby="archivos-descripcion archivos-formatos"
                />
                <label
                  htmlFor="archivos"
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm inline-block cursor-pointer"
                >
                  Seleccionar archivos
                </label>
              </div>
            </section>

            {/* Términos y condiciones */}
            <section className="bg-white rounded-xl shadow-sm border p-6" aria-labelledby="terminos-titulo">
              <h2 id="terminos-titulo" className="sr-only">Términos y condiciones</h2>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="aceptaTerminos"
                  required
                  aria-required="true"
                  className="w-4 h-4 text-gov-blue rounded border-gray-300 focus:ring-gov-blue mt-1"
                />
                <span className="text-sm text-gray-600">
                  Acepto la{' '}
                  <Link href="/politicas/tratamiento-datos" className="text-gov-blue hover:underline">
                    política de tratamiento de datos personales
                  </Link>{' '}
                  y autorizo a la Personería Municipal de Guadalajara de Buga para el procesamiento 
                  de mi información conforme a la Ley 1581 de 2012.
                </span>
              </label>
            </section>

            {/* CAPTCHA */}
            <section className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center">
              <h2 className="sr-only">Verificación de seguridad</h2>
              <div className="mb-2 text-sm text-gray-600">Por favor, verifique que no es un robot:</div>
              {/* Nota: En desarrollo podemos usar el dummy sitekey de Cloudflare, o dejarlo hardcodeado mientras el cliente proporciona uno */}
              <Turnstile 
                siteKey="1x00000000000000000000AA" 
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setError("Error al verificar el CAPTCHA. Por favor, recargue la página.")}
                options={{
                  theme: 'light',
                }}
              />
            </section>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            {/* Botón de envío */}
            <div className="flex justify-end gap-4" role="group" aria-label="Acciones del formulario">
              <Link
                href="/atencion-ciudadano"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={!tipoPQRSD || !turnstileToken || loading}
                aria-disabled={!tipoPQRSD || !turnstileToken || loading}
                className="px-6 py-3 bg-gov-blue text-white rounded-lg font-medium hover:bg-gov-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Radicar Solicitud
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
