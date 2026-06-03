/**
 * furag-alertas.ts
 *
 * Lógica de alertas automáticas para el cierre de vigencia FURAG.
 *
 * El DAFP abre el módulo FURAG entre octubre y marzo del año siguiente.
 * Esta librería calcula cuántos días hábiles quedan hasta el cierre,
 * clasifica el nivel de urgencia y genera payloads de alerta.
 *
 * Umbrales por defecto:
 *   INFORMATIVA  → > 30 días naturales
 *   ADVERTENCIA  → 16–30 días
 *   URGENTE      → 8–15 días
 *   CRITICA      → 1–7 días
 *   VENCIDA      → 0 o negativo
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type NivelAlertaFurag =
  | 'INFORMATIVA'
  | 'ADVERTENCIA'
  | 'URGENTE'
  | 'CRITICA'
  | 'VENCIDA'
  | 'FUERA_DE_PERIODO'

export interface EstadoVigenciaFurag {
  anioVigencia: number
  fechaApertura: string     // ISO date
  fechaCierre: string       // ISO date
  diasRestantes: number     // negativo si ya venció
  nivel: NivelAlertaFurag
  mensaje: string
  porcentajeConsumido: number   // 0–100
  estaAbierto: boolean
  recomendacion: string
}

export interface ConfigVigenciaFurag {
  /** Día y mes de apertura del módulo FURAG (para el año de reporte) */
  aperturaMes: number   // 1-based (10 = octubre)
  aperturaDia: number
  /** Día y mes de cierre del módulo FURAG */
  cierreMes: number     // 1-based (3 = marzo del año siguiente)
  cierreDia: number
}

// ─── Configuración por defecto ────────────────────────────────────────────────
// El DAFP históricamente abre FURAG en octubre (vigencia año N)
// y cierra entre febrero y abril del año N+1.
// Se usa 31 de marzo como fecha de cierre conservadora.

const CONFIG_DEFAULT: ConfigVigenciaFurag = {
  aperturaMes: 10,
  aperturaDia: 1,
  cierreMes: 3,
  cierreDia: 31,
}

// ─── Utilidades internas ──────────────────────────────────────────────────────

/**
 * Construye fechas de apertura y cierre para la vigencia FURAG del año dado.
 * La apertura es en octubre del año evaluado (anioVigencia).
 * El cierre es en marzo/abril del año siguiente (anioVigencia + 1).
 */
function calcularFechasVigencia(
  anioVigencia: number,
  config: ConfigVigenciaFurag = CONFIG_DEFAULT
): { apertura: Date; cierre: Date } {
  // Se construyen en UTC para que el formateo posterior con toISOString()
  // devuelva la misma fecha de calendario en cualquier zona horaria (Vercel
  // corre en UTC; los equipos en Colombia, UTC-5). Sin esto, un cierre el
  // 31-mar 23:59 local se desbordaba al 1-abr en UTC.
  const apertura = new Date(Date.UTC(anioVigencia, config.aperturaMes - 1, config.aperturaDia, 0, 0, 0, 0))
  const cierre   = new Date(Date.UTC(anioVigencia + 1, config.cierreMes - 1, config.cierreDia, 23, 59, 59, 999))
  return { apertura, cierre }
}

function diffDiasNaturales(desde: Date, hasta: Date): number {
  const DIA_MS = 1000 * 60 * 60 * 24
  const ms = hasta.getTime() - desde.getTime()
  // Ceil simétrico: una fracción de día cuenta como día completo en ambos
  // sentidos. Así, un instante ya pasado el cierre da siempre un valor
  // negativo (vencido), sin depender de la zona horaria del proceso.
  return ms >= 0 ? Math.ceil(ms / DIA_MS) : -Math.ceil(-ms / DIA_MS)
}

function porcentajeConsumido(apertura: Date, cierre: Date, ahora: Date): number {
  const totalMs = cierre.getTime() - apertura.getTime()
  if (totalMs <= 0) return 100
  const consumidoMs = ahora.getTime() - apertura.getTime()
  const pct = (consumidoMs / totalMs) * 100
  return Math.min(100, Math.max(0, Math.round(pct)))
}

function clasificarNivel(
  diasRestantes: number,
  estaAbierto: boolean
): NivelAlertaFurag {
  if (!estaAbierto && diasRestantes > 0) return 'FUERA_DE_PERIODO'
  if (diasRestantes <= 0)  return 'VENCIDA'
  if (diasRestantes <= 7)  return 'CRITICA'
  if (diasRestantes <= 15) return 'URGENTE'
  if (diasRestantes <= 30) return 'ADVERTENCIA'
  return 'INFORMATIVA'
}

