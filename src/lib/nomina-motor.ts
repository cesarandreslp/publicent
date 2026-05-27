/**
 * nomina-motor.ts — Motor de liquidación de nómina.
 *
 * Dada una lista de empleados activos en el periodo y el catálogo de conceptos,
 * calcula devengados, deducciones del empleado y aportes patronales por
 * empleado, respetando el orden de aplicación de cada concepto.
 *
 * Reglas:
 *   - DEVENGADOS se calculan primero (orden 10..99) sumando la base.
 *   - El IBC (Ingreso Base de Cotización) = suma de devengados constitutivos
 *     de salario (excluye auxilio de transporte si no constituye salario).
 *   - DEDUCCIONES se aplican sobre IBC o devengados según la fórmula.
 *   - APORTES PATRONALES NO afectan el neto a pagar al empleado pero sí
 *     se registran como gasto/pasivo de la entidad.
 *   - PRESTACIONES SOCIALES = provisiones mensuales, también gasto del patrono.
 *
 * Cálculos especiales no incluidos en esta primera versión (queda pendiente):
 *   - Retención en la fuente por procedimiento 1/2 (UVT, tablas DIAN).
 *   - Cesantías con base promedio últimos 12 meses.
 *   - Vacaciones con base días laborados.
 */
import type { ConceptoNomina } from "./seeders/nomina-conceptos"

export type EmpleadoLite = {
  id: string
  tipoVinculacion: "PLANTA" | "TRABAJADOR_OFICIAL" | "CONTRATISTA" | "SUPERNUMERARIO" | "APRENDIZ"
  salarioBasico: number
}

export type LineaLiquidacion = {
  conceptoId: string
  codigo: string
  nombre: string
  tipo: ConceptoNomina["tipo"]
  valor: number
  base: number | null
}

export type ResultadoLiquidacion = {
  empleadoId: string
  totalDevengado: number
  totalDeducciones: number
  totalAportesPatronales: number
  netoPagar: number
  ibc: number
  lineas: LineaLiquidacion[]
}

type ConceptoConId = ConceptoNomina & { id: string }

