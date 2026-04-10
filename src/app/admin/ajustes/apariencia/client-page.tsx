'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MediaLibraryModal } from '@/components/admin/media/media-library-modal'

export default function AparienciaClient() {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [activeUploadField, setActiveUploadField] = useState<'logo' | 'favicon' | null>(null)

  // Estados de apariencia
  const [logoUrl, setLogoUrl] = useState('/logo-personeria.png')
  const [faviconUrl, setFaviconUrl] = useState('/favicon.ico')
  const [primaryColor, setPrimaryColor] = useState('#3366cc')
  const [fontFamily, setFontFamily] = useState('Work Sans')

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
    // Aquí iría la llamada a la API POST /api/admin/settings/apariencia
    alert("Configuración de apariencia guardada exitosamente.")
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Apariencia del Sitio</h1>
        <p className="text-gray-500 mt-1">Personaliza los colores, tipografía y logotipos públicos de la entidad.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
        
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
                  <img src={logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
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
                  <img src={faviconUrl} alt="Favicon preview" className="max-w-full max-h-full object-contain" />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Primario Institucional</label>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                />
                <input 
                  type="text" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg w-32 focus:ring-2 focus:ring-gov-blue outline-none"
                />
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Usado en botones primarios, enlaces y acentos visuales.</p>
            </div>

            {/* Tipografía */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipografía Principal</label>
              <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none bg-white"
              >
                <option value="Work Sans">Work Sans (GOV.CO Oficial)</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button type="submit" className="bg-gov-blue hover:bg-gov-blue-dark">
            Guardar Apariencia
          </Button>
        </div>
      </form>

      <MediaLibraryModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => handleMediaSelect(url)}
      />
    </div>
  )
}
