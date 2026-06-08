'use client'

import { useRef, useState } from 'react'
import { X, UploadCloud, FileText, Check, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type MediaItem = {
  url: string
  name: string
  type: 'image' | 'document' | 'other'
}

function tipoDeArchivo(file: File): 'image' | 'document' | 'other' {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type === 'application/pdf' || file.type.includes('word') || file.type.includes('document')) return 'document'
  return 'other'
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean
  onClose: () => void
  // alt: texto alternativo (obligatorio para imágenes no decorativas, WCAG 1.1.1)
  onSelect: (url: string, type: 'image' | 'document' | 'other', alt?: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<MediaItem[]>([])
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [alt, setAlt] = useState('')
  const [decorativa, setDecorativa] = useState(false)

  if (!isOpen) return null

  const esImagen = selected?.type === 'image'
  const altInvalido = esImagen && !decorativa && alt.trim().length === 0

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true); setError(null)
    try {
      for (const file of Array.from(files)) {
        const tipo = tipoDeArchivo(file)
        const fd = new FormData()
        fd.append('archivo', file)
        fd.append('tipo', tipo === 'image' ? 'imagen' : tipo === 'document' ? 'documento' : 'todos')
        fd.append('carpeta', 'cms')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok || !data.success || !data.url) {
          throw new Error(data.error ?? data.mensaje ?? 'Error al subir el archivo')
        }
        const item: MediaItem = { url: data.url, name: data.nombreArchivo ?? file.name, type: tipo }
        setItems((prev) => [item, ...prev])
        setSelected(item); setAlt(''); setDecorativa(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function confirmar() {
    if (!selected) return
    if (altInvalido) return
    const altFinal = selected.type === 'image' ? (decorativa ? '' : alt.trim()) : undefined
    onSelect(selected.url, selected.type, altFinal)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Subir e insertar medio</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Dropzone / subir */}
          <input ref={inputRef} type="file" className="hidden" multiple
            accept="image/*,application/pdf,.doc,.docx"
            onChange={(e) => handleFiles(e.target.files)} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="w-full flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-6 hover:border-gov-blue transition disabled:opacity-60">
            {uploading ? <Loader2 className="w-10 h-10 text-gov-blue mb-3 animate-spin" /> : <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />}
            <span className="text-sm font-medium text-gray-900">{uploading ? 'Subiendo…' : 'Haz clic para subir archivos'}</span>
            <span className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP, PDF, DOCX</span>
          </button>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Archivos subidos en esta sesión */}
          {items.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {items.map((m) => (
                <button key={m.url} type="button"
                  onClick={() => { setSelected(m); setAlt(''); setDecorativa(false) }}
                  className={`relative text-left bg-white border rounded-xl overflow-hidden transition ${selected?.url === m.url ? 'border-gov-blue ring-2 ring-gov-blue/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {m.type === 'image'
                      ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.url} alt="" className="w-full h-full object-cover" />
                      : <FileText className="w-10 h-10 text-gray-400" />}
                    {selected?.url === m.url && <div className="absolute top-1.5 right-1.5 bg-gov-blue text-white rounded-full p-1"><Check className="w-3.5 h-3.5" /></div>}
                  </div>
                  <p className="text-[11px] text-gray-600 truncate px-2 py-1" title={m.name}>{m.name}</p>
                </button>
              ))}
            </div>
          )}

          {/* Texto alternativo (WCAG) — obligatorio para imágenes */}
          {esImagen && (
            <div className="border border-gray-200 rounded-xl p-4 bg-blue-50/30">
              <label className="block text-sm font-medium text-gray-800">
                Texto alternativo de la imagen <span className="text-red-600">*</span>
              </label>
              <p className="text-xs text-gray-500 mt-0.5 mb-2">
                Describe la imagen para personas con lectores de pantalla (obligatorio por accesibilidad — Res. 1519 / WCAG 1.1.1).
              </p>
              <input value={alt} onChange={(e) => setAlt(e.target.value)} disabled={decorativa}
                placeholder="Ej: Fachada de la sede principal de la entidad"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100" />
              <label className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                <input type="checkbox" checked={decorativa} onChange={(e) => setDecorativa(e.target.checked)} className="accent-gov-blue" />
                Es una imagen puramente decorativa (sin información)
              </label>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button className="bg-gov-blue text-white hover:bg-gov-blue-dark disabled:opacity-50"
            disabled={!selected || altInvalido || uploading}
            onClick={confirmar}>
            Insertar
          </Button>
        </div>
      </div>
    </div>
  )
}
