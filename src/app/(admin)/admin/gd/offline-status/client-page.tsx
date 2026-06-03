"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft, Wifi, WifiOff, RefreshCw, Loader2,
  CheckCircle, AlertTriangle, Clock, Trash2, CloudOff
} from "lucide-react"
import {
  obtenerPendientes,
  sincronizarPendientes,
  eliminarOperacion,
  type OperacionPendiente,
} from "@/lib/offline-sync"

export default function OfflineStatusClient() {
  const [online, setOnline] = useState(true)
  const [pendientes, setPendientes] = useState<OperacionPendiente[]>([])
  const [syncing, setSyncing] = useState(false)
  const [ultimaSync, setUltimaSync] = useState<Date | null>(null)
  const [resultado, setResultado] = useState<{ exitosas: number; fallidas: number } | null>(null)

  useEffect(() => {
    setOnline(navigator.onLine)

    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    cargarPendientes()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const cargarPendientes = useCallback(async () => {
    try {
      const ops = await obtenerPendientes()
      setPendientes(ops)
    } catch { /* IndexedDB not available */ }
  }, [])

  const sincronizar = async () => {
    if (!online) return
    setSyncing(true)
    try {
      const result = await sincronizarPendientes()
      setResultado({ exitosas: result.exitosas, fallidas: result.fallidas })
      setUltimaSync(new Date())
      await cargarPendientes()
    } catch { /* ignore */ }
    setSyncing(false)
  }

  const eliminar = async (id: string) => {
    await eliminarOperacion(id)
    await cargarPendientes()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/gd" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Estado de Conexión
              </h1>
              <p className="text-slate-400 text-sm">Cola de sincronización offline para trabajo en campo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Estado conexión */}
        <div className={`rounded-2xl p-6 border flex items-center gap-4 ${
          online
            ? "bg-emerald-500/5 border-emerald-500/30"
            : "bg-red-500/5 border-red-500/30"
        }`}>
          {online
            ? <Wifi className="w-8 h-8 text-emerald-400" />
            : <WifiOff className="w-8 h-8 text-red-400" />
          }
          <div className="flex-1">
            <p className="font-semibold text-lg">
              {online ? "Conectado" : "Sin conexión"}
            </p>
            <p className="text-sm text-slate-400">
              {online
                ? "Todas las operaciones se procesan en tiempo real"
                : "Las operaciones se encolan para sincronizar al reconectar"
              }
            </p>
          </div>
          {online && pendientes.length > 0 && (
            <button
              onClick={sincronizar}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              {syncing
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />
              }
              Sincronizar
            </button>
          )}
        </div>

        {/* Resultado última sync */}
        {resultado && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-sm">
              <span className="text-emerald-300 font-bold">{resultado.exitosas}</span> sincronizadas ·{" "}
              <span className="text-red-300 font-bold">{resultado.fallidas}</span> fallidas ·{" "}
              <span className="text-slate-400">Última: {ultimaSync?.toLocaleString("es-CO")}</span>
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <CloudOff className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{pendientes.length}</p>
            <p className="text-xs text-slate-400">Pendientes</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <AlertTriangle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{pendientes.filter(p => p.intentos > 0).length}</p>
            <p className="text-xs text-slate-400">Con errores</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{ultimaSync ? "Hoy" : "—"}</p>
            <p className="text-xs text-slate-400">Última sync</p>
          </div>
        </div>

        {/* Cola de pendientes */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="font-semibold text-sm text-slate-300">Cola de Operaciones Pendientes</h3>
          </div>

          {pendientes.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>No hay operaciones pendientes</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {pendientes.map(op => (
                <div key={op.id} className="px-5 py-3 flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${op.intentos > 0 ? "bg-yellow-400" : "bg-cyan-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{op.tipo.replace(/_/g, " ")}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {new Date(op.timestamp).toLocaleString("es-CO")}
                      {op.intentos > 0 && ` · ${op.intentos} intentos · ${op.ultimoError}`}
                    </p>
                  </div>
                  <button onClick={() => eliminar(op.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors" title="Descartar">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
