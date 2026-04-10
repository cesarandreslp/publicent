import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAccessibility } from '@/hooks/useAccessibility'

describe('useAccessibility', () => {
  beforeEach(() => {
    // Limpiar localStorage mock antes de cada test
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    vi.mocked(localStorage.setItem).mockClear()
    
    // Limpiar clases del body
    document.body.className = ''
    document.documentElement.style.fontSize = ''
  })

  it('debería inicializar con valores por defecto', async () => {
    const { result } = renderHook(() => useAccessibility())
    
    // Esperar a que isLoaded sea true
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.settings.fontSize).toBe(100)
    expect(result.current.settings.highContrast).toBe(false)
    expect(result.current.settings.grayscale).toBe(false)
    expect(result.current.settings.underlineLinks).toBe(false)
    expect(result.current.settings.largeCursor).toBe(false)
  })

  it('debería aumentar el tamaño de fuente', async () => {
    const { result } = renderHook(() => useAccessibility())
    
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.increaseFontSize()
    })

    expect(result.current.settings.fontSize).toBe(125)
  })

  it('debería disminuir el tamaño de fuente', async () => {
    const { result } = renderHook(() => useAccessibility())
    
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.increaseFontSize() // 125
      result.current.decreaseFontSize() // 100
    })

    expect(result.current.settings.fontSize).toBe(100)
  })

  it('no debería aumentar fuente más allá de 200%', async () => {
    const { result } = renderHook(() => useAccessibility())
    
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.increaseFontSize()
      }
    })

    expect(result.current.settings.fontSize).toBe(200)
  })

  it('no debería disminuir fuente menos de 75%', async () => {
    const { result } = renderHook(() => useAccessibility())
    
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.decreaseFontSize()
      }
    })

    expect(result.current.settings.fontSize).toBe(75)
  })

  it('debería resetear tamaño de fuente a 100%', async () => {
    const { result } = renderHook(() => useAccessibility())
    
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.increaseFontSize()
      result.current.increaseFontSize()
      result.current.resetFontSize()
    })

    expect(result.current.settings.fontSize).toBe(100)
  })

  it('debería toggle alto contraste', async () => {
    const { result } = renderHook(() => useAccessibility())
    
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.toggleHighContrast()
    })

    expect(result.current.settings.highContrast).toBe(true)
  })

  it('debería toggle escala de grises', async () => {
    const { result } = renderHook(() => useAccessibility())
    
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.toggleGrayscale()
    })

    expect(result.current.settings.grayscale).toBe(true)
  })

  it('debería toggle subrayado de enlaces', async () => {
    const { result } = renderHook(() => useAccessibility())
    
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.toggleUnderlineLinks()
    })

    expect(result.current.settings.underlineLinks).toBe(true)
  })

  it('debería toggle cursor grande', async () => {
    const { result } = renderHook(() => useAccessibility())
    
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.toggleLargeCursor()
    })

    expect(result.current.settings.largeCursor).toBe(true)
  })

  it('debería resetear todas las opciones', async () => {
    const { result } = renderHook(() => useAccessibility())
    
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    act(() => {
      result.current.increaseFontSize()
      result.current.toggleHighContrast()
      result.current.toggleGrayscale()
      result.current.resetAll()
    })

    expect(result.current.settings.fontSize).toBe(100)
    expect(result.current.settings.highContrast).toBe(false)
    expect(result.current.settings.grayscale).toBe(false)
  })

  it('debería cargar configuración desde localStorage', async () => {
    const savedSettings = JSON.stringify({
      fontSize: 150,
      highContrast: true,
      grayscale: false,
      underlineLinks: true,
      reducedMotion: false,
      largeCursor: false,
    })
    
    vi.mocked(localStorage.getItem).mockReturnValue(savedSettings)
    
    const { result } = renderHook(() => useAccessibility())
    
    await vi.waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.settings.fontSize).toBe(150)
    expect(result.current.settings.highContrast).toBe(true)
    expect(result.current.settings.underlineLinks).toBe(true)
  })
})
