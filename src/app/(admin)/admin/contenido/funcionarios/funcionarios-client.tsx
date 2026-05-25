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
  EyeOff,
} from 'lucide-react'

interface Funcionario {
  id: string
  nombre: string
  cargo: string
  dependencia: string
  email: string | null
  telefono: string | null
  extension: string | null
  foto: string | null
  orden: number
  activo: boolean
  formacionAcademica: string | null
  experiencia: string | null
  tipoVinculacion: string | null
  visibleEnDirectorio: boolean
}

type FuncionarioDraft = Omit<Funcionario, 'id'> & { id?: string }

const EMPTY: FuncionarioDraft = {
  nombre: '',
  cargo: '',
  dependencia: '',
  email: null,
  telefono: null,
  extension: null,
  foto: null,
  orden: 0,
  activo: true,
  formacionAcademica: null,
  experiencia: null,
  tipoVinculacion: null,
  visibleEnDirectorio: true,
}

export function FuncionariosClient({
  initialFuncionarios,
}: {
  initialFuncionarios: Funcionario[]
}) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(initialFuncionarios)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [creating, setCreating] = useState<FuncionarioDraft | null>(null)
  const [savingId, setSavingId] = useState<string | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(d: FuncionarioDraft) {
    setSavingId('new')
    setError(null)
    try {
      const res = await fetch('/api/admin/contenido/funcionarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const created: Funcionario = await res.json()
      setFuncionarios((s) => [...s, created])
      setCreating(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear funcionario')
    } finally {
      setSavingId(null)
    }
  }

  async function handleUpdate(id: string, d: FuncionarioDraft) {
    setSavingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/contenido/funcionarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const updated: Funcionario = await res.json()
      setFuncionarios((s) => s.map((x) => (x.id === id ? updated : x)))
      setExpandedId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este funcionario del directorio?')) return
    setSavingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/contenido/funcionarios/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      setFuncionarios((s) => s.filter((x) => x.id !== id))
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
          <h1 className="text-2xl font-bold text-gray-900">Funcionarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Directorio público de servidores. Solo los marcados como "visibles en
            directorio" aparecen en /entidad/directorio.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreating({ ...EMPTY })}
          disabled={creating !== null}
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo funcionario
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
            <h2 className="font-semibold mb-4 text-blue-900">Nuevo funcionario</h2>
            <FuncionarioForm
              draft={creating}
              onChange={setCreating}
              onCancel={() => setCreating(null)}
              onSave={() => handleCreate(creating)}
              saving={savingId === 'new'}
            />
          </CardContent>
        </Card>
      )}

      {funcionarios.length === 0 && !creating ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No hay funcionarios registrados.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {funcionarios.map((f) => (
              <FuncionarioRow
                key={f.id}
                funcionario={f}
                expanded={expandedId === f.id}
                onToggle={() =>
                  setExpandedId((id) => (id === f.id ? null : f.id))
                }
                onSave={(d) => handleUpdate(f.id, d)}
                onDelete={() => handleDelete(f.id)}
                saving={savingId === f.id}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function FuncionarioRow({
  funcionario,
  expanded,
  onToggle,
  onSave,
  onDelete,
  saving,
}: {
  funcionario: Funcionario
  expanded: boolean
  onToggle: () => void
  onSave: (d: FuncionarioDraft) => void
  onDelete: () => void
  saving: boolean
}) {
  const [draft, setDraft] = useState<FuncionarioDraft>(funcionario)
  function reset() {
    setDraft(funcionario)
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
            <span className="font-semibold text-gray-900 truncate">
              {funcionario.nombre}
            </span>
            {!funcionario.visibleEnDirectorio && (
              <span className="inline-flex items-center gap-1 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                <EyeOff className="w-3 h-3" /> Oculto
              </span>
            )}
            {!funcionario.activo && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                Inactivo
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {funcionario.cargo} · {funcionario.dependencia}
          </p>
        </div>
        <span className="text-xs text-gray-400">orden: {funcionario.orden}</span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t bg-gray-50">
          <FuncionarioForm
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

function FuncionarioForm({
  draft,
  onChange,
  onCancel,
  onSave,
  onDelete,
  saving,
}: {
  draft: FuncionarioDraft
  onChange: (d: FuncionarioDraft) => void
  onCancel: () => void
  onSave: () => void
  onDelete?: () => void
  saving: boolean
}) {
  function update<K extends keyof FuncionarioDraft>(k: K, v: FuncionarioDraft[K]) {
    onChange({ ...draft, [k]: v })
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Nombre completo *" required>
        <Input
          value={draft.nombre}
          onChange={(e) => update('nombre', e.target.value)}
          required
        />
      </Field>
      <Field label="Cargo *" required>
        <Input
          value={draft.cargo}
          onChange={(e) => update('cargo', e.target.value)}
          required
        />
      </Field>
      <Field label="Dependencia *" required>
        <Input
          value={draft.dependencia}
          onChange={(e) => update('dependencia', e.target.value)}
          required
        />
      </Field>
      <Field label="Tipo de vinculación">
        <Input
          value={draft.tipoVinculacion ?? ''}
          onChange={(e) => update('tipoVinculacion', e.target.value || null)}
          placeholder="Elección Popular, Carrera Administrativa, Contratista..."
        />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          value={draft.email ?? ''}
          onChange={(e) => update('email', e.target.value || null)}
        />
      </Field>
      <Field label="Teléfono">
        <Input
          value={draft.telefono ?? ''}
          onChange={(e) => update('telefono', e.target.value || null)}
        />
      </Field>
      <Field label="Extensión">
        <Input
          value={draft.extension ?? ''}
          onChange={(e) => update('extension', e.target.value || null)}
        />
      </Field>
      <Field label="Orden">
        <Input
          type="number"
          value={draft.orden}
          onChange={(e) => update('orden', Number(e.target.value) || 0)}
        />
      </Field>
      <Field label="URL foto" className="sm:col-span-2">
        <Input
          value={draft.foto ?? ''}
          onChange={(e) => update('foto', e.target.value || null)}
          placeholder="https://..."
        />
      </Field>
      <Field label="Formación académica" className="sm:col-span-2">
        <Textarea
          value={draft.formacionAcademica ?? ''}
          onChange={(e) => update('formacionAcademica', e.target.value || null)}
          rows={2}
        />
      </Field>
      <Field label="Experiencia" className="sm:col-span-2">
        <Textarea
          value={draft.experiencia ?? ''}
          onChange={(e) => update('experiencia', e.target.value || null)}
          rows={3}
        />
      </Field>

      <div className="sm:col-span-2 flex flex-wrap items-center gap-4 mt-2">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.visibleEnDirectorio}
            onChange={(e) => update('visibleEnDirectorio', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          Visible en directorio público
        </label>
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
