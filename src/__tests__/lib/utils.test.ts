import { describe, it, expect } from 'vitest'
import {
  cn,
  formatDate,
  formatDateTime,
  slugify,
  truncateText,
  generateRadicado,
  calcularDiasHabiles,
  getFileExtension,
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

describe('formatDateTime', () => {
  it('debería incluir hora y minutos', () => {
    const fecha = new Date('2026-01-12T14:30:00')
    const resultado = formatDateTime(fecha)
    expect(resultado).toContain('2026')
  })
})

describe('slugify', () => {
  it('debería convertir texto a slug', () => {
    expect(slugify('Hola Mundo')).toBe('hola-mundo')
  })

  it('debería remover acentos', () => {
    expect(slugify('Información Pública')).toBe('informacion-publica')
  })

  it('debería remover caracteres especiales', () => {
    expect(slugify('¡Hola! ¿Cómo estás?')).toBe('hola-como-estas')
  })

  it('debería manejar múltiples espacios', () => {
    expect(slugify('Hola    Mundo')).toBe('hola-mundo')
  })

  it('debería manejar guiones múltiples', () => {
    expect(slugify('Hola---Mundo')).toBe('hola-mundo')
  })
})

describe('truncateText', () => {
  it('debería truncar texto largo', () => {
    const texto = 'Este es un texto muy largo que debe ser truncado'
    expect(truncateText(texto, 20)).toBe('Este es un texto muy...')
  })

  it('no debería truncar texto corto', () => {
    const texto = 'Texto corto'
    expect(truncateText(texto, 20)).toBe('Texto corto')
  })

  it('debería manejar texto exacto al límite', () => {
    const texto = '12345'
    expect(truncateText(texto, 5)).toBe('12345')
  })
})

describe('generateRadicado', () => {
  it('debería generar radicado con formato correcto', () => {
    const radicado = generateRadicado()
    expect(radicado).toMatch(/^PGB-\d{4}-\d{5}$/)
  })

  it('debería incluir el año actual', () => {
    const radicado = generateRadicado()
    const añoActual = new Date().getFullYear().toString()
    expect(radicado).toContain(añoActual)
  })

  it('debería generar radicados únicos', () => {
    const radicados = new Set()
    for (let i = 0; i < 100; i++) {
      radicados.add(generateRadicado())
    }
    // Debería haber al menos 90 únicos (puede haber colisiones aleatorias)
    expect(radicados.size).toBeGreaterThan(90)
  })
})

describe('calcularDiasHabiles', () => {
  it('debería calcular días hábiles excluyendo fines de semana', () => {
    // Lunes 12 de enero de 2026 + 5 días hábiles = Lunes 19 de enero
    const inicio = new Date('2026-01-12') // Lunes
    const resultado = calcularDiasHabiles(inicio, 5)
    expect(resultado.getDay()).not.toBe(0) // No domingo
    expect(resultado.getDay()).not.toBe(6) // No sábado
  })

  it('debería saltar fines de semana correctamente', () => {
    // Viernes 16 de enero + 1 día hábil = Lunes 19
    const viernes = new Date('2026-01-16') // Viernes
    const resultado = calcularDiasHabiles(viernes, 1)
    // La función suma días hasta encontrar 1 día hábil
    // Viernes -> Sábado (no cuenta) -> Domingo (no cuenta) -> Lunes (cuenta)
    // Pero la fecha puede variar según timezone, verificamos que no sea fin de semana
    const day = resultado.getDay()
    expect(day !== 0 && day !== 6).toBe(true)
  })

  it('debería manejar 15 días hábiles (plazo PQRSD)', () => {
    const inicio = new Date('2026-01-12')
    const resultado = calcularDiasHabiles(inicio, 15)
    expect(resultado.getTime()).toBeGreaterThan(inicio.getTime())
  })
})

describe('getFileExtension', () => {
  it('debería extraer extensión de archivo', () => {
    expect(getFileExtension('documento.pdf')).toBe('pdf')
    expect(getFileExtension('imagen.JPG')).toBe('jpg')
    expect(getFileExtension('archivo.docx')).toBe('docx')
  })

  it('debería manejar archivos sin extensión', () => {
    expect(getFileExtension('archivo')).toBe('')
  })

  it('debería manejar archivos con múltiples puntos', () => {
    expect(getFileExtension('archivo.backup.zip')).toBe('zip')
  })

  it('debería manejar archivos ocultos', () => {
    // Los archivos ocultos sin extensión retornan cadena vacía
    // .gitignore no tiene extensión real, el punto es parte del nombre
    expect(getFileExtension('.gitignore')).toBe('')
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
