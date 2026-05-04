'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MediaLibraryModal } from '@/components/admin/media/media-library-modal'

interface AparienciaData {
  logoUrl: string | null
  colorPrimario: string | null
  colorSecundario: string | null
  nombre: string
  nombreCorto: string
}

export default function AparienciaClient() {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [activeUploadField, setActiveUploadField] = useState<'logo' | 'favicon' | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Estados de apariencia
  const [logoUrl, setLogoUrl] = useState('/images/logo-personeria.png')
  const [faviconUrl, setFaviconUrl] = useState('/favicon.ico')
  const [primaryColor, setPrimaryColor] = useState('#3366cc')
  const [secondaryColor, setSecondaryColor] = useState('#004884')
  const [fontFamily, setFontFamily] = useState('Work Sans')

  // Cargar configuración actual desde la API
  useEffect(() => {
    async function fetchApariencia() {
      try {
        const res = await fetch('/api/admin/ajustes/apariencia')
        if (!res.ok) throw new Error('No se pudo cargar la configuración')
        const data: AparienciaData = await res.json()
        if (data.logoUrl) setLogoUrl(data.logoUrl)
        if (data.colorPrimario) setPrimaryColor(data.colorPrimario)
        if (data.colorSecundario) setSecondaryColor(data.colorSecundario)
      } catch (err) {
        console.error('[apariencia] Error al cargar:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchApariencia()
  }, [])

  const handleOpenMedia = (field: 'logo' | 'favicon') => {
    setActiveUploadField(field)
    setIsMediaModalOpen(true)
  }

  const handleMediaSelect = (url: string) => {
    if (activeUploadField === 'logo') setLogoUrl(url)
    if (activeUploadField === 'favicon') setFaviconUrl(url)
    setActiveUploadField(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/admin/ajustes/apariencia', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl,
          colorPrimario: primaryColor,
          colorSecundario: secondaryColor,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Error al guardar la configuración')
        return
      }

      setSuccessMsg('Apariencia actualizada. Los cambios se verán en el próximo recargo de página.')
    } catch {
      setErrorMsg('Error de red. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Apariencia del Sitio</h1>
        <p className="text-gray-500 mt-1">Personaliza los colores, tipografía y logotipos públicos de la entidad.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-500 py-12">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gov-blue rounded-full animate-spin" />
          Cargando configuración actual…
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">

          {/* Mensajes de estado */}
          {successMsg && (
            <div role="alert" className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
              <span aria-hidden="true">✓</span> {successMsg}
            </div>
          )}
          {errorMsg && (
            <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
              <span aria-hidden="true">⚠</span> {errorMsg}
            </div>
          )}

          {/* Identidad Visual */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-2">Identidad Visual</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logotipo Principal</label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Vista previa del logo" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div>
                    <Button type="button" variant="outline" onClick={() => handleOpenMedia('logo')} className="mb-2">
                      Cambiar imagen
                    </Button>
                    <p className="text-xs text-gray-500">Recomendado: 400x120px, formato PNG o SVG transparente.</p>
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon (Icono de pestaña)</label>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={faviconUrl} alt="Vista previa del favicon" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div>
                    <Button type="button" variant="outline" onClick={() => handleOpenMedia('favicon')} size="sm" className="mb-2">
                      Cambiar icono
                    </Button>
                    <p className="text-xs text-gray-500">Recomendado: 512x512px, PNG o ICO.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colores y Tipografía */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-2">Diseño y Colores</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Color Primario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Primario Institucional
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    aria-label="Valor hexadecimal del color primario"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-32 focus:ring-2 focus:ring-gov-blue outline-none font-mono text-sm"
                  />
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    aria-label="Selector de color primario"
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Botones, enlaces y acentos. Debe cumplir contraste 4.5:1 (WCAG AA).</p>
              </div>

              {/* Color Secundario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Secundario / Encabezados
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: secondaryColor }}
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    aria-label="Valor hexadecimal del color secundario"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-32 focus:ring-2 focus:ring-gov-blue outline-none font-mono text-sm"
                  />
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    aria-label="Selector de color secundario"
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Encabezados y elementos de énfasis institucional.</p>
              </div>

              {/* Tipografía */}
              <div>
                <label htmlFor="font-family" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipografía Principal
                </label>
                <select
                  id="font-family"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none bg-white"
                >
                  <option value="Work Sans">Work Sans (GOV.CO Oficial)</option>
                  <option value="Nunito Sans">Nunito Sans (MinTIC Alternativa)</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Work Sans y Nunito Sans son las fuentes recomendadas por GOV.CO.</p>
              </div>
            </div>
          </div>

          {/* Nota normativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
            <strong>Ley 2345/2023 — Chao Marcas:</strong> La identidad visual configurada aquí debe ser neutra y atemporal. No incluir referencias a la gestión de gobierno vigente. La barra GOV.CO (azul #3366CC) no es modificable.
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button type="submit" disabled={saving} className="bg-gov-blue hover:bg-gov-blue-dark min-w-[160px]">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando…
                </span>
              ) : (
                'Guardar Apariencia'
              )}
            </Button>
          </div>
        </form>
      )}

      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => handleMediaSelect(url)}
      />
    </div>
  )
}
