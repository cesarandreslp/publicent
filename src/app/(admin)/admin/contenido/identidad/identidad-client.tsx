'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react'

interface Identidad {
  id?: string
  nombreCompleto: string
  nombreCorto: string
  eslogan: string | null
  direccionPrincipal: string | null
  ciudad: string | null
  departamento: string | null
  codigoPostal: string | null
  telefonoConmutador: string | null
  telefonoPqrsd: string | null
  emailContacto: string | null
  emailPqrsd: string | null
  emailNotificaciones: string | null
  emailAccesibilidad: string | null
  logoUrl: string | null
  faviconUrl: string | null
  colorPrimario: string | null
  colorSecundario: string | null
  facebookUrl: string | null
  twitterUrl: string | null
  instagramUrl: string | null
  youtubeUrl: string | null
  linkedinUrl: string | null
  whatsappNumero: string | null
  seoTitle: string | null
  seoTitleTemplate: string | null
  seoDescription: string | null
  seoKeywords: string | null
  seoOgImageUrl: string | null
  seoOgUrl: string | null
  emailFromName: string | null
  emailFromAddress: string | null
  emailSignatureHtml: string | null
  coordenadaLat: number | null
  coordenadaLng: number | null
  urlGoogleMapsEmbed: string | null
}

const EMPTY: Identidad = {
  nombreCompleto: '',
  nombreCorto: '',
  eslogan: null,
  direccionPrincipal: null,
  ciudad: null,
  departamento: null,
  codigoPostal: null,
  telefonoConmutador: null,
  telefonoPqrsd: null,
  emailContacto: null,
  emailPqrsd: null,
  emailNotificaciones: null,
  emailAccesibilidad: null,
  logoUrl: null,
  faviconUrl: null,
  colorPrimario: null,
  colorSecundario: null,
  facebookUrl: null,
  twitterUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
  linkedinUrl: null,
  whatsappNumero: null,
  seoTitle: null,
  seoTitleTemplate: null,
  seoDescription: null,
  seoKeywords: null,
  seoOgImageUrl: null,
  seoOgUrl: null,
  emailFromName: null,
  emailFromAddress: null,
  emailSignatureHtml: null,
  coordenadaLat: null,
  coordenadaLng: null,
  urlGoogleMapsEmbed: null,
}

