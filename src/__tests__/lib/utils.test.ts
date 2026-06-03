import { describe, it, expect } from 'vitest'
import {
  cn,
  formatDate,
  formatFileSize,
} from '@/lib/utils'

describe('cn (className merger)', () => {
  it('debería combinar clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('debería manejar clases condicionales', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('debería fusionar clases de Tailwind conflictivas', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('debería manejar arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('debería manejar objetos', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })
})

describe('formatDate', () => {
  it('debería formatear una fecha en español colombiano', () => {
    const fecha = new Date('2026-01-12')
    const resultado = formatDate(fecha)
    expect(resultado).toContain('2026')
    expect(resultado).toContain('enero')
  })

  it('debería aceptar string como fecha', () => {
    const resultado = formatDate('2026-06-15')
    expect(resultado).toContain('2026')
    expect(resultado).toContain('junio')
  })

  it('debería aceptar opciones personalizadas', () => {
    const fecha = new Date('2026-01-12')
    const resultado = formatDate(fecha, { month: 'short' })
    expect(resultado).toContain('ene')
  })
})

describe('formatFileSize', () => {
  it('debería formatear bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes')
  })

  it('debería formatear kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(2048)).toBe('2 KB')
  })

  it('debería formatear megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB')
    expect(formatFileSize(5242880)).toBe('5 MB')
  })

  it('debería formatear gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB')
  })

  it('debería manejar cero', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
  })

  it('debería formatear con decimales', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })
})
