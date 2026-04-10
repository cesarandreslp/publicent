"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface TextToSpeechOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
}

export interface TextToSpeechState {
  isSupported: boolean
  isSpeaking: boolean
  isPaused: boolean
  voices: SpeechSynthesisVoice[]
  currentVoice: SpeechSynthesisVoice | null
  rate: number
  volume: number
}

const DEFAULT_OPTIONS: TextToSpeechOptions = {
  lang: "es-CO",
  rate: 1,
  pitch: 1,
  volume: 1,
}

export function useTextToSpeech(options: TextToSpeechOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  const [state, setState] = useState<TextToSpeechState>({
    isSupported: false,
    isSpeaking: false,
    isPaused: false,
    voices: [],
    currentVoice: null,
    rate: opts.rate || 1,
    volume: opts.volume || 1,
  })

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Verificar soporte y cargar voces
  useEffect(() => {
    if (typeof window === "undefined") return

    const isSupported = "speechSynthesis" in window
    setState((prev) => ({ ...prev, isSupported }))

    if (!isSupported) return

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      
      // Filtrar voces en español
      const spanishVoices = availableVoices.filter(
        (voice) => voice.lang.startsWith("es")
      )
      
      // Buscar voz preferida (Colombia > España > cualquier español)
      let preferredVoice = spanishVoices.find((v) => v.lang === "es-CO")
      if (!preferredVoice) {
        preferredVoice = spanishVoices.find((v) => v.lang === "es-ES")
      }
      if (!preferredVoice && spanishVoices.length > 0) {
        preferredVoice = spanishVoices[0]
      }
      if (!preferredVoice && availableVoices.length > 0) {
        preferredVoice = availableVoices[0]
      }

      setState((prev) => ({
        ...prev,
        voices: availableVoices,
        currentVoice: preferredVoice || null,
      }))
    }

    // Cargar voces inmediatamente y cuando cambien
    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      speechSynthesis.onvoiceschanged = null
    }
  }, [])

  // Hablar texto
  const speak = useCallback(
    (text: string) => {
      if (!state.isSupported || !text.trim()) return

      // Cancelar cualquier lectura anterior
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      utterance.lang = opts.lang || "es-CO"
      utterance.rate = state.rate
      utterance.pitch = opts.pitch || 1
      utterance.volume = state.volume

      if (state.currentVoice) {
        utterance.voice = state.currentVoice
      }

      utterance.onstart = () => {
        setState((prev) => ({ ...prev, isSpeaking: true, isPaused: false }))
      }

      utterance.onend = () => {
        setState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }))
      }

      utterance.onerror = (event) => {
        // "interrupted" y "canceled" son eventos normales cuando se cancela la lectura
        // No son errores reales, solo notificaciones
        if (event.error !== "interrupted" && event.error !== "canceled") {
          console.error("Speech synthesis error:", event.error)
        }
        setState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }))
      }

      utteranceRef.current = utterance
      speechSynthesis.speak(utterance)
    },
    [state.isSupported, state.currentVoice, state.rate, state.volume, opts.lang, opts.pitch]
  )

  // Leer texto seleccionado
  const speakSelection = useCallback(() => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()
    
    if (selectedText) {
      speak(selectedText)
    }
  }, [speak])

  // Leer contenido principal de la página
  const speakPage = useCallback(() => {
    // Buscar el contenido principal
    const main = document.querySelector("main")
    const article = document.querySelector("article")
    const content = main || article || document.body

    // Obtener texto limpio (sin scripts ni estilos)
    const clone = content.cloneNode(true) as HTMLElement
    
    // Remover elementos que no deben leerse
    const elementsToRemove = clone.querySelectorAll(
      "script, style, nav, header, footer, aside, .accessibility-toolbar, [aria-hidden='true']"
    )
    elementsToRemove.forEach((el) => el.remove())

    const text = clone.textContent?.trim() || ""
    
    if (text) {
      speak(text)
    }
  }, [speak])

  // Pausar
  const pause = useCallback(() => {
    if (state.isSupported && state.isSpeaking) {
      speechSynthesis.pause()
      setState((prev) => ({ ...prev, isPaused: true }))
    }
  }, [state.isSupported, state.isSpeaking])

  // Reanudar
  const resume = useCallback(() => {
    if (state.isSupported && state.isPaused) {
      speechSynthesis.resume()
      setState((prev) => ({ ...prev, isPaused: false }))
    }
  }, [state.isSupported, state.isPaused])

  // Detener
  const stop = useCallback(() => {
    if (state.isSupported) {
      speechSynthesis.cancel()
      setState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }))
    }
  }, [state.isSupported])

  // Cambiar velocidad
  const setRate = useCallback((newRate: number) => {
    setState((prev) => ({ ...prev, rate: Math.max(0.5, Math.min(2, newRate)) }))
  }, [])

  // Cambiar volumen
  const setVolume = useCallback((newVolume: number) => {
    setState((prev) => ({ ...prev, volume: Math.max(0, Math.min(1, newVolume)) }))
  }, [])

  // Cambiar voz
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setState((prev) => ({ ...prev, currentVoice: voice }))
  }, [])

  return {
    ...state,
    speak,
    speakSelection,
    speakPage,
    pause,
    resume,
    stop,
    setRate,
    setVolume,
    setVoice,
  }
}
