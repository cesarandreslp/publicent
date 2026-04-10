"use client"

import { useState } from "react"
import {
  Accessibility,
  ZoomIn,
  ZoomOut,
  Type,
  Contrast,
  Palette,
  Link2,
  MousePointer2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  X,
} from "lucide-react"
import { useAccessibility } from "@/hooks/useAccessibility"
import { useTextToSpeech } from "@/hooks/useTextToSpeech"

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTTSControls, setShowTTSControls] = useState(false)

  const {
    settings,
    isLoaded,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
    toggleGrayscale,
    toggleUnderlineLinks,
    toggleLargeCursor,
    resetAll,
  } = useAccessibility()

  const {
    isSupported: ttsSupported,
    isSpeaking,
    isPaused,
    rate,
    speakPage,
    speakSelection,
    pause,
    resume,
    stop,
    setRate,
  } = useTextToSpeech()

  if (!isLoaded) return null

  const tools = [
    {
      id: "increase-font",
      icon: ZoomIn,
      label: "Aumentar texto",
      action: increaseFontSize,
      active: settings.fontSize > 100,
    },
    {
      id: "decrease-font",
      icon: ZoomOut,
      label: "Disminuir texto",
      action: decreaseFontSize,
      active: settings.fontSize < 100,
    },
    {
      id: "contrast",
      icon: Contrast,
      label: "Alto contraste",
      action: toggleHighContrast,
      active: settings.highContrast,
    },
    {
      id: "grayscale",
      icon: Palette,
      label: "Escala de grises",
      action: toggleGrayscale,
      active: settings.grayscale,
    },
    {
      id: "links",
      icon: Link2,
      label: "Resaltar enlaces",
      action: toggleUnderlineLinks,
      active: settings.underlineLinks,
    },
    {
      id: "cursor",
      icon: MousePointer2,
      label: "Cursor grande",
      action: toggleLargeCursor,
      active: settings.largeCursor,
    },
  ]

  return (
    <>
      {/* Botón flotante para abrir/cerrar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="accessibility-toolbar fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-[#003366] text-white p-3 rounded-r-lg shadow-lg hover:bg-[#002244] transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2"
        aria-label={isOpen ? "Cerrar herramientas de accesibilidad" : "Abrir herramientas de accesibilidad"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <ChevronLeft className="h-6 w-6" />
        ) : (
          <Accessibility className="h-6 w-6" />
        )}
      </button>

      {/* Panel de herramientas */}
      <div
        className={`accessibility-toolbar fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white rounded-r-xl shadow-2xl border border-gray-200 transition-all duration-300 ${
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
        role="region"
        aria-label="Herramientas de accesibilidad"
      >
        <div className="p-4 w-64">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-[#003366]" />
              <h2 className="font-semibold text-gray-900 text-sm">Accesibilidad</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              aria-label="Cerrar panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tamaño de texto */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Type className="h-3 w-3" />
                Tamaño de texto
              </span>
              <span className="text-xs text-gray-500">{settings.fontSize}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={decreaseFontSize}
                disabled={settings.fontSize <= 75}
                className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors text-gray-700"
                aria-label="Disminuir tamaño de texto"
              >
                <Minus className="h-4 w-4 mx-auto" />
              </button>
              <button
                onClick={resetFontSize}
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs text-gray-600"
                aria-label="Restablecer tamaño de texto"
              >
                100%
              </button>
              <button
                onClick={increaseFontSize}
                disabled={settings.fontSize >= 200}
                className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors text-gray-700"
                aria-label="Aumentar tamaño de texto"
              >
                <Plus className="h-4 w-4 mx-auto" />
              </button>
            </div>
          </div>

          {/* Opciones visuales */}
          <div className="space-y-2 mb-4">
            {tools.slice(2).map((tool) => (
              <button
                key={tool.id}
                onClick={tool.action}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left ${
                  tool.active
                    ? "bg-[#003366] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-pressed={tool.active}
              >
                <tool.icon className="h-4 w-4" />
                <span className="text-sm">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Lector de texto */}
          {ttsSupported && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowTTSControls(!showTTSControls)}
                className="w-full flex items-center justify-between p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <Volume2 className="h-4 w-4" />
                  Lector de texto
                </span>
                <ChevronRight
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    showTTSControls ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showTTSControls && (
                <div className="mt-3 space-y-3">
                  {/* Controles de reproducción */}
                  <div className="flex items-center gap-2">
                    {!isSpeaking ? (
                      <>
                        <button
                          onClick={speakPage}
                          className="flex-1 py-2 px-3 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors text-xs flex items-center justify-center gap-1"
                          aria-label="Leer página"
                        >
                          <Play className="h-3 w-3" />
                          Leer página
                        </button>
                        <button
                          onClick={speakSelection}
                          className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs flex items-center justify-center gap-1"
                          aria-label="Leer selección"
                        >
                          <Play className="h-3 w-3" />
                          Selección
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={isPaused ? resume : pause}
                          className="flex-1 py-2 px-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-xs flex items-center justify-center gap-1"
                          aria-label={isPaused ? "Reanudar" : "Pausar"}
                        >
                          {isPaused ? (
                            <>
                              <Play className="h-3 w-3" />
                              Reanudar
                            </>
                          ) : (
                            <>
                              <Pause className="h-3 w-3" />
                              Pausar
                            </>
                          )}
                        </button>
                        <button
                          onClick={stop}
                          className="py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          aria-label="Detener"
                        >
                          <Square className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Velocidad */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Velocidad</span>
                      <span className="text-xs text-gray-600">{rate}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.25"
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#003366]"
                      aria-label="Velocidad de lectura"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botón de restablecer */}
          <button
            onClick={resetAll}
            className="w-full mt-4 py-2 px-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restablecer todo
          </button>

          {/* Enlace a página de accesibilidad */}
          <a
            href="/accesibilidad"
            className="block mt-3 text-center text-xs text-[#003366] hover:underline"
          >
            Más información sobre accesibilidad
          </a>
        </div>
      </div>
    </>
  )
}