function generarMensaje(
  nivel: NivelAlertaFurag,
  diasRestantes: number,
  anioVigencia: number,
  fechaCierre: string
): string {
  switch (nivel) {
    case 'FUERA_DE_PERIODO':
      return `El módulo FURAG ${anioVigencia} aún no ha sido abierto por el DAFP.`
    case 'VENCIDA':
      return `La ventana de reporte FURAG ${anioVigencia} venció hace ${Math.abs(diasRestantes)} días (${fechaCierre}).`
    case 'CRITICA':
      return `¡Cierre inminente! Quedan solo ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} para reportar FURAG ${anioVigencia}.`
    case 'URGENTE':
      return `Quedan ${diasRestantes} días para cerrar el reporte FURAG ${anioVigencia}. Revisa los indicadores pendientes.`
    case 'ADVERTENCIA':
      return `Faltan ${diasRestantes} días para el cierre FURAG ${anioVigencia}. Asegura que las evaluaciones estén completas.`
    case 'INFORMATIVA':
    default:
      return `El módulo FURAG ${anioVigencia} cierra el ${fechaCierre}. Quedan ${diasRestantes} días.`
  }
}

function generarRecomendacion(
  nivel: NivelAlertaFurag,
  anioVigencia: number
): string {
  switch (nivel) {
    case 'FUERA_DE_PERIODO':
      return `Prepara el autodiagnóstico en el sistema antes de la apertura. Revisa la Resolución del DAFP para confirmar fechas.`
    case 'VENCIDA':
      return `Si el módulo sigue disponible, intenta cargar los datos con la mayor celeridad posible y comunícate con tu enlace MIPG.`
    case 'CRITICA':
      return `Ingresa al módulo FURAG en SUITE VISUAL DAFP ahora mismo. Prioriza los indicadores con menor puntaje.`
    case 'URGENTE':
      return `Ejecuta la validación automática de indicadores y corrige las inconsistencias antes de subir los puntajes al DAFP.`
    case 'ADVERTENCIA':
      return `Verifica que todos los indicadores POL06, POL07 y POL03 tienen puntaje declarado. Ejecuta la validación automática.`
    case 'INFORMATIVA':
    default:
      return `Mantén actualizadas las calificaciones MIPG en el sistema para que la validación automática sea precisa al momento del reporte.`
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Calcula el estado actual de la vigencia FURAG para un año dado.
 *
 * @param anioVigencia  Año de la vigencia a evaluar (e.g. 2025)
 * @param ahora         Fecha actual (default: new Date()). Inyectable para tests.
 * @param config        Configuración de fechas de apertura/cierre.
 */
export function calcularEstadoVigenciaFurag(
  anioVigencia: number,
  ahora: Date = new Date(),
  config: ConfigVigenciaFurag = CONFIG_DEFAULT
): EstadoVigenciaFurag {
  const { apertura, cierre } = calcularFechasVigencia(anioVigencia, config)

  const estaAbierto = ahora >= apertura && ahora <= cierre
  const diasRestantes = diffDiasNaturales(ahora, cierre)
  const pct = porcentajeConsumido(apertura, cierre, ahora)

  const fechaAperturaISO = apertura.toISOString().split('T')[0]
  const fechaCierreISO   = cierre.toISOString().split('T')[0]

  const nivel = clasificarNivel(diasRestantes, estaAbierto)
  const mensaje = generarMensaje(nivel, diasRestantes, anioVigencia, fechaCierreISO)
  const recomendacion = generarRecomendacion(nivel, anioVigencia)

  return {
    anioVigencia,
    fechaApertura: fechaAperturaISO,
    fechaCierre:   fechaCierreISO,
    diasRestantes,
    nivel,
    mensaje,
    porcentajeConsumido: estaAbierto ? pct : (ahora < apertura ? 0 : 100),
    estaAbierto,
    recomendacion,
  }
}

/**
 * Devuelve el estado de la vigencia FURAG más relevante para hoy.
 * Prioriza la vigencia actualmente abierta; si no hay ninguna abierta,
 * devuelve la próxima vigencia futura (apertura aún no comenzada).
 */
export function calcularVigenciaMasRelevante(
  ahora: Date = new Date(),
  config: ConfigVigenciaFurag = CONFIG_DEFAULT
): EstadoVigenciaFurag {
  const anioActual = ahora.getFullYear()

  // Comprobar vigencia del año anterior (puede estar abierta en enero-marzo)
  const estadoAnioAnterior = calcularEstadoVigenciaFurag(anioActual - 1, ahora, config)
  if (estadoAnioAnterior.estaAbierto) return estadoAnioAnterior

  // Comprobar vigencia del año actual
  const estadoAnioActual = calcularEstadoVigenciaFurag(anioActual, ahora, config)
  if (estadoAnioActual.estaAbierto) return estadoAnioActual

  // Ninguna abierta: devolver la próxima (año actual, que abrirá en octubre)
  return estadoAnioActual
}

/**
 * Determina si se debe enviar una notificación push/email para el nivel dado.
 * Se evita spam: solo notifica en los umbrales exactos.
 */
export function debeNotificar(
  diasRestantes: number
): boolean {
  const HITOS = [90, 60, 30, 15, 7, 3, 1]
  return HITOS.includes(diasRestantes)
}
