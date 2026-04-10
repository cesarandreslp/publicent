"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft, Plus, Key, Copy, CheckCircle, Trash2,
  Clock, Shield, Loader2, AlertTriangle, Eye
} from "lucide-react"

interface ApiKeyInfo {
  id: string
  nombre: string
  keyPrefix: string
  permisos: string[]
  activo: boolean
  ultimoUso: string | null
  usosTotal: number
  creador: { nombre: string; apellido: string; email: string }
  logs: { metodo: string; ruta: string; status: number; ip: string | null; createdAt: string }[]
  _count: { logs: number }
  createdAt: string
}

export default function ApiKeysClient() {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [creando, setCreando] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [rawKeyMostrada, setRawKeyMostrada] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [logExpandido, setLogExpandido] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/gd/api-keys")
      if (res.ok) {
        const data = await res.json()
        setKeys(data.apiKeys)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crearKey = async () => {
    if (!nuevoNombre.trim()) return
    setCreando(true)
    try {
      const res = await fetch("/api/admin/gd/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre, permisos: ["radicados:read"] }),
      })
      if (res.ok) {
        const data = await res.json()
        setRawKeyMostrada(data.apiKey.rawKey)
        setNuevoNombre("")
        cargar()
      }
    } catch { /* ignore */ }
    setCreando(false)
  }

  const revocarKey = async (id: string) => {
    if (!confirm("¿Revocar esta API Key? Las aplicaciones que la usen dejarán de funcionar.")) return
    await fetch(`/api/admin/gd/api-keys?id=${id}`, { method: "DELETE" })
    cargar()
  }

  const copiarKey = () => {
    if (rawKeyMostrada) {
      navigator.clipboard.writeText(rawKeyMostrada)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/gd" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                API Keys
              </h1>
              <p className="text-slate-400 text-sm">Gestión de claves para la API pública REST</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Alerta de raw key */}
        {rawKeyMostrada && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-300 mb-2">API Key creada — ¡Cópiela ahora!</p>
                <p className="text-xs text-yellow-200/70 mb-3">Esta clave NO se mostrará de nuevo. Guárdela en un lugar seguro.</p>
                <div className="flex items-center gap-2">
                  <code className="bg-black/30 px-3 py-2 rounded-lg text-sm text-yellow-200 font-mono flex-1 break-all">
                    {rawKeyMostrada}
                  </code>
                  <button onClick={copiarKey}
                    className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors shrink-0">
                    {copiado ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-yellow-300" />}
                  </button>
                </div>
              </div>
              <button onClick={() => setRawKeyMostrada(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          </div>
        )}

        {/* Crear nueva */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-3">
          <Key className="w-5 h-5 text-violet-400 shrink-0" />
          <input
            type="text"
            value={nuevoNombre}
            onChange={e => setNuevoNombre(e.target.value)}
            placeholder="Nombre de la API Key (ej: App Ventanilla)"
            className="flex-1 bg-white/5 border border-white/15 rounded-xl text-sm px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={crearKey}
            disabled={creando || !nuevoNombre.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          >
            {creando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Crear
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No hay API Keys creadas</div>
        ) : (
          <div className="space-y-3">
            {keys.map(k => (
              <div key={k.id} className={`bg-white/5 border rounded-2xl p-5 ${k.activo ? "border-white/10" : "border-red-500/20 opacity-60"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Shield className={`w-5 h-5 ${k.activo ? "text-violet-400" : "text-red-400"}`} />
                    <div>
                      <p className="font-semibold text-white">{k.nombre}</p>
                      <p className="text-xs text-slate-500 font-mono">{k.keyPrefix}…</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!k.activo && (
                      <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full">Revocada</span>
                    )}
                    <button onClick={() => setLogExpandido(logExpandido === k.id ? null : k.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Ver logs">
                      <Eye className="w-4 h-4 text-slate-400" />
                    </button>
                    {k.activo && (
                      <button onClick={() => revocarKey(k.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors" title="Revocar">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {k.usosTotal} usos</span>
                  <span>Último: {k.ultimoUso ? new Date(k.ultimoUso).toLocaleString("es-CO") : "Nunca"}</span>
                  <span>Creada: {new Date(k.createdAt).toLocaleDateString("es-CO")}</span>
                  <span>Por: {k.creador.nombre} {k.creador.apellido}</span>
                </div>

                {/* Logs expandidos */}
                {logExpandido === k.id && k.logs.length > 0 && (
                  <div className="mt-4 bg-black/20 rounded-xl p-3 space-y-1.5">
                    <p className="text-xs text-slate-500 font-semibold mb-2">Últimas 10 llamadas</p>
                    {k.logs.map((log, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className={`font-mono font-bold ${log.status < 400 ? "text-emerald-400" : "text-red-400"}`}>
                          {log.status}
                        </span>
                        <span className="font-mono text-slate-500">{log.metodo}</span>
                        <span className="flex-1 truncate">{log.ruta}</span>
                        <span>{log.ip ?? "—"}</span>
                        <span>{new Date(log.createdAt).toLocaleString("es-CO")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
