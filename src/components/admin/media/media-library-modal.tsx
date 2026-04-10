'use client'

import { useState } from 'react'
import { X, UploadCloud, ImageIcon, FileText, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type MediaItem = {
  id: string
  url: string
  name: string
  type: 'image' | 'document' | 'other'
  size: string
  createdAt: string
}

// Datos de prueba (hasta que conectemos la API con S3/Cloud Storage)
const MOCK_MEDIA: MediaItem[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1541888046429-195b090aeb09?q=80&w=600', name: 'alcaldia-fachada.jpg', type: 'image', size: '1.2 MB', createdAt: '2026-03-24' },
  { id: '2', url: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=600', name: 'parque-principal.jpg', type: 'image', size: '2.4 MB', createdAt: '2026-03-23' },
  { id: '3', url: '/placeholder-doc.pdf', name: 'resolucion_1519.pdf', type: 'document', size: '850 KB', createdAt: '2026-03-20' },
]

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string, type: 'image' | 'document' | 'other') => void
}) {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('library')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  if (!isOpen) return null

  const handleConfirm = () => {
    const selected = MOCK_MEDIA.find(m => m.id === selectedId)
    if (selected) {
      onSelect(selected.url, selected.type)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Biblioteca de Medios</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'library' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Archivos Existentes
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Subir Archivos
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
          {activeTab === 'upload' ? (
            <div className="h-full flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-gray-300 rounded-xl bg-white p-8">
              <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Arrastra tus archivos aquí</h3>
              <p className="text-sm text-gray-500 mb-6">o haz clic para seleccionar archivos desde tu dispositivo</p>
              <Button className="bg-gov-blue hover:bg-gov-blue-dark">
                Seleccionar archivos
              </Button>
              <p className="text-xs text-gray-400 mt-4 text-center max-w-sm">
                Archivos soportados: JPG, PNG, WEBP, PDF, DOCX (Máx 10MB)
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {MOCK_MEDIA.map((media) => (
                <div 
                  key={media.id}
                  onClick={() => setSelectedId(media.id)}
                  className={`relative group bg-white border rounded-xl overflow-hidden cursor-pointer transition-all ${
                    selectedId === media.id 
                      ? 'border-gov-blue ring-2 ring-gov-blue/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-square bg-gray-100 relative items-center justify-center flex">
                    {media.type === 'image' ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-12 h-12 text-gray-400" />
                    )}
                    
                    {selectedId === media.id && (
                      <div className="absolute top-2 right-2 bg-gov-blue text-white rounded-full p-1 shadow-sm">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate" title={media.name}>
                      {media.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {media.size}
                    </p>
                  </div>
                  
                  {/* Actions overlay */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-white/90 text-red-600 rounded-md shadow-sm hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {selectedId ? '1 archivo seleccionado' : 'Ningún archivo seleccionado'}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              className="bg-gov-blue hover:bg-gov-blue-dark disabled:opacity-50"
              disabled={!selectedId && activeTab === 'library'}
              onClick={handleConfirm}
            >
              Insertar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
