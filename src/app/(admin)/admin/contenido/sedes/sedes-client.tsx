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
  Star,
} from 'lucide-react'

interface Sede {
  id: string
  nombre: string
  esPrincipal: boolean
  direccion: string
  ciudad: string | null
  telefono: string | null
  email: string | null
  coordenadaLat: number | null
  coordenadaLng: number | null
  horarioAtencion: string | null
  observaciones: string | null
  orden: number
  activa: boolean
}

type SedeDraft = Omit<Sede, 'id'> & { id?: string }

const EMPTY_DRAFT: SedeDraft = {
  nombre: '',
  esPrincipal: false,
  direccion: '',
  ciudad: null,
  telefono: null,
  email: null,
  coordenadaLat: null,
  coordenadaLng: null,
  horarioAtencion: null,
  observaciones: null,
  orden: 0,
  activa: true,
}

export function SedesClient({ initialSedes }: { initialSedes: Sede[] }) {
  const [sedes, setSedes] = useState<Sede[]>(initialSedes)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [creatingDraft, setCreatingDraft] = useState<SedeDraft | null>(null)
  const [savingId, setSavingId] = useState<string | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(draft: SedeDraft) {
    setSavingId('new')
    setError(null)
    try {
      const res = await fetch('/api/admin/contenido/sedes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const created: Sede = await res.json()
      setSedes((s) => [...s, created])
      setCreatingDraft(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear sede')
    } finally {
      setSavingId(null)
    }
  }

  async function handleUpdate(id: string, draft: SedeDraft) {
    setSavingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/contenido/sedes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const updated: Sede = await res.json()
      setSedes((s) => s.map((x) => (x.id === id ? updated : x)))
      setExpandedId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar sede')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta sede? Esta acción no se puede deshacer.')) return
    setSavingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/contenido/sedes/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      setSedes((s) => s.filter((x) => x.id !== id))
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
          <h1 className="text-2xl font-bold text-gray-900">Sedes físicas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sedes de atención al ciudadano. La marcada como "principal" es la dirección
            oficial de la entidad.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreatingDraft({ ...EMPTY_DRAFT })}
          disabled={creatingDraft !== null}
        >
          <Plus className="w-4 h-4 mr-2" /> Nueva sede
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {creatingDraft && (
        <Card className="border-blue-300">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4 text-blue-900">Nueva sede</h2>
            <SedeForm
              draft={creatingDraft}
              onChange={setCreatingDraft}
              onCancel={() => setCreatingDraft(null)}
              onSave={() => handleCreate(creatingDraft)}
              saving={savingId === 'new'}
            />
          </CardContent>
        </Card>
      )}

      {sedes.length === 0 && !creatingDraft ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No hay sedes registradas. Crea la primera con el botón "Nueva sede".
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {sedes.map((sede) => (
              <SedeRow
                key={sede.id}
                sede={sede}
                expanded={expandedId === sede.id}
                onToggle={() =>
                  setExpandedId((id) => (id === sede.id ? null : sede.id))
                }
                onSave={(draft) => handleUpdate(sede.id, draft)}
                onDelete={() => handleDelete(sede.id)}
                saving={savingId === sede.id}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SedeRow({
  sede,
  expanded,
  onToggle,
  onSave,
  onDelete,
  saving,
}: {
  sede: Sede
  expanded: boolean
  onToggle: () => void
  onSave: (draft: SedeDraft) => void
  onDelete: () => void
  saving: boolean
}) {
  const [draft, setDraft] = useState<SedeDraft>(sede)

  // Re-sync draft cuando sede cambia desde el padre (después de save)
  function reset() {
    setDraft(sede)
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
            <span className="font-semibold text-gray-900 truncate">{sede.nombre}</span>
            {sede.esPrincipal && (
              <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                <Star className="w-3 h-3" /> Principal
              </span>
            )}
            {!sede.activa && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                Inactiva
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{sede.direccion}</p>
        </div>
        <span className="text-xs text-gray-400">orden: {sede.orden}</span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t bg-gray-50">
          <SedeForm
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

function SedeForm({
  draft,
  onChange,
  onCancel,
  onSave,
  onDelete,
  saving,
}: {
  draft: SedeDraft
  onChange: (d: SedeDraft) => void
  onCancel: () => void
  onSave: () => void
  onDelete?: () => void
  saving: boolean
}) {
  function update<K extends keyof SedeDraft>(key: K, value: SedeDraft[K]) {
    onChange({ ...draft, [key]: value })
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Nombre *" required>
        <Input
          value={draft.nombre}
          onChange={(e) => update('nombre', e.target.value)}
          placeholder="Sede Principal"
          required
        />
      </Field>
      <Field label="Orden">
        <Input
          type="number"
          value={draft.orden}
          onChange={(e) => update('orden', Number(e.target.value) || 0)}
        />
      </Field>
      <Field label="Dirección *" className="sm:col-span-2" required>
        <Input
          value={draft.direccion}
          onChange={(e) => update('direccion', e.target.value)}
          placeholder="Calle 7 N° 12-45"
          required
        />
      </Field>
      <Field label="Ciudad">
        <Input
          value={draft.ciudad ?? ''}
          onChange={(e) => update('ciudad', e.target.value || null)}
        />
      </Field>
      <Field label="Teléfono">
        <Input
          value={draft.telefono ?? ''}
          onChange={(e) => update('telefono', e.target.value || null)}
        />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          value={draft.email ?? ''}
          onChange={(e) => update('email', e.target.value || null)}
        />
      </Field>
      <Field label="Latitud">
        <Input
          type="number"
          step="any"
          value={draft.coordenadaLat ?? ''}
          onChange={(e) =>
            update(
              'coordenadaLat',
              e.target.value === '' ? null : Number(e.target.value),
            )
          }
        />
      </Field>
      <Field label="Longitud">
        <Input
          type="number"
          step="any"
          value={draft.coordenadaLng ?? ''}
          onChange={(e) =>
            update(
              'coordenadaLng',
              e.target.value === '' ? null : Number(e.target.value),
            )
          }
        />
      </Field>
      <Field label="Horario de atención" className="sm:col-span-2">
        <Textarea
          value={draft.horarioAtencion ?? ''}
          onChange={(e) => update('horarioAtencion', e.target.value || null)}
          rows={3}
          placeholder="Lunes a Viernes 8:00 a.m. – 12:00 m. y 2:00 p.m. – 6:00 p.m."
        />
      </Field>
      <Field label="Observaciones" className="sm:col-span-2">
        <Textarea
          value={draft.observaciones ?? ''}
          onChange={(e) => update('observaciones', e.target.value || null)}
          rows={2}
        />
      </Field>

      <div className="sm:col-span-2 flex flex-wrap items-center gap-4 mt-2">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.esPrincipal}
            onChange={(e) => update('esPrincipal', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          Sede principal
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.activa}
            onChange={(e) => update('activa', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          Activa
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
