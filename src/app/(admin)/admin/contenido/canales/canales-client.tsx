'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Save,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react'

const TIPOS = [
  'PRESENCIAL',
  'VIRTUAL',
  'TELEFONICO',
  'EMAIL',
  'REDES_SOCIALES',
  'CHAT',
  'WHATSAPP',
] as const

type TipoCanal = (typeof TIPOS)[number]

interface Canal {
  id: string
  tipo: TipoCanal
  nombre: string
  valor: string
  descripcion: string | null
  icono: string | null
  orden: number
  activo: boolean
}

type CanalDraft = Omit<Canal, 'id'> & { id?: string }

const EMPTY: CanalDraft = {
  tipo: 'PRESENCIAL',
  nombre: '',
  valor: '',
  descripcion: null,
  icono: null,
  orden: 0,
  activo: true,
}

export function CanalesClient({ initialCanales }: { initialCanales: Canal[] }) {
  const [canales, setCanales] = useState<Canal[]>(initialCanales)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [creating, setCreating] = useState<CanalDraft | null>(null)
  const [savingId, setSavingId] = useState<string | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(d: CanalDraft) {
    setSavingId('new')
    setError(null)
    try {
      const res = await fetch('/api/admin/contenido/canales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const created: Canal = await res.json()
      setCanales((s) => [...s, created])
      setCreating(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear canal')
    } finally {
      setSavingId(null)
    }
  }

  async function handleUpdate(id: string, d: CanalDraft) {
    setSavingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/contenido/canales/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const updated: Canal = await res.json()
      setCanales((s) => s.map((x) => (x.id === id ? updated : x)))
      setExpandedId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este canal?')) return
    setSavingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/contenido/canales/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      setCanales((s) => s.filter((x) => x.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Canales de Atención</h1>
          <p className="text-sm text-gray-500 mt-1">
            Canales habilitados para que el ciudadano contacte la entidad.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreating({ ...EMPTY })}
          disabled={creating !== null}
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo canal
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {creating && (
        <Card className="border-blue-300">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4 text-blue-900">Nuevo canal</h2>
            <CanalForm
              draft={creating}
              onChange={setCreating}
              onCancel={() => setCreating(null)}
              onSave={() => handleCreate(creating)}
              saving={savingId === 'new'}
            />
          </CardContent>
        </Card>
      )}

      {canales.length === 0 && !creating ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No hay canales registrados.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {canales.map((c) => (
              <CanalRow
                key={c.id}
                canal={c}
                expanded={expandedId === c.id}
                onToggle={() =>
                  setExpandedId((id) => (id === c.id ? null : c.id))
                }
                onSave={(d) => handleUpdate(c.id, d)}
                onDelete={() => handleDelete(c.id)}
                saving={savingId === c.id}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CanalRow({
  canal,
  expanded,
  onToggle,
  onSave,
  onDelete,
  saving,
}: {
  canal: Canal
  expanded: boolean
  onToggle: () => void
  onSave: (d: CanalDraft) => void
  onDelete: () => void
  saving: boolean
}) {
  const [draft, setDraft] = useState<CanalDraft>(canal)
  function reset() {
    setDraft(canal)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (!expanded) reset()
          onToggle()
        }}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {canal.tipo}
            </span>
            <span className="font-semibold text-gray-900 truncate">
              {canal.nombre}
            </span>
            {!canal.activo && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                Inactivo
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{canal.valor}</p>
        </div>
        <span className="text-xs text-gray-400">orden: {canal.orden}</span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t bg-gray-50">
          <CanalForm
            draft={draft}
            onChange={setDraft}
            onCancel={() => {
              reset()
              onToggle()
            }}
            onSave={() => onSave(draft)}
            onDelete={onDelete}
            saving={saving}
          />
        </div>
      )}
    </div>
  )
}

function CanalForm({
  draft,
  onChange,
  onCancel,
  onSave,
  onDelete,
  saving,
}: {
  draft: CanalDraft
  onChange: (d: CanalDraft) => void
  onCancel: () => void
  onSave: () => void
  onDelete?: () => void
  saving: boolean
}) {
  function update<K extends keyof CanalDraft>(k: K, v: CanalDraft[K]) {
    onChange({ ...draft, [k]: v })
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Tipo *" required>
        <select
          value={draft.tipo}
          onChange={(e) => update('tipo', e.target.value as TipoCanal)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Orden">
        <Input
          type="number"
          value={draft.orden}
          onChange={(e) => update('orden', Number(e.target.value) || 0)}
        />
      </Field>
      <Field label="Nombre *" required>
        <Input
          value={draft.nombre}
          onChange={(e) => update('nombre', e.target.value)}
          placeholder="Línea de atención al ciudadano"
          required
        />
      </Field>
      <Field label="Valor *" required>
        <Input
          value={draft.valor}
          onChange={(e) => update('valor', e.target.value)}
          placeholder="(602) 0000000  o  email@..."
          required
        />
      </Field>
      <Field label="Descripción" className="sm:col-span-2">
        <Textarea
          value={draft.descripcion ?? ''}
          onChange={(e) => update('descripcion', e.target.value || null)}
          rows={2}
        />
      </Field>
      <Field label="Icono (lucide-react name)">
        <Input
          value={draft.icono ?? ''}
          onChange={(e) => update('icono', e.target.value || null)}
          placeholder="Phone, Mail, MessageCircle..."
        />
      </Field>
      <div className="flex items-end">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.activo}
            onChange={(e) => update('activo', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          Activo
        </label>
      </div>

      <div className="sm:col-span-2 flex items-center justify-between gap-2 pt-3 border-t">
        <div>
          {onDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              disabled={saving}
              className="text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Eliminar
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Guardar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
      {...rest}
    />
  )
}