export function liquidarEmpleado(
  empleado: EmpleadoLite,
  conceptos: ConceptoConId[],
  diasLiquidados: number = 30,
  novedadesValor: { devengadoExtra: number; descuentoExtra: number } = { devengadoExtra: 0, descuentoExtra: 0 },
): ResultadoLiquidacion {
  // Filtrar conceptos aplicables al tipo de vinculación
  const aplicables = conceptos
    .filter(c => !c.aplicaA?.length || c.aplicaA.includes(empleado.tipoVinculacion))
    .sort((a, b) => a.orden - b.orden)

  const lineas: LineaLiquidacion[] = []
  let totalDevengadoSalarial = 0   // ingredientes del IBC
  let totalDevengadoCompleto = 0   // todos los devengados (con auxilios)
  const factorDias = diasLiquidados / 30

  // ─── Pasada 1: DEVENGADOS ────────────────────────────────────────────────
  for (const c of aplicables) {
    if (c.tipo !== "DEVENGADO") continue
    let valor = 0
    let base: number | null = null

    switch (c.formula) {
      case "PORCENTAJE_SUELDO":
        base = empleado.salarioBasico
        valor = empleado.salarioBasico * (c.porcentaje ?? 0) * factorDias
        break
      case "FIJO":
        valor = (c.valorFijo ?? 0) * factorDias
        break
      case "CALCULO_ESPECIAL":
        // Provisiones mensuales: prima de servicios 1/12, navidad 1/12, etc.
        // Para esta primera versión usamos 8.33% del salario para primas
        // semestrales y 4.17% mensual para vacaciones aproximadas.
        // El motor real consultaría histórico — fuera de alcance MVP.
        base = empleado.salarioBasico
        if (/prima/i.test(c.nombre)) valor = empleado.salarioBasico * 0.0833 * factorDias
        else if (/vacaciones/i.test(c.nombre)) valor = empleado.salarioBasico * 0.0417 * factorDias
        break
      default:
        valor = 0
    }

    if (valor <= 0) continue
    valor = Math.round(valor)
    lineas.push({ conceptoId: c.id, codigo: c.codigo, nombre: c.nombre, tipo: c.tipo, valor, base })
    totalDevengadoCompleto += valor
    if (c.constitutivoSalario) totalDevengadoSalarial += valor
  }

  // Suma novedades extra como devengado (ej. vacaciones aprobadas)
  if (novedadesValor.devengadoExtra > 0) {
    lineas.push({ conceptoId: "novedad", codigo: "NOV-DEV", nombre: "Novedades del periodo", tipo: "DEVENGADO", valor: novedadesValor.devengadoExtra, base: null })
    totalDevengadoCompleto += novedadesValor.devengadoExtra
  }

  // IBC: usado para aportes pension/salud/ARL.
  // Para empleados públicos, el IBC mínimo es el SMMLV, máximo 25 SMMLV.
  // Aquí simplemente usamos el devengado salarial.
  const ibc = totalDevengadoSalarial

  // ─── Pasada 2: DEDUCCIONES EMPLEADO ──────────────────────────────────────
  let totalDeducciones = 0
  for (const c of aplicables) {
    if (c.tipo !== "DEDUCCION_EMPLEADO") continue
    let valor = 0
    let base: number | null = null
    switch (c.formula) {
      case "PORCENTAJE_IBC":
        base = ibc
        valor = ibc * (c.porcentaje ?? 0)
        break
      case "PORCENTAJE_DEVENGADO":
        base = totalDevengadoCompleto
        valor = totalDevengadoCompleto * (c.porcentaje ?? 0)
        break
      case "FIJO":
        valor = c.valorFijo ?? 0
        break
      case "CALCULO_ESPECIAL":
        // Retención en la fuente — placeholder simplificado: 0
        valor = 0
        break
      default:
        valor = 0
    }
    if (valor <= 0) continue
    valor = Math.round(valor)
    lineas.push({ conceptoId: c.id, codigo: c.codigo, nombre: c.nombre, tipo: c.tipo, valor, base })
    totalDeducciones += valor
  }

  if (novedadesValor.descuentoExtra > 0) {
    lineas.push({ conceptoId: "novedad-desc", codigo: "NOV-DESC", nombre: "Descuentos por novedades", tipo: "DEDUCCION_EMPLEADO", valor: novedadesValor.descuentoExtra, base: null })
    totalDeducciones += novedadesValor.descuentoExtra
  }

  // ─── Pasada 3: APORTES PATRONALES + PRESTACIONES ─────────────────────────
  let totalAportesPatronales = 0
  for (const c of aplicables) {
    if (c.tipo !== "APORTE_PATRONAL" && c.tipo !== "PRESTACION_SOCIAL") continue
    let valor = 0
    let base: number | null = null
    switch (c.formula) {
      case "PORCENTAJE_IBC":
        base = ibc
        valor = ibc * (c.porcentaje ?? 0)
        break
      case "PORCENTAJE_DEVENGADO":
        base = totalDevengadoSalarial
        valor = totalDevengadoSalarial * (c.porcentaje ?? 0)
        break
      case "PORCENTAJE_SUELDO":
        base = empleado.salarioBasico
        valor = empleado.salarioBasico * (c.porcentaje ?? 0) * factorDias
        break
      case "FIJO":
        valor = c.valorFijo ?? 0
        break
    }
    if (valor <= 0) continue
    valor = Math.round(valor)
    lineas.push({ conceptoId: c.id, codigo: c.codigo, nombre: c.nombre, tipo: c.tipo, valor, base })
    totalAportesPatronales += valor
  }

  const netoPagar = totalDevengadoCompleto - totalDeducciones

  return {
    empleadoId: empleado.id,
    totalDevengado: totalDevengadoCompleto,
    totalDeducciones,
    totalAportesPatronales,
    netoPagar,
    ibc,
    lineas,
  }
}
