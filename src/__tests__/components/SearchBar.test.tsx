import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/shared/SearchBar'

// Mock de fetch para sugerencias
global.fetch = vi.fn()

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sugerencias: [] }),
    } as Response)
  })

  it('debería renderizar el input de búsqueda', () => {
    render(<SearchBar />)
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
  })

  it('debería renderizar con placeholder personalizado', () => {
    render(<SearchBar placeholder="Buscar documentos..." />)
    expect(screen.getByPlaceholderText('Buscar documentos...')).toBeInTheDocument()
  })

  it('debería tener un formulario de búsqueda', () => {
    render(<SearchBar />)
    // El SearchBar usa un form con input, no necesariamente un botón visible
    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('debería actualizar el valor del input', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText(/buscar/i)
    await user.type(input, 'test')
    
    expect(input).toHaveValue('test')
  })

  it('debería aplicar className personalizado', () => {
    const { container } = render(<SearchBar className="custom-search" />)
    expect(container.firstChild).toHaveClass('custom-search')
  })

  it('debería mostrar icono de lupa', () => {
    render(<SearchBar />)
    // Lucide icons se renderizan como SVG
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('debería ser enfocable', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText(/buscar/i)
    
    // Click para enfocar
    await user.click(input)
    expect(input).toHaveFocus()
  })

  it('debería llamar a fetch cuando se escribe', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText(/buscar/i)
    await user.type(input, 'test')
    
    // Esperar debounce (300ms)
    await new Promise(resolve => setTimeout(resolve, 400))
    
    expect(global.fetch).toHaveBeenCalled()
  })
})
