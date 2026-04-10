"use client"

import { useState, useEffect, useCallback } from "react"

export interface AccessibilitySettings {
  fontSize: number // 100 = normal, 125 = grande, 150 = muy grande
  highContrast: boolean
  grayscale: boolean
  underlineLinks: boolean
  reducedMotion: boolean
  largeCursor: boolean
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  grayscale: false,
  underlineLinks: false,
  reducedMotion: false,
  largeCursor: false,
}

const STORAGE_KEY = "personeria-accessibility"

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar configuración desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setSettings({ ...DEFAULT_SETTINGS, ...parsed })
        } catch (e) {
          console.error("Error parsing accessibility settings:", e)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Aplicar configuración al DOM
  useEffect(() => {
    if (!isLoaded) return

    const root = document.documentElement
    const body = document.body

    // Tamaño de fuente
    root.style.fontSize = `${settings.fontSize}%`

    // Alto contraste
    if (settings.highContrast) {
      body.classList.add("high-contrast")
    } else {
      body.classList.remove("high-contrast")
    }

    // Escala de grises
    if (settings.grayscale) {
      body.classList.add("grayscale-mode")
    } else {
      body.classList.remove("grayscale-mode")
    }

    // Subrayar enlaces
    if (settings.underlineLinks) {
      body.classList.add("underline-links")
    } else {
      body.classList.remove("underline-links")
    }

    // Reducir movimiento
    if (settings.reducedMotion) {
      body.classList.add("reduced-motion")
    } else {
      body.classList.remove("reduced-motion")
    }

    // Cursor grande
    if (settings.largeCursor) {
      body.classList.add("large-cursor")
    } else {
      body.classList.remove("large-cursor")
    }

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings, isLoaded])

  // Aumentar tamaño de fuente
  const increaseFontSize = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 25, 200),
    }))
  }, [])

  // Disminuir tamaño de fuente
  const decreaseFontSize = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 25, 75),
    }))
  }, [])

  // Restablecer tamaño de fuente
  const resetFontSize = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: 100,
    }))
  }, [])

  // Toggle alto contraste
  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      highContrast: !prev.highContrast,
    }))
  }, [])

  // Toggle escala de grises
  const toggleGrayscale = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      grayscale: !prev.grayscale,
    }))
  }, [])

  // Toggle subrayar enlaces
  const toggleUnderlineLinks = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      underlineLinks: !prev.underlineLinks,
    }))
  }, [])

  // Toggle reducir movimiento
  const toggleReducedMotion = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      reducedMotion: !prev.reducedMotion,
    }))
  }, [])

  // Toggle cursor grande
  const toggleLargeCursor = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      largeCursor: !prev.largeCursor,
    }))
  }, [])

  // Restablecer todo
  const resetAll = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    isLoaded,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
    toggleGrayscale,
    toggleUnderlineLinks,
    toggleReducedMotion,
    toggleLargeCursor,
    resetAll,
  }
}
