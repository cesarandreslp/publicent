"use client"

import { useState } from "react"
import type { StorageConfig, StorageProvider } from "@/lib/modules"

// ─── Metadatos por proveedor ──────────────────────────────────────────────────

const PROVEEDORES: { value: StorageProvider; label: string; logo: string; desc: string }[] = [
  { value: "local",  label: "Disco Local",        logo: "💾", desc: "El servidor de la aplicación. Solo para pruebas." },
  { value: "minio",  label: "MinIO (self-hosted)", logo: "🗄️", desc: "Servidor S3-compatible propio. Ideal para entidades con infraestructura propia." },
  { value: "s3",     label: "AWS S3",             logo: "☁️", desc: "Servicio de Amazon Web Services. Altamente confiable y escalable." },
  { value: "r2",     label: "Cloudflare R2",      logo: "🔶", desc: "Compatible con S3. Sin cargos por transferencia de datos salientes." },
  { value: "gcs",    label: "Google Cloud Storage",logo: "🔵", desc: "Vía API S3-compatible. Requiere HMAC keys en GCP." },
  { value: "azure",  label: "Azure Blob Storage",  logo: "🔷", desc: "Vía endpoint compatible con S3. Requiere configuración adicional en Azure." },
  { value: "sftp",   label: "Servidor SFTP/SSH",   logo: "🖥️", desc: "Servidor de archivos propio con acceso SSH. Sin dependencias de nube." },
]

interface Props {
  tenantId: string
  initialConfig?: StorageConfig
}

const EMPTY: StorageConfig = {
  provider: "local",
  prefix: "documentos/",
  publicBaseUrl: "",
}

