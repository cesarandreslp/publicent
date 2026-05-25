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

const CATEGORIAS = [
  'GENERAL',
  'PQRSD',
  'TRAMITES',
  'ACCESO_INFORMACION',
  'ATENCION',
  'OTROS',
] as const

type Categoria = (typeof CATEGORIAS)[number]

interface Faq {
  id: string
  pregunta: string
  respuesta: string
  categoria: Categoria
  orden: number
  publicada: boolean
}

type FaqDraft = Omit<Faq, 'id'> & { id?: string }

const EMPTY: FaqDraft = {
  pregunta: '',
  respuesta: '',
  categoria: 'GENERAL',
  orden: 0,
  publicada: true,
}

export function FaqsClient({ initialFaqs }: { initialFaqs: Faq[] }) {
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [creating, setCreating] = useState<FaqDraft | null>(null)
  const [savingId, setSavingId] = useState<string | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(d: FaqDraft) {
    setSavingId('new')
    setError(null)
    try {
      const res = await fetch('/api/admin/contenido/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const created: Faq = await res.json()
      setFaqs((s) => [...s, created])
      setCreating(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear FAQ')
    } finally {
      setSavingId(null)
    }
  }

  async function handleUpdate(id: string, d: FaqDraft) {
    setSavingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/contenido/faqs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const updated: Faq = await res.json()
      setFaqs((s) => s.map((x) => (x.id === id ? updated : x)))
      setExpandedId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta pregunta?')) return
    setSavingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/contenido/faqs/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      setFaqs((s) => s.filter((x) => x.id !== id))
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
          <h1 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes</h1>
          <p className="text-sm text-gray-500 mt-1">
            FAQs públicas. Se muestran en /atencion-ciudadano/preguntas-frecuentes.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreating({ ...EMPTY })}
          disabled={creating !== null}
        >
          <Plus className="w-4 h-4 mr-2" /> Nueva FAQ
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
            <h2 className="font-semibold mb-4 text-blue-900">Nueva pregunta</h2>
            <FaqForm
              draft={creating}
              onChange={setCreating}
              onCancel={() => setCreating(null)}
              onSave={() => handleCreate(creating)}
              saving={savingId === 'new'}
            />
          </CardContent>
        </Card>
      )}

      {faqs.length === 0 && !creating ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No hay preguntas registradas.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {faqs.map((f) => (
              <FaqRow
                key={f.id}
                faq={f}
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

function FaqRow({
  faq,
  expanded,
  onToggle,
  onSave,
  onDelete,
  saving,
}: {
  faq: Faq
  expanded: boolean
  onToggle: () => void
  onSave: (d: FaqDraft) => void
  onDelete: () => void
  saving: boolean
}) {
  const [draft, setDraft] = useState<FaqDraft>(faq)
  function reset() {
    setDraft(faq)
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
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
              {faq.categoria}
            </span>
            <span className="font-semibold text-gray-900 truncate">{faq.pregunta}</span>
            {!faq.publicada && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                Borrador
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{faq.respuesta}</p>
        </div>
        <span className="text-xs text-gray-400">orden: {faq.orden}</span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t bg-gray-50">
          <FaqForm
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

function FaqForm({
  draft,
  onChange,
  onCancel,
  onSave,
  onDelete,
  saving,
}: {
  draft: FaqDraft
  onChange: (d: FaqDraft) => void
  onCancel: () => void
  onSave: () => void
  onDelete?: () => void
  saving: boolean
}) {
  function update<K extends keyof FaqDraft>(k: K, v: FaqDraft[K]) {
    onChange({ ...draft, [k]: v })
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Categoría *" required>
        <select
          value={draft.categoria}
          onChange={(e) => update('categoria', e.target.value as Categoria)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
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
      <Field label="Pregunta *" className="sm:col-span-2" required>
        <Input
          value={draft.pregunta}
          onChange={(e) => update('pregunta', e.target.value)}
          required
        />
      </Field>
      <Field label="Respuesta *" className="sm:col-span-2" required>
        <Textarea
          value={draft.respuesta}
          onChange={(e) => update('respuesta', e.target.value)}
          rows={5}
          required
        />
      </Field>
      <div className="flex items-end">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.publicada}
            onChange={(e) => update('publicada', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          Publicada
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
