import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from '@/components/shared/page-header'

describe('PageHeader Component', () => {
  const defaultProps = {
    title: 'Título de Prueba',
    breadcrumbItems: [
      { label: 'Inicio', href: '/' },
      { label: 'Sección' },
    ],
  }

  it('debería renderizar el título', () => {
    render(<PageHeader {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Título de Prueba')
  })

  it('debería renderizar la descripción cuando se proporciona', () => {
    render(<PageHeader {...defaultProps} description="Descripción de la página" />)
    expect(screen.getByText('Descripción de la página')).toBeInTheDocument()
  })

  it('no debería renderizar descripción cuando no se proporciona', () => {
    render(<PageHeader {...defaultProps} />)
    expect(screen.queryByText('Descripción de la página')).not.toBeInTheDocument()
  })

  it('debería renderizar el breadcrumb', () => {
    render(<PageHeader {...defaultProps} />)
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Sección')).toBeInTheDocument()
  })

  it('debería aplicar className personalizado', () => {
    const { container } = render(<PageHeader {...defaultProps} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('debería renderizar children', () => {
    render(
      <PageHeader {...defaultProps}>
        <button>Acción Extra</button>
      </PageHeader>
    )
    expect(screen.getByRole('button', { name: 'Acción Extra' })).toBeInTheDocument()
  })

  it('debería tener estructura semántica correcta', () => {
    render(<PageHeader {...defaultProps} description="Descripción" />)
    
    // Verificar h1
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    
    // Verificar que el título sea texto visible
    expect(heading).toHaveTextContent('Título de Prueba')
  })

  it('debería manejar títulos largos', () => {
    const longTitle = 'Este es un título muy largo que debería renderizarse correctamente sin problemas'
    render(<PageHeader {...defaultProps} title={longTitle} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(longTitle)
  })

  it('debería manejar breadcrumb con múltiples items', () => {
    const manyItems = [
      { label: 'Inicio', href: '/' },
      { label: 'Transparencia', href: '/transparencia' },
      { label: 'Normativa', href: '/transparencia/normativa' },
      { label: 'Detalle' },
    ]
    
    render(<PageHeader title="Detalle de Norma" breadcrumbItems={manyItems} />)
    
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Transparencia')).toBeInTheDocument()
    expect(screen.getByText('Normativa')).toBeInTheDocument()
    expect(screen.getByText('Detalle')).toBeInTheDocument()
  })
})
