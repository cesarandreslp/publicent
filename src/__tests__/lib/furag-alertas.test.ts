/**
 * furag-alertas.test.ts
 *
 * Tests de la librería de alertas de cierre de vigencia FURAG.
 * Se inyecta `ahora` en todos los cálculos para asegurar determinismo.
 */

import { describe, it, expect } from 'vitest'
import {
  calcularEstadoVigenciaFurag,
  calcularVigenciaMasRelevante,
  debeNotificar,
  type NivelAlertaFurag,
} from '@/lib/furag-alertas'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Crea un Date a medianoche Colombia (UTC-5 ≈ UTC+0 para tests) */
function fecha(año: number, mes: number, dia: number): Date {
  return new Date(año, mes - 1, dia, 12, 0, 0, 0)
}

// ─── calcularEstadoVigenciaFurag ──────────────────────────────────────────────

describe('calcularEstadoVigenciaFurag', () => {
  it('retorna FUERA_DE_PERIODO si la apertura aún no ha llegado', () => {
    // Vigencia 2025 abre el 1-Oct-2025; consultamos en agosto
    const ahora = fecha(2025, 8, 15)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.nivel).toBe('FUERA_DE_PERIODO')
    expect(estado.estaAbierto).toBe(false)
    expect(estado.anioVigencia).toBe(2025)
  })

  it('retorna estaAbierto=true cuando la fecha cae dentro del período', () => {
    // Vigencia 2025: abre Oct-2025, cierra Mar-2026; consultamos en nov-2025
    const ahora = fecha(2025, 11, 10)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.estaAbierto).toBe(true)
  })

  it('retorna estaAbierto=true en enero (año de reporte siguiente)', () => {
    // 15-ene-2026: dentro del período oct-2025 / mar-2026 (76 días para el cierre → INFORMATIVA)
    const ahora = fecha(2026, 1, 15)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.estaAbierto).toBe(true)
    expect(estado.nivel).toBe('INFORMATIVA')
  })

  it('retorna VENCIDA si la fecha es posterior al cierre', () => {
    const ahora = fecha(2026, 4, 1) // Después del 31-mar-2026
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.nivel).toBe('VENCIDA')
    expect(estado.estaAbierto).toBe(false)
    expect(estado.diasRestantes).toBeLessThan(0)
  })

  it('retorna CRITICA con 5 días restantes', () => {
    // Cierre vigencia 2025: 31-mar-2026. Consultamos 26-mar-2026
    const ahora = fecha(2026, 3, 26)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.nivel).toBe('CRITICA')
    expect(estado.diasRestantes).toBeGreaterThanOrEqual(4)
    expect(estado.diasRestantes).toBeLessThanOrEqual(6)
  })

  it('retorna URGENTE con 12 días restantes', () => {
    const ahora = fecha(2026, 3, 19) // ~12 días antes del 31-mar
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.nivel).toBe('URGENTE')
  })

  it('retorna ADVERTENCIA con 20 días restantes', () => {
    const ahora = fecha(2026, 3, 11) // ~20 días antes del 31-mar
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.nivel).toBe('ADVERTENCIA')
  })

  it('retorna INFORMATIVA con 45 días restantes', () => {
    const ahora = fecha(2026, 2, 14) // ~45 días antes del 31-mar
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.nivel).toBe('INFORMATIVA')
  })

  it('diasRestantes es positivo cuando la vigencia está abierta', () => {
    const ahora = fecha(2026, 1, 15)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.diasRestantes).toBeGreaterThan(0)
  })

  it('diasRestantes es negativo cuando la vigencia está vencida', () => {
    const ahora = fecha(2026, 5, 1)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.diasRestantes).toBeLessThan(0)
  })

  it('porcentajeConsumido es 0 fuera del período (antes)', () => {
    const ahora = fecha(2025, 8, 1)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.porcentajeConsumido).toBe(0)
  })

  it('porcentajeConsumido es 100 fuera del período (después)', () => {
    const ahora = fecha(2026, 6, 1)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.porcentajeConsumido).toBe(100)
  })

  it('porcentajeConsumido está entre 1 y 99 dentro del período', () => {
    const ahora = fecha(2025, 12, 1)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.porcentajeConsumido).toBeGreaterThan(0)
    expect(estado.porcentajeConsumido).toBeLessThan(100)
  })

  it('fechaCierre es el 31 de marzo del año siguiente por defecto', () => {
    const ahora = fecha(2025, 11, 1)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.fechaCierre).toBe('2026-03-31')
  })

  it('fechaApertura es el 1 de octubre del año de vigencia', () => {
    const ahora = fecha(2025, 11, 1)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.fechaApertura).toBe('2025-10-01')
  })

  it('mensaje no está vacío', () => {
    const ahora = fecha(2026, 3, 25)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.mensaje.length).toBeGreaterThan(10)
  })

  it('recomendacion no está vacía', () => {
    const ahora = fecha(2026, 3, 25)
    const estado = calcularEstadoVigenciaFurag(2025, ahora)
    expect(estado.recomendacion.length).toBeGreaterThan(10)
  })

  it('acepta una configuración personalizada de fechas', () => {
    const config = {
      aperturaMes: 9,   // septiembre
      aperturaDia: 1,
      cierreMes: 2,     // febrero
      cierreDia: 28,
    }
    const ahora = fecha(2025, 10, 1)
    const estado = calcularEstadoVigenciaFurag(2025, ahora, config)
    expect(estado.estaAbierto).toBe(true)
    expect(estado.fechaApertura).toBe('2025-09-01')
    expect(estado.fechaCierre).toBe('2026-02-28')
  })
})