export function IdentidadClient({ initialData }: { initialData: Identidad | null }) {
  const [data, setData] = useState<Identidad>(initialData ?? EMPTY)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function update<K extends keyof Identidad>(key: K, value: Identidad[K]) {
    setData((d) => ({ ...d, [key]: value }))
    if (status !== 'idle') setStatus('idle')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus('idle')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/contenido/identidad', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const json = await res.json()
      setData(json)
      setStatus('saved')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Identidad Institucional</h1>
          <p className="text-sm text-gray-500 mt-1">
            Datos generales del tenant. Aparecen en el sitio público, footer, emails y SEO.
          </p>
        </div>
      </div>

      {/* 1. Identidad legal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Identidad legal</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre completo *" required>
            <Input
              value={data.nombreCompleto}
              onChange={(e) => update('nombreCompleto', e.target.value)}
              placeholder="Personería Municipal de ..."
              required
            />
          </Field>
          <Field label="Nombre corto *" required>
            <Input
              value={data.nombreCorto}
              onChange={(e) => update('nombreCorto', e.target.value)}
              placeholder="Personería de ..."
              required
            />
          </Field>
          <Field label="Eslogan" className="sm:col-span-2">
            <Input
              value={data.eslogan ?? ''}
              onChange={(e) => update('eslogan', e.target.value || null)}
              placeholder="Defensores de los derechos ciudadanos"
            />
          </Field>
        </CardContent>
      </Card>

      {/* 2. Contacto principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Contacto principal</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field label="Dirección principal" className="sm:col-span-2">
            <Input
              value={data.direccionPrincipal ?? ''}
              onChange={(e) => update('direccionPrincipal', e.target.value || null)}
              placeholder="Calle 7 N° 12-45, Centro"
            />
          </Field>
          <Field label="Ciudad">
            <Input
              value={data.ciudad ?? ''}
              onChange={(e) => update('ciudad', e.target.value || null)}
            />
          </Field>
          <Field label="Departamento">
            <Input
              value={data.departamento ?? ''}
              onChange={(e) => update('departamento', e.target.value || null)}
            />
          </Field>
          <Field label="Código postal">
            <Input
              value={data.codigoPostal ?? ''}
              onChange={(e) => update('codigoPostal', e.target.value || null)}
            />
          </Field>
          <div />
          <Field label="Conmutador">
            <Input
              value={data.telefonoConmutador ?? ''}
              onChange={(e) => update('telefonoConmutador', e.target.value || null)}
              placeholder="(602) 0000000"
            />
          </Field>
          <Field label="Teléfono PQRSD">
            <Input
              value={data.telefonoPqrsd ?? ''}
              onChange={(e) => update('telefonoPqrsd', e.target.value || null)}
            />
          </Field>
          <Field label="Email contacto">
            <Input
              type="email"
              value={data.emailContacto ?? ''}
              onChange={(e) => update('emailContacto', e.target.value || null)}
            />
          </Field>
          <Field label="Email PQRSD">
            <Input
              type="email"
              value={data.emailPqrsd ?? ''}
              onChange={(e) => update('emailPqrsd', e.target.value || null)}
            />
          </Field>
          <Field label="Email notificaciones judiciales">
            <Input
              type="email"
              value={data.emailNotificaciones ?? ''}
              onChange={(e) => update('emailNotificaciones', e.target.value || null)}
            />
          </Field>
          <Field label="Email accesibilidad">
            <Input
              type="email"
              value={data.emailAccesibilidad ?? ''}
              onChange={(e) => update('emailAccesibilidad', e.target.value || null)}
              placeholder="accesibilidad@..."
            />
          </Field>
        </CardContent>
      </Card>

      {/* 3. Branding visual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Branding visual</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field label="URL del logo" className="sm:col-span-2">
            <Input
              value={data.logoUrl ?? ''}
              onChange={(e) => update('logoUrl', e.target.value || null)}
              placeholder="https://..."
            />
          </Field>
          <Field label="URL del favicon" className="sm:col-span-2">
            <Input
              value={data.faviconUrl ?? ''}
              onChange={(e) => update('faviconUrl', e.target.value || null)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Color primario (hex)">
            <div className="flex gap-2 items-center">
              <Input
                value={data.colorPrimario ?? ''}
                onChange={(e) => update('colorPrimario', e.target.value || null)}
                placeholder="#003087"
              />
              {data.colorPrimario ? (
                <span
                  className="w-9 h-9 rounded border"
                  style={{ background: data.colorPrimario }}
                  aria-hidden
                />
              ) : null}
            </div>
          </Field>
          <Field label="Color secundario (hex)">
            <div className="flex gap-2 items-center">
              <Input
                value={data.colorSecundario ?? ''}
                onChange={(e) => update('colorSecundario', e.target.value || null)}
                placeholder="#0078d4"
              />
              {data.colorSecundario ? (
                <span
                  className="w-9 h-9 rounded border"
                  style={{ background: data.colorSecundario }}
                  aria-hidden
                />
              ) : null}
            </div>
          </Field>
        </CardContent>
      </Card>

      {/* 4. Redes sociales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">4. Redes sociales</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field label="Facebook">
            <Input
              value={data.facebookUrl ?? ''}
              onChange={(e) => update('facebookUrl', e.target.value || null)}
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="Twitter / X">
            <Input
              value={data.twitterUrl ?? ''}
              onChange={(e) => update('twitterUrl', e.target.value || null)}
            />
          </Field>
          <Field label="Instagram">
            <Input
              value={data.instagramUrl ?? ''}
              onChange={(e) => update('instagramUrl', e.target.value || null)}
            />
          </Field>
          <Field label="YouTube">
            <Input
              value={data.youtubeUrl ?? ''}
              onChange={(e) => update('youtubeUrl', e.target.value || null)}
            />
          </Field>
          <Field label="LinkedIn">
            <Input
              value={data.linkedinUrl ?? ''}
              onChange={(e) => update('linkedinUrl', e.target.value || null)}
            />
          </Field>
          <Field label="WhatsApp (formato E.164)">
            <Input
              value={data.whatsappNumero ?? ''}
              onChange={(e) => update('whatsappNumero', e.target.value || null)}
              placeholder="+573001234567"
            />
          </Field>
        </CardContent>
      </Card>

      {/* 5. SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">5. SEO y metadatos</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field label="SEO title">
            <Input
              value={data.seoTitle ?? ''}
              onChange={(e) => update('seoTitle', e.target.value || null)}
            />
          </Field>
          <Field label="SEO title template">
            <Input
              value={data.seoTitleTemplate ?? ''}
              onChange={(e) => update('seoTitleTemplate', e.target.value || null)}
              placeholder="%s | Personería de ..."
            />
          </Field>
          <Field label="SEO description" className="sm:col-span-2">
            <Textarea
              value={data.seoDescription ?? ''}
              onChange={(e) => update('seoDescription', e.target.value || null)}
              rows={3}
            />
          </Field>
          <Field label="Keywords (separadas por coma)" className="sm:col-span-2">
            <Input
              value={data.seoKeywords ?? ''}
              onChange={(e) => update('seoKeywords', e.target.value || null)}
              placeholder="Personería, Buga, ..."
            />
          </Field>
          <Field label="OG image URL">
            <Input
              value={data.seoOgImageUrl ?? ''}
              onChange={(e) => update('seoOgImageUrl', e.target.value || null)}
            />
          </Field>
          <Field label="OG canonical URL">
            <Input
              value={data.seoOgUrl ?? ''}
              onChange={(e) => update('seoOgUrl', e.target.value || null)}
              placeholder="https://www.personeriaX.gov.co"
            />
          </Field>
        </CardContent>
      </Card>

      {/* 6. Email branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">6. Email branding</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field label="From name">
            <Input
              value={data.emailFromName ?? ''}
              onChange={(e) => update('emailFromName', e.target.value || null)}
              placeholder="Personería Municipal de ..."
            />
          </Field>
          <Field label="From address">
            <Input
              type="email"
              value={data.emailFromAddress ?? ''}
              onChange={(e) => update('emailFromAddress', e.target.value || null)}
              placeholder="no-reply@..."
            />
          </Field>
          <Field label="Firma HTML para correos" className="sm:col-span-2">
            <Textarea
              value={data.emailSignatureHtml ?? ''}
              onChange={(e) => update('emailSignatureHtml', e.target.value || null)}
              rows={5}
              placeholder="<p>Atentamente,<br/>Personería Municipal de ...</p>"
            />
          </Field>
        </CardContent>
      </Card>

      {/* 7. Mapa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">7. Ubicación / Mapa</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field label="Latitud">
            <Input
              type="number"
              step="any"
              value={data.coordenadaLat ?? ''}
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
              value={data.coordenadaLng ?? ''}
              onChange={(e) =>
                update(
                  'coordenadaLng',
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
            />
          </Field>
          <Field label="URL embed Google Maps" className="sm:col-span-2">
            <Textarea
              value={data.urlGoogleMapsEmbed ?? ''}
              onChange={(e) => update('urlGoogleMapsEmbed', e.target.value || null)}
              rows={3}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
          </Field>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="sticky bottom-0 bg-white border-t pt-4 pb-2 flex items-center justify-between gap-3">
        <div className="text-sm">
          {status === 'saved' && (
            <span className="text-green-700 inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Cambios guardados
            </span>
          )}
          {status === 'error' && (
            <span className="text-red-700 inline-flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {errorMsg}
            </span>
          )}
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
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
