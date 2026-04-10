"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, FileText, User, Clock, CheckCircle,
  File, Tag, Calendar, AlertTriangle, Send,
  Inbox, Archive, RotateCcw, MessageSquare
} from "lucide-react"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Transaccion {
  id: string; accion: string; descripcion?: string | null
  estadoAnterior?: string | null; estadoNuevo?: string | null
  createdAt: string
  usuario: { nombre: string; apellido: string; cargo?: string | null }
}

interface Radicado {
  id: string; numero: string; tipo: string; medioRecepcion: string
  asunto: string; folios: number; prioridad: string; estado: string
  observacion?: string | null; fechaVencimiento?: string | null; createdAt: string
  dependencia: { codigo: string; nombre: string }
  subserie?: { codigo: string; nombre: string; serie: { codigo: string; nombre: string } } | null
  tipoDocumental?: { nombre: string; diasTramite: number } | null
  tramitador: { nombre: string; apellido: string; cargo?: string | null; email: string }
  creador: { nombre: string; apellido: string }
  remitentes: { id: string; nombre: string; tipoPersona: string; documento?: string | null; email?: string | null; telefono?: string | null }[]
  documentos: { id: string; nombre: string; esPrincipal: boolean; folios: number; archivoUrl: string }[]
  transacciones: Transaccion[]
  pqrs?: { id: string; radicado: string; tipo: string; estado: string; asunto: string } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACCION_ICON: Record<string, any> = {
  RADICACION: Inbox,
  REASIGNACION: RotateCcw,
  CARGA_DOCUMENTO: File,
  RESPUESTA: Send,
  DEVOLUCION: ArrowLeft,
  VOBO_SOLICITUD: Clock,
  VOBO_APROBACION: CheckCircle,
  VOBO_RECHAZO: AlertTriangle,
  ARCHIVO: Archive,
  ANULACION: AlertTriangle,
  NOTIFICACION: MessageSquare,
  INFORMADO: MessageSquare,
  VINCULO_PADRE: FileText,
}

const ACCION_COLOR: Record<string, string> = {
  RADICACION: "bg-blue-600",
  REASIGNACION: "bg-amber-600",
  CARGA_DOCUMENTO: "bg-teal-600",
  RESPUESTA: "bg-green-600",
  DEVOLUCION: "bg-red-600",
  VOBO_SOLICITUD: "bg-cyan-600",
  VOBO_APROBACION: "bg-emerald-600",
  VOBO_RECHAZO: "bg-red-800",
  ARCHIVO: "bg-slate-600",
  ANULACION: "bg-red-800",
  NOTIFICACION: "bg-purple-600",
  INFORMADO: "bg-indigo-600",
  VINCULO_PADRE: "bg-violet-600",
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const PRIORIDAD_COLOR: Record<string, string> = {
  BAJA: "text-gray-400",
  NORMAL: "text-blue-400",
  ALTA: "text-orange-400",
  URGENTE: "text-red-400",
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function RadicadoDetalleClient({ radicado }: { radicado: Radicado }) {
  const [tab, setTab] = useState<"info" | "remitentes" | "documentos" | "log">("info")

  const vencido = radicado.fechaVencimiento &&
    new Date(radicado.fechaVencimiento) < new Date() &&
    radicado.estado === "EN_TRAMITE"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* ── Header ── */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-start gap-4">
          <Link href="/admin/gd" className="p-2 hover:bg-white/10 rounded-xl mt-1">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-mono text-2xl font-bold text-cyan-400">{radicado.numero}</h1>
              <span className="px-2.5 py-0.5 bg-blue-900/50 text-blue-300 rounded-full text-xs font-semibold">
                {radicado.tipo}
              </span>
              <span className={`text-xs font-semibold ${PRIORIDAD_COLOR[radicado.prioridad]}`}>
                ● {radicado.prioridad}
              </span>
              {vencido && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-900/50 text-red-300 rounded-full text-xs font-semibold">
                  <AlertTriangle className="w-3 h-3" /> VENCIDO
                </span>
              )}
            </div>
            <p className="text-white text-lg font-medium mt-1">{radicado.asunto}</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {radicado.dependencia.codigo} — {radicado.dependencia.nombre} ·
              Radicado el {formatFecha(radicado.createdAt)} ·
              Estado: <span className="text-yellow-300">{radicado.estado.replace("_", " ")}</span>
            </p>
          </div>

          {/* Botón de Respuesta */}
          <div className="flex items-center gap-2">
            {radicado.estado !== "RESUELTO" && radicado.estado !== "ARCHIVADO" && (
              <Link href={`/admin/gd/${radicado.id}/respuesta`} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold shadow-lg shadow-green-900/30 transition-all">
                <Send className="w-4 h-4" /> Generar Respuesta
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── PQRS vinculado ── */}
      {radicado.pqrs && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="flex items-center gap-3 bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-sm">
            <Tag className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <span className="text-orange-300">
              Vinculado a PQRS <strong>{radicado.pqrs.radicado}</strong> — {radicado.pqrs.tipo} — {radicado.pqrs.estado}
            </span>
            <Link href={`/admin/pqrsd/${radicado.pqrs.id}`} className="ml-auto text-orange-400 hover:text-orange-300 font-medium text-xs">
              Ver PQRS →
            </Link>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="max-w-6xl mx-auto px-6 pt-5">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(["info", "remitentes", "documentos", "log"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {t === "log" ? "Historial" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* ── Tab: Info ── */}
        {tab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Datos generales */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Datos del Radicado
              </h3>
              {[
                ["Número", radicado.numero],
                ["Tipo", radicado.tipo],
                ["Medio de Recepción", radicado.medioRecepcion.replace("_", " ")],
                ["Folios", String(radicado.folios)],
                ["Vence", radicado.fechaVencimiento ? formatFecha(radicado.fechaVencimiento) : "Sin fecha"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-white font-medium text-right ml-4">{v}</span>
                </div>
              ))}
              {radicado.observacion && (
                <div className="border-t border-white/10 pt-3">
                  <p className="text-xs text-slate-400 mb-1">Observaciones</p>
                  <p className="text-slate-300 text-sm">{radicado.observacion}</p>
                </div>
              )}
            </div>

            {/* TRD */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Archive className="w-4 h-4 text-emerald-400" /> Clasificación TRD
              </h3>
              {[
                ["Dependencia", `${radicado.dependencia.codigo} — ${radicado.dependencia.nombre}`],
                ["Serie", radicado.subserie ? `${radicado.subserie.serie.codigo} — ${radicado.subserie.serie.nombre}` : "—"],
                ["Subserie", radicado.subserie ? `${radicado.subserie.codigo} — ${radicado.subserie.nombre}` : "—"],
                ["Tipo Documental", radicado.tipoDocumental ? `${radicado.tipoDocumental.nombre} (${radicado.tipoDocumental.diasTramite} días)` : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-white font-medium text-right ml-4 max-w-[180px] truncate" title={v}>{v}</span>
                </div>
              ))}
            </div>

            {/* Tramitador */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" /> Tramitador Actual
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {radicado.tramitador.nombre[0]}{radicado.tramitador.apellido[0]}
                </div>
                <div>
                  <p className="text-white font-medium">{radicado.tramitador.nombre} {radicado.tramitador.apellido}</p>
                  <p className="text-slate-400 text-xs">{radicado.tramitador.cargo ?? radicado.tramitador.email}</p>
                </div>
              </div>
              <p className="text-slate-500 text-xs">
                Creado por {radicado.creador.nombre} {radicado.creador.apellido}
              </p>
            </div>
          </div>
        )}

        {/* ── Tab: Remitentes ── */}
        {tab === "remitentes" && (
          <div className="space-y-3">
            {radicado.remitentes.map((r) => (
              <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {r.nombre[0]}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-slate-400 text-xs">Nombre</p><p className="text-white">{r.nombre}</p></div>
                  <div><p className="text-slate-400 text-xs">Tipo</p><p className="text-white">{r.tipoPersona.replace("_", " ")}</p></div>
                  {r.documento && <div><p className="text-slate-400 text-xs">Documento</p><p className="text-white">{r.documento}</p></div>}
                  {r.email && <div><p className="text-slate-400 text-xs">Email</p><p className="text-white">{r.email}</p></div>}
                  {r.telefono && <div><p className="text-slate-400 text-xs">Teléfono</p><p className="text-white">{r.telefono}</p></div>}
                </div>
              </div>
            ))}
            {radicado.remitentes.length === 0 && (
              <div className="text-center py-10 text-slate-500">Sin remitentes registrados</div>
            )}
          </div>
        )}

        {/* ── Tab: Documentos ── */}
        {tab === "documentos" && (
          <div className="space-y-3">
            {radicado.documentos.map((d) => (
              <div key={d.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <File className={`w-8 h-8 flex-shrink-0 ${d.esPrincipal ? "text-blue-400" : "text-slate-400"}`} />
                <div className="flex-1">
                  <p className="text-white font-medium">{d.nombre}</p>
                  <p className="text-slate-400 text-xs">{d.folios} folios · {d.esPrincipal ? "Documento principal" : "Anexo"}</p>
                </div>
                <a href={d.archivoUrl} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/50 text-blue-300 rounded-lg text-xs font-medium transition-all">
                  Descargar
                </a>
              </div>
            ))}
            {radicado.documentos.length === 0 && (
              <div className="text-center py-10 text-slate-500">Sin documentos adjuntos</div>
            )}
          </div>
        )}

        {/* ── Tab: Historial / Timeline ── */}
        {tab === "log" && (
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10" />
            <div className="space-y-6 pl-14">
              {radicado.transacciones.map((t) => {
                const Icon = ACCION_ICON[t.accion] ?? Clock
                const color = ACCION_COLOR[t.accion] ?? "bg-slate-600"
                return (
                  <div key={t.id} className="relative">
                    <div className={`absolute -left-9 w-8 h-8 rounded-full ${color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold text-sm">{t.accion.replace("_", " ")}</span>
                        <span className="text-slate-500 text-xs">{formatFecha(t.createdAt)}</span>
                      </div>
                      {t.descripcion && <p className="text-slate-300 text-sm mb-2">{t.descripcion}</p>}
                      {t.estadoNuevo && (
                        <p className="text-xs text-slate-500">
                          Estado: {t.estadoAnterior?.replace("_", " ") ?? "—"} → <span className="text-yellow-300">{t.estadoNuevo.replace("_", " ")}</span>
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Por {t.usuario.nombre} {t.usuario.apellido}{t.usuario.cargo ? ` (${t.usuario.cargo})` : ""}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