// ─── calcularVigenciaMasRelevante ─────────────────────────────────────────────

describe('calcularVigenciaMasRelevante', () => {
  it('devuelve vigencia del año anterior si está activa (enero-marzo)', () => {
    // En enero 2026, la vigencia 2025 está abierta (oct-2025 a mar-2026)
    const ahora = fecha(2026, 1, 20)
    const estado = calcularVigenciaMasRelevante(ahora)
    expect(estado.anioVigencia).toBe(2025)
    expect(estado.estaAbierto).toBe(true)
  })

  it('devuelve vigencia del año actual si está activa (oct-dic)', () => {
    // En noviembre 2026, la vigencia 2026 está abierta
    const ahora = fecha(2026, 11, 5)
    const estado = calcularVigenciaMasRelevante(ahora)
    expect(estado.anioVigencia).toBe(2026)
    expect(estado.estaAbierto).toBe(true)
  })

  it('devuelve vigencia del año actual cuando no hay ninguna abierta (mayo)', () => {
    // En mayo 2026, ninguna está abierta (2025 venció en marzo, 2026 abre en octubre)
    const ahora = fecha(2026, 5, 15)
    const estado = calcularVigenciaMasRelevante(ahora)
    // Fallback: año actual
    expect(estado.anioVigencia).toBe(2026)
    expect(estado.estaAbierto).toBe(false)
  })
})

// ─── debeNotificar ────────────────────────────────────────────────────────────

describe('debeNotificar', () => {
  it('devuelve true para los hitos: 90, 60, 30, 15, 7, 3, 1', () => {
    const hitos = [90, 60, 30, 15, 7, 3, 1]
    for (const h of hitos) {
      expect(debeNotificar(h)).toBe(true)
    }
  })

  it('devuelve false para valores fuera de los hitos', () => {
    const noHitos = [0, 2, 4, 5, 6, 8, 10, 14, 16, 29, 31, 45, 50, 59, 61, 89, 91, 100]
    for (const v of noHitos) {
      expect(debeNotificar(v)).toBe(false)
    }
  })
})

// ─── Umbrales exactos ─────────────────────────────────────────────────────────

describe('umbrales exactos de nivel', () => {
  // Cierre vigencia 2025: 31-mar-2026

  const casos: Array<{ diasAntes: number; nivel: NivelAlertaFurag }> = [
    { diasAntes: 1,  nivel: 'CRITICA'     },
    { diasAntes: 7,  nivel: 'CRITICA'     },
    { diasAntes: 8,  nivel: 'URGENTE'     },
    { diasAntes: 15, nivel: 'URGENTE'     },
    { diasAntes: 16, nivel: 'ADVERTENCIA' },
    { diasAntes: 30, nivel: 'ADVERTENCIA' },
    { diasAntes: 31, nivel: 'INFORMATIVA' },
    { diasAntes: 90, nivel: 'INFORMATIVA' },
  ]

  for (const { diasAntes, nivel } of casos) {
    it(`${diasAntes} días antes del cierre → nivel ${nivel}`, () => {
      // Calculamos la fecha `diasAntes` días antes del cierre (31-mar-2026)
      const cierre = new Date(2026, 2, 31, 23, 59, 59, 999)
      const ahora  = new Date(cierre.getTime() - diasAntes * 24 * 60 * 60 * 1000)
      const estado = calcularEstadoVigenciaFurag(2025, ahora)
      expect(estado.nivel).toBe(nivel)
    })
  }
})
