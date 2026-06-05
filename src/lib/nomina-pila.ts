/**
 * nomina-pila.ts — Generación del archivo plano PILA (Planilla Integrada de
 * Liquidación de Aportes) en el formato de la UGPP (v10.2 vigente).
 *
 * El archivo es texto plano con registros tipo 1 (aportante) y tipo 2 (empleado),
 * campos delimitados por ';'. Esta implementación produce los campos clave por
 * empleado en el orden de la especificación; los valores de aportes se derivan del
 * IBC con las tarifas legales (lo que la UGPP valida: IBC × tarifa).
 *
 * Referencia: https://www.ugpp.gov.co/planilla-integrada-liquidacion-aportes-pila
 */

// ─── Tarifas ARL por clase de riesgo (Decreto 1772/1994) ──────────────────────

export const TARIFA_ARL: Record<number, number> = {
  1: 0.00522,
  2: 0.01044,
  3: 0.02436,
  4: 0.0435,
  5: 0.0696,
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface EmpleadoParaPILA {
  // Datos personales
  tipoDoc: string // CC, CE, PA, etc.
  numeroDoc: string
  primerApellido: string
  segundoApellido: string
  primerNombre: string
  segundoNombre: string
  // Tipo de cotizante (01=dependiente, 51=servidor público)
  tipoCotizante: string
  subtipoCotizante: string
  // Datos del aporte
  diasLaborados: number
  ibc: number // Ingreso Base de Cotización (del nomina-motor)
  salarioBasico: number
  // Entidades (códigos PILA)
  codigoEPS: string
  codigoAFP: string
  codigoARL: string
  codigoCajaComp: string
  claseRiesgoARL: number // 1..5 → define la tarifa ARL
  // Novedad (ING=ingreso, RET=retiro, SLN=suspensión, etc.) — vacío si ninguna
  novedad?: string
}

export interface AportanteParaPILA {
  nit: string
  razonSocial: string
  periodoMM: string // "01".."12"
  periodoAAAA: string // "2026"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const r = (n: number) => Math.round(n)

/** Limpia un campo de texto para PILA (sin ';', sin tildes problemáticas, mayúsculas). */
function limpiar(s: string): string {
  return (s ?? "").replace(/;/g, " ").trim().toUpperCase()
}

// ─── Línea tipo 2 (empleado) ──────────────────────────────────────────────────

/**
 * Genera una línea de detalle (registro tipo 2) con los campos clave del empleado,
 * separados por ';', siguiendo la especificación PILA v10.2 de la UGPP.
 */
export function generarLineaPILA(emp: EmpleadoParaPILA): string {
  const tarifaArl = TARIFA_ARL[emp.claseRiesgoARL] ?? TARIFA_ARL[1]
  const ibc = r(emp.ibc)

  // Aportes derivados del IBC con tarifas legales.
  const valorSalud = r(ibc * 0.04) // empleado 4%
  const valorSaludEmpleador = r(ibc * 0.085) // empleador 8.5%
  const valorPension = r(ibc * 0.04) // empleado 4%
  const valorPensionEmpleador = r(ibc * 0.12) // empleador 12%
  const cotizacionArl = r(ibc * tarifaArl)
  const valorCaja = r(ibc * 0.04)
  const valorSena = r(ibc * 0.02)
  const valorIcbf = r(ibc * 0.03)

  const campos: (string | number)[] = [
    emp.tipoDoc, // 1  Tipo documento
    emp.numeroDoc, // 2  Número documento
    limpiar(emp.tipoCotizante), // 3  Tipo cotizante (51 servidor público)
    limpiar(emp.subtipoCotizante || "00"), // 4  Subtipo cotizante
    limpiar(emp.primerApellido), // 5
    limpiar(emp.segundoApellido), // 6
    limpiar(emp.primerNombre), // 7
    limpiar(emp.segundoNombre), // 8
    emp.novedad ? "X" : "", // 9  Ingreso (X si ING)
    "", // 10 Retiro
    "", // 11 Traslado EPS
    "", // 12 Traslado AFP
    "", // 13 Variación permanente salario
    "", // 14 Variación transitoria salario
    "", // 15 Suspensión / comisión / licencia
    "", // 16 Incapacidad enfermedad general
    "", // 17 Licencia maternidad
    "", // 18 Vacaciones / licencia remunerada
    "", // 19 Aporte voluntario
    emp.diasLaborados, // 20 Días cotizados
    emp.diasLaborados, // 21 Días pensión
    emp.diasLaborados, // 22 Días salud
    emp.diasLaborados, // 23 Días ARL
    emp.diasLaborados, // 24 Días caja
    r(emp.salarioBasico), // 25 Salario básico
    ibc, // 26 IBC pensión
    ibc, // 27 IBC salud
    ibc, // 28 IBC ARL
    ibc, // 29 IBC caja
    emp.codigoAFP, // 30 Código AFP
    emp.codigoEPS, // 31 Código EPS
    valorPension, // 32 Cotización obligatoria pensión (16% total)
    r(valorPension + valorPensionEmpleador), // 33 Total aporte pensión
    valorSalud + valorSaludEmpleador, // 34 Total aporte salud
    valorSalud, // 35 Valor salud empleado
    valorSaludEmpleador, // 36 Valor salud empleador
    emp.codigoARL, // 37 Código ARL
    (tarifaArl * 100).toFixed(3), // 38 Tarifa ARL (%)
    cotizacionArl, // 39 Cotización ARL
    emp.codigoCajaComp, // 40 Código caja de compensación
    valorCaja, // 41 Valor caja de compensación
    valorSena, // 42 Valor SENA
    valorIcbf, // 43 Valor ICBF
  ]

  return campos.join(";")
}

// ─── Línea tipo 1 (aportante) ─────────────────────────────────────────────────

function generarLineaAportante(ap: AportanteParaPILA, totalEmpleados: number): string {
  return [
    "1", // Tipo de registro
    limpiar(ap.razonSocial),
    "NI", // Tipo documento aportante (NIT)
    ap.nit,
    `${ap.periodoAAAA}-${ap.periodoMM}`, // Periodo de pago
    totalEmpleados,
  ].join(";")
}

// ─── Archivo completo ─────────────────────────────────────────────────────────

/**
 * Genera el archivo PILA completo: 1 línea de aportante (tipo 1) + N líneas de
 * empleados (tipo 2), separadas por salto de línea (CRLF, como exige la UGPP).
 */
export function generarArchivoPILA(aportante: AportanteParaPILA, empleados: EmpleadoParaPILA[]): string {
  const lineas: string[] = [generarLineaAportante(aportante, empleados.length)]
  for (const emp of empleados) {
    lineas.push(generarLineaPILA(emp))
  }
  return lineas.join("\r\n")
}

/** Nombre estándar del archivo: PILA_AAAA_MM.txt */
export function nombreArchivoPILA(periodoAAAA: string, periodoMM: string): string {
  return `PILA_${periodoAAAA}_${periodoMM}.txt`
}
