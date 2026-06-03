'use client'

/**
 * VentanillaDetalleClient — Vista detallada de un radicado PQRSD.
 *
 * Secciones:
 *  1. Header con semáforo, radicado, tipo y estado
 *  2. Datos del solicitante + asunto + datos del radicado
 *  3. Asignación IA (VuAsignacionIA)
 *  4. Chat bidireccional (ChatRadicado)
 *  5. Formulario de respuesta oficial (6 tipos VuTipoRespuesta)
 *  6. Modal de reasignación
 *  7. Historial de acciones
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, User, Calendar, Clock, CheckCircle,
  AlertTriangle, AlertOctagon, Circle, Send, UserCheck,
  FileText, RefreshCw, Loader2, ChevronDown, Info,
  History, X, Shield,
} from 'lucide-react'
import { ChatRadicado } from '@/components/vu/ChatRadicado'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface VuRespuesta {
  id: string
  tipo: string
  contenido: string
  archivoUrl: string | null
  entidadDestino: string | null
  radicadoDestino: string | null
  firmadoPor: string | null
  createdAt: string
  funcionario: { nombre: string; apellido: string; cargo: string | null }
}

interface HistorialEntry {
  id: string
  accion: string
  descripcion: string
  estadoAnterior: string | null
  estadoNuevo: string | null
  createdAt: string
  usuario: { nombre: string; apellido: string } | null
}

interface PqrsDetalle {
  id: string
  radicado: string
  tipo: string
  estado: string
  prioridad: string
  asunto: string
  descripcion: string
  nombreSolicitante: string
  email: string | null
  telefono: string | null
  anonimo: boolean
  colorSemaforo: string | null
  createdAt: string
  fechaVencimiento: string | null
  fechaRespuesta: string | null
  respuesta: string | null
  asignado: { id: string; nombre: string; apellido: string; cargo: string | null; email: string | null } | null
  vuAsignacion: {
    dependenciaSugerida: string | null
    funcionarioSugerido: string | null
    justificacion: string | null
    confianza: number | null
    diasTerminoLegal: number | null
    procesadoPor: string | null
  } | null
  vuRespuestas: VuRespuesta[]
  vuDemografia: {
    genero: string | null
    rangoEtario: string | null
    zona: string | null
    condicion: string | null
    municipioResidencia: string | null
  } | null
  historial: HistorialEntry[]
}

interface Funcionario {
  id: string
  nombre: string
  apellido: string
  cargo: string | null
}

interface Props {
  pqrs: PqrsDetalle
  funcionarios: Funcionario[]
  userId: string
  userRole: string
}

// ─── Configuración ────────────────────────────────────────────────────────────

const SEMAFORO_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string; bar: string }> = {
  VERDE:    { label: 'En tiempo',  icon: <Circle className="w-4 h-4 fill-emerald-500 text-emerald-500" />, cls: 'text-emerald-400', bar: 'bg-emerald-500' },
  AMARILLO: { label: 'Por vencer', icon: <Clock className="w-4 h-4 text-yellow-400" />,                   cls: 'text-yellow-400',  bar: 'bg-yellow-400' },
  ROJO:     { label: 'Urgente',    icon: <AlertTriangle className="w-4 h-4 text-red-400" />,              cls: 'text-red-400',     bar: 'bg-red-500' },
  NEGRO:    { label: 'Vencido',    icon: <AlertOctagon className="w-4 h-4 text-red-300" />,               cls: 'text-red-300',     bar: 'bg-red-900' },
}

const TIPO_LABEL: Record<string, string> = {
  PETICION: 'Petición', QUEJA: 'Queja', RECLAMO: 'Reclamo',
  SUGERENCIA: 'Sugerencia', DENUNCIA: 'Denuncia',
  FELICITACION: 'Felicitación', CONSULTA: 'Consulta',
}

const TIPO_RESPUESTA_LABELS: Record<string, { label: string; desc: string }> = {
  COMPETENTE:    { label: 'Respuesta de fondo',            desc: 'Entidad competente responde de manera directa y definitiva.' },
  REMISION:      { label: 'Remisión',                      desc: 'Se envía a entidad competente por no ser de nuestra competencia.' },
  INSISTENCIA:   { label: 'Respuesta por insistencia',     desc: 'El ciudadano insistió y se da respuesta.' },
  TRASLADO:      { label: 'Traslado por falta de competencia', desc: 'Se traslada a quien corresponda dentro del plazo legal.' },
  DESISTIMIENTO: { label: 'Desistimiento',                 desc: 'El ciudadano desiste voluntariamente. El radicado se anulará.' },
  IMPROCEDENTE:  { label: 'Solicitud improcedente',        desc: 'No cumple los requisitos para ser tramitada.' },
}

const ESTADO_BADGE: Record<string, string> = {
  RADICADA:   'bg-sky-500/20 text-sky-300',
  EN_TRAMITE: 'bg-yellow-500/20 text-yellow-300',
  RESPONDIDA: 'bg-emerald-500/20 text-emerald-300',
  CERRADA:    'bg-slate-500/20 text-slate-400',
  ANULADA:    'bg-gray-700/30 text-gray-400',
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function VentanillaDetalleClient({ pqrs, funcionarios, userId, userRole }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab]       = useState<'chat' | 'responder' | 'historial'>('chat')
  const [showReasignar, setShowReasignar] = useState(false)
  const [respondiendo, setRespondiendo] = useState(false)
  const [reasignando, setReasignando]   = useState(false)
  const [apiError, setApiError]         = useState<string | null>(null)

  // Estado formulario respuesta
  const [tipoResp, setTipoResp]           = useState('COMPETENTE')
  const [contenido, setContenido]         = useState('')
  const [entidadDestino, setEntidadDestino] = useState('')
  const [radicadoDestino, setRadicadoDestino] = useState('')
  const [firmadoPor, setFirmadoPor]       = useState('')
  const [archivoUrl, setArchivoUrl]       = useState('')

  // Estado formulario reasignación
  const [nuevoFuncionarioId, setNuevoFuncionarioId] = useState('')
  const [motivoReasig, setMotivoReasig] = useState('')

  const terminado = ['RESPONDIDA', 'CERRADA', 'ANULADA'].includes(pqrs.estado)
  const sem = pqrs.colorSemaforo ? SEMAFORO_CONFIG[pqrs.colorSemaforo] : null

  // ── Responder ─────────────────────────────────────────────────────────────

  const handleResponder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contenido.trim()) return
    setRespondiendo(true)
    setApiError(null)
    try {
      const res = await fetch(`/api/admin/ventanilla/${pqrs.id}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: tipoResp,
          contenido: contenido.trim(),
          ...(entidadDestino  && { entidadDestino }),
          ...(radicadoDestino && { radicadoDestino }),
          ...(firmadoPor      && { firmadoPor }),
          ...(archivoUrl      && { archivoUrl }),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al responder')
      router.refresh()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error al enviar respuesta')
    } finally {
      setRespondiendo(false)
    }
  }

  // ── Reasignar ─────────────────────────────────────────────────────────────

  const handleReasignar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoFuncionarioId) return
    setReasignando(true)
    setApiError(null)
    try {
      const res = await fetch(`/api/admin/ventanilla/${pqrs.id}/reasignar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funcionarioId: nuevoFuncionarioId,
          ...(motivoReasig.trim() && { motivo: motivoReasig.trim() }),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al reasignar')
      setShowReasignar(false)
      router.refresh()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error al reasignar')
    } finally {
      setReasignando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* ── Header barra de semáforo ──────────────────────────────── */}
      {sem && !terminado && (
        <div className={`h-1 w-full ${sem.bar}`} />
      )}

      {/* ── Breadcrumb + acciones ─────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin/ventanilla" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">{pqrs.radicado}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[pqrs.estado] ?? 'bg-slate-700 text-slate-300'}`}>
                  {pqrs.estado.replace('_', ' ')}
                </span>
                {sem && !terminado && (
                  <span className={`flex items-center gap-1 text-xs ${sem.cls}`}>
                    {sem.icon} {sem.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{TIPO_LABEL[pqrs.tipo] ?? pqrs.tipo} — {pqrs.asunto}</p>
            </div>
          </div>
          {!terminado && (
            <button
              onClick={() => setShowReasignar(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" /> Reasignar
            </button>
          )}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Columna izquierda: info del radicado ─────────────────── */}
        <div className="space-y-4">

          {/* Datos radicado */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Radicado
            </h2>
            <InfoRow label="Número" value={pqrs.radicado} mono />
            <InfoRow label="Tipo" value={TIPO_LABEL[pqrs.tipo] ?? pqrs.tipo} />
            <InfoRow label="Prioridad" value={pqrs.prioridad} />
            <InfoRow label="Fecha rad." value={new Date(pqrs.createdAt).toLocaleDateString('es-CO')} />
            {pqrs.fechaVencimiento && (
              <InfoRow
                label="Vence"
                value={new Date(pqrs.fechaVencimiento).toLocaleDateString('es-CO')}
                highlight={pqrs.colorSemaforo === 'NEGRO' || pqrs.colorSemaforo === 'ROJO'}
              />
            )}
            {pqrs.fechaRespuesta && (
              <InfoRow label="Respondida" value={new Date(pqrs.fechaRespuesta).toLocaleDateString('es-CO')} />
            )}
          </div>

          {/* Solicitante */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Solicitante
            </h2>
            {pqrs.anonimo ? (
              <p className="text-sm text-slate-500 italic">Radicado anónimo</p>
            ) : (
              <>
                <InfoRow label="Nombre" value={pqrs.nombreSolicitante} />
                {pqrs.email && <InfoRow label="Correo" value={pqrs.email} />}
                {pqrs.telefono && <InfoRow label="Teléfono" value={pqrs.telefono} />}
              </>
            )}
          </div>

          {/* Asignación */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Asignación
            </h2>
            {pqrs.asignado ? (
              <>
                <InfoRow label="Funcionario" value={`${pqrs.asignado.nombre} ${pqrs.asignado.apellido}`} />
                {pqrs.asignado.cargo && <InfoRow label="Cargo" value={pqrs.asignado.cargo} />}
              </>
            ) : (
              <p className="text-sm text-slate-500 italic">Sin asignar</p>
            )}
            {pqrs.vuAsignacion && (
              <>
                {pqrs.vuAsignacion.dependenciaSugerida && (
                  <InfoRow label="Dep. sugerida (IA)" value={pqrs.vuAsignacion.dependenciaSugerida} />
                )}
                {pqrs.vuAsignacion.justificacion && (
                  <div>
                    <span className="text-xs text-slate-500">Justificación IA</span>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{pqrs.vuAsignacion.justificacion}</p>
                  </div>
                )}
                {pqrs.vuAsignacion.confianza != null && (
                  <InfoRow label="Confianza IA" value={`${Math.round(pqrs.vuAsignacion.confianza * 100)}%`} />
                )}
                {pqrs.vuAsignacion.diasTerminoLegal != null && (
                  <InfoRow label="Plazo legal" value={`${pqrs.vuAsignacion.diasTerminoLegal} días hábiles`} />
                )}
              </>
            )}
          </div>

          {/* Demografía */}
          {pqrs.vuDemografia && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Datos demográficos
              </h2>
              {pqrs.vuDemografia.genero && <InfoRow label="Género" value={pqrs.vuDemografia.genero} />}
              {pqrs.vuDemografia.rangoEtario && <InfoRow label="Rango etario" value={pqrs.vuDemografia.rangoEtario} />}
              {pqrs.vuDemografia.zona && <InfoRow label="Zona" value={pqrs.vuDemografia.zona} />}
              {pqrs.vuDemografia.condicion && <InfoRow label="Condición" value={pqrs.vuDemografia.condicion} />}
              {pqrs.vuDemografia.municipioResidencia && <InfoRow label="Municipio" value={pqrs.vuDemografia.municipioResidencia} />}
              <p className="text-[10px] text-slate-600 italic">Datos para FURAG POL06. Solo visible para funcionarios.</p>
            </div>
          )}
        </div>

        {/* ── Columna derecha: tabs (chat / responder / historial) ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Asunto + descripción */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2">{pqrs.asunto}</h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{pqrs.descripcion}</p>
          </div>

          {/* Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-slate-800 text-sm">
              {(['chat', 'responder', 'historial'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-gov-blue bg-slate-800/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab === 'chat' ? 'Chat' : tab === 'responder' ? 'Responder' : 'Historial'}
                </button>
              ))}
            </div>

            {/* Tab: Chat */}
            {activeTab === 'chat' && (
              <div className="p-4" id="chat">
                <ChatRadicado
                  pqrsId={pqrs.id}
                  token={pqrs.radicado}
                  esFuncionario={true}
                />
              </div>
            )}

            {/* Tab: Responder */}
            {activeTab === 'responder' && (
              <div className="p-4">
                {terminado ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                    <p className="text-sm">Este radicado ya fue {pqrs.estado.toLowerCase()}.</p>
                  </div>
                ) : (
                  <form onSubmit={handleResponder} className="space-y-4">
                    {/* Tipo de respuesta */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">
                        Tipo de respuesta <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(TIPO_RESPUESTA_LABELS).map(([k, v]) => (
                          <label
                            key={k}
                            className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                              tipoResp === k
                                ? 'bg-gov-blue/10 border-gov-blue text-white'
                                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="tipoResp"
                              value={k}
                              checked={tipoResp === k}
                              onChange={() => setTipoResp(k)}
                              className="mt-0.5 accent-gov-blue"
                            />
                            <div>
                              <p className="text-xs font-semibold">{v.label}</p>
                              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{v.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Entidad destino (REMISION / TRASLADO) */}
                    {['REMISION', 'TRASLADO'].includes(tipoResp) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Entidad destino <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={entidadDestino}
                            onChange={e => setEntidadDestino(e.target.value)}
                            placeholder="Ej: Alcaldía Municipal de Buga"
                            className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gov-blue"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Radicado destino
                          </label>
                          <input
                            type="text"
                            value={radicadoDestino}
                            onChange={e => setRadicadoDestino(e.target.value)}
                            placeholder="Número de radicado en entidad destino"
                            className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gov-blue"
                          />
                        </div>
                      </div>
                    )}

                    {/* Contenido */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Texto de la respuesta <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={contenido}
                        onChange={e => setContenido(e.target.value)}
                        rows={8}
                        maxLength={5000}
                        placeholder="Redacte la respuesta oficial..."
                        className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gov-blue resize-none"
                        required
                      />
                      <p className="text-xs text-slate-600 text-right mt-0.5">{contenido.length}/5000</p>
                    </div>

                    {/* Firmado por + URL documento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Firmado por</label>
                        <input
                          type="text"
                          value={firmadoPor}
                          onChange={e => setFirmadoPor(e.target.value)}
                          placeholder="Nombre y cargo del firmante"
                          className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gov-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">URL documento adjunto</label>
                        <input
                          type="url"
                          value={archivoUrl}
                          onChange={e => setArchivoUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gov-blue"
                        />
                      </div>
                    </div>

                    {/* Aviso DESISTIMIENTO */}
                    {tipoResp === 'DESISTIMIENTO' && (
                      <div className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 text-xs text-yellow-300">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        El radicado pasará al estado <strong>ANULADA</strong> tras confirmar el desistimiento.
                      </div>
                    )}

                    {apiError && (
                      <p className="text-xs text-red-400 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">
                        {apiError}
                      </p>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={respondiendo || !contenido.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gov-blue hover:bg-gov-blue-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {respondiendo
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
                          : <><Send className="w-4 h-4" /> Emitir respuesta oficial</>
                        }
                      </button>
                    </div>
                  </form>
                )}

                {/* Respuestas previas */}
                {pqrs.vuRespuestas.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Respuestas emitidas</h4>
                    {pqrs.vuRespuestas.map(r => (
                      <div key={r.id} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-emerald-400">{TIPO_RESPUESTA_LABELS[r.tipo]?.label ?? r.tipo}</span>
                          <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString('es-CO')}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{r.contenido}</p>
                        {r.entidadDestino && (
                          <p className="text-xs text-slate-500">→ {r.entidadDestino}{r.radicadoDestino ? ` (${r.radicadoDestino})` : ''}</p>
                        )}
                        {r.firmadoPor && (
                          <p className="text-xs text-slate-500 italic">Firmado: {r.firmadoPor}</p>
                        )}
                        <p className="text-xs text-slate-600">Por: {r.funcionario.nombre} {r.funcionario.apellido}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Historial */}
            {activeTab === 'historial' && (
              <div className="p-4">
                {pqrs.historial.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">Sin entradas de historial.</p>
                ) : (
                  <div className="relative space-y-0">
                    {pqrs.historial.map((h, i) => (
                      <div key={h.id} className="flex gap-3 pb-4 relative">
                        {/* Línea vertical */}
                        {i < pqrs.historial.length - 1 && (
                          <div className="absolute left-[7px] top-4 bottom-0 w-px bg-slate-800" />
                        )}
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-700 border border-slate-600 shrink-0 mt-1 relative z-10" />
                        <div>
                          <p className="text-xs font-semibold text-slate-300">{h.accion.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{h.descripcion}</p>
                          {(h.estadoAnterior || h.estadoNuevo) && (
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              {h.estadoAnterior} → {h.estadoNuevo}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-600 mt-1">
                            {new Date(h.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                            {h.usuario && ` · ${h.usuario.nombre} ${h.usuario.apellido}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal de reasignación ──────────────────────────────────── */}
      {showReasignar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-gov-blue" /> Reasignar radicado
              </h2>
              <button onClick={() => setShowReasignar(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReasignar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nuevo funcionario <span className="text-red-500">*</span>
                </label>
                <select
                  value={nuevoFuncionarioId}
                  onChange={e => setNuevoFuncionarioId(e.target.value)}
                  required
                  className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-gov-blue"
                >
                  <option value="">Seleccionar funcionario…</option>
                  {funcionarios
                    .filter(f => f.id !== pqrs.asignado?.id)
                    .map(f => (
                      <option key={f.id} value={f.id}>
                        {f.nombre} {f.apellido}{f.cargo ? ` — ${f.cargo}` : ''}
                      </option>
                    ))
                  }
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Motivo (opcional)</label>
                <textarea
                  value={motivoReasig}
                  onChange={e => setMotivoReasig(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Razón de la reasignación..."
                  className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gov-blue resize-none"
                />
              </div>

              {apiError && (
                <p className="text-xs text-red-400 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">
                  {apiError}
                </p>
              )}

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowReasignar(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reasignando || !nuevoFuncionarioId}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gov-blue text-white text-sm font-semibold rounded-lg hover:bg-gov-blue-dark transition-colors disabled:opacity-50"
                >
                  {reasignando
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reasignando…</>
                    : <><UserCheck className="w-3.5 h-3.5" /> Confirmar</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Componente auxiliar ──────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
}) {
  return (
    <div>
      <span className="text-xs text-slate-500">{label}</span>
      <p className={`text-sm mt-0.5 ${mono ? 'font-mono' : ''} ${highlight ? 'text-red-400 font-semibold' : 'text-slate-200'}`}>
        {value}
      </p>
    </div>
  )
}