export default function StorageConfigPanel({ tenantId, initialConfig }: Props) {
  const [cfg, setCfg] = useState<StorageConfig>(initialConfig ?? EMPTY)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [saved, setSaved] = useState(false)

  function update(partial: Partial<StorageConfig>) {
    setCfg((prev) => ({ ...prev, ...partial }))
    setTestResult(null)
    setSaved(false)
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch("/api/admin/gd/storage/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage: cfg }),
      })
      const data = await res.json()
      setTestResult(data)
    } catch {
      setTestResult({ ok: false, message: "Error de red al probar la conexión" })
    } finally {
      setTesting(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/superadmin/tenants/${tenantId}/modulos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageConfig: cfg }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 4000)
      }
    } catch { /* ignorar */ }
    finally { setSaving(false) }
  }

  const inputCls = "w-full px-3 py-2 text-sm bg-[#0a0f1e] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition"
  const labelCls = "block text-xs font-medium text-slate-400 mb-1"

  const esS3Compat = ["s3", "minio", "r2", "gcs", "azure"].includes(cfg.provider)
  const esSftp = cfg.provider === "sftp"
  const esLocal = cfg.provider === "local"

  return (
    <div className="space-y-6">
      {/* Selector de proveedor */}
      <div>
        <p className="text-sm font-semibold text-white mb-3">Proveedor de almacenamiento</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {PROVEEDORES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update({ provider: p.value })}
              title={p.desc}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center text-xs transition-all ${
                cfg.provider === p.value
                  ? "border-blue-500 bg-blue-600/20 text-white"
                  : "border-slate-700 bg-[#0a0f1e] text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              <span className="text-2xl">{p.logo}</span>
              <span className="font-medium leading-tight">{p.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {PROVEEDORES.find((p) => p.value === cfg.provider)?.desc}
        </p>
      </div>

      {/* Campos comunes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Prefijo de carpeta</label>
          <input value={cfg.prefix ?? ""} onChange={(e) => update({ prefix: e.target.value })}
            placeholder="documentos/" className={inputCls} />
          <p className="text-xs text-slate-600 mt-1">Subcarpeta raíz dentro del bucket/servidor</p>
        </div>
        <div>
          <label className={labelCls}>URL pública base (para descargas)</label>
          <input value={cfg.publicBaseUrl ?? ""} onChange={(e) => update({ publicBaseUrl: e.target.value })}
            placeholder="https://docs.personeriabuga.gov.co" className={inputCls} />
          <p className="text-xs text-slate-600 mt-1">Base de las URLs de descarga pública</p>
        </div>
      </div>

      {/* Campos S3-compatible */}
      {esS3Compat && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
            Configuración {cfg.provider === "minio" ? "MinIO" : cfg.provider === "r2" ? "Cloudflare R2" : "S3"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Bucket / Contenedor *</label>
              <input value={cfg.bucket ?? ""} onChange={(e) => update({ bucket: e.target.value })}
                placeholder="personeria-buga-docs" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Región</label>
              <input value={cfg.region ?? ""} onChange={(e) => update({ region: e.target.value })}
                placeholder={cfg.provider === "r2" ? "auto" : "us-east-1"} className={inputCls} />
            </div>
            {cfg.provider !== "s3" && (
              <div className="md:col-span-2">
                <label className={labelCls}>
                  {cfg.provider === "r2" ? "Endpoint de cuenta R2" :
                  cfg.provider === "minio" ? "URL del servidor MinIO" :
                  "Endpoint personalizado"} *
                </label>
                <input value={cfg.endpoint ?? ""} onChange={(e) => update({ endpoint: e.target.value })}
                  placeholder={
                    cfg.provider === "r2" ? "https://<ACCOUNT_ID>.r2.cloudflarestorage.com" :
                    cfg.provider === "minio" ? "http://minio.midominio.com:9000" :
                    "https://storage.googleapis.com"
                  }
                  className={inputCls} />
              </div>
            )}
            <div>
              <label className={labelCls}>
                {cfg.provider === "azure" ? "Account Name" : "Access Key ID"} *
              </label>
              <input value={cfg.accessKeyId ?? ""} onChange={(e) => update({ accessKeyId: e.target.value })}
                placeholder={cfg.provider === "azure" ? "myaccount" : "AKIAIOSFODNN7EXAMPLE"} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>
                {cfg.provider === "azure" ? "Account Key" : "Secret Access Key"} *
              </label>
              <input type="password" value={cfg.secretAccessKey ?? ""} onChange={(e) => update({ secretAccessKey: e.target.value })}
                placeholder="••••••••••••••••••••••••••••" className={inputCls} />
            </div>
          </div>
        </div>
      )}

      {/* Campos SFTP */}
      {esSftp && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Configuración SFTP</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Host *</label>
              <input value={cfg.sftpHost ?? ""} onChange={(e) => update({ sftpHost: e.target.value })}
                placeholder="sftp.personeriabuga.gov.co" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Puerto (default: 22)</label>
              <input value={cfg.sftpPort ?? "22"} onChange={(e) => update({ sftpPort: e.target.value })}
                placeholder="22" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Usuario *</label>
              <input value={cfg.sftpUser ?? ""} onChange={(e) => update({ sftpUser: e.target.value })}
                placeholder="gestor_docs" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Contraseña *</label>
              <input type="password" value={cfg.sftpPassword ?? ""} onChange={(e) => update({ sftpPassword: e.target.value })}
                placeholder="••••••••••••••••" className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Ruta base en el servidor *</label>
              <input value={cfg.sftpBasePath ?? "/uploads"} onChange={(e) => update({ sftpBasePath: e.target.value })}
                placeholder="/var/www/documentos" className={inputCls} />
            </div>
          </div>
        </div>
      )}

      {/* Local */}
      {esLocal && (
        <div className="flex gap-3 items-start bg-amber-900/20 border border-amber-800/40 rounded-xl px-4 py-3">
          <span className="text-xl">⚠️</span>
          <p className="text-xs text-amber-300">
            El almacenamiento local guarda los archivos en la carpeta <code className="bg-black/30 px-1 rounded">public/uploads/</code> del servidor.
            Es adecuado solo para desarrollo o entornos de prueba. <strong>No se recomienda para producción</strong> ya que los archivos pueden perderse al reiniciar el servidor o hacer deployer.
          </p>
        </div>
      )}

      {/* Resultado del test */}
      {testResult && (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
          testResult.ok
            ? "bg-emerald-900/30 border border-emerald-700/50 text-emerald-300"
            : "bg-red-900/30 border border-red-700/50 text-red-300"
        }`}>
          <span>{testResult.ok ? "✅" : "❌"}</span>
          {testResult.message}
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleTest}
          disabled={testing || esLocal}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-sm text-white rounded-xl transition"
        >
          {testing ? "Probando…" : "🔌 Probar conexión"}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-sm font-semibold text-white rounded-xl transition shadow-lg shadow-blue-900/30"
        >
          {saving ? "Guardando…" : saved ? "✅ Guardado" : "Guardar configuración"}
        </button>
      </div>
    </div>
  )
}
