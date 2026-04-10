/**
 * Plan Guard — Middleware de validación de cuotas del tenant
 *
 * Verifica los límites del plan antes de permitir operaciones:
 * - Número de radicados/año
 * - Acceso a API pública
 * - Número de sedes/dependencias
 *
 * Envía alerta SSE cuando el tenant supera el 80% de su cuota.
 */

import { getTenantPrisma } from "@/lib/tenant"

export interface PlanLimits {
  nivel: string
  limiteRadicados: number
  radicadosActuales: number
  porcentajeUso: number
  limiteSedes: number
  apiPublica: boolean
  slaHoras: number
  activo: boolean
  fechaVencimiento: Date | null
  superaCuota80: boolean
  superaCuota100: boolean
}

/**
 * Obtiene la configuración del plan del tenant actual.
 * Si no existe, crea una configuración por defecto (BASICO).
 */
export async function obtenerPlanConfig(): Promise<PlanLimits> {
  const prisma = await getTenantPrisma()
  const anioActual = new Date().getFullYear()

  let config = await prisma.gdPlanConfig.findFirst({
    where: { activo: true },
  })

  // Si no hay config, crear una por defecto
  if (!config) {
    config = await prisma.gdPlanConfig.create({
      data: {
        nivel: "BASICO",
        limiteRadicados: 50000,
        limiteSedes: 1,
        apiPublica: false,
        slaHoras: 72,
        radicadosActuales: 0,
        anioActual,
      },
    })
  }

  // Si cambió el año, resetear conteo
  if (config.anioActual !== anioActual) {
    config = await prisma.gdPlanConfig.update({
      where: { id: config.id },
      data: { radicadosActuales: 0, anioActual },
    })
  }

  const porcentajeUso = config.limiteRadicados > 0
    ? Math.round((config.radicadosActuales / config.limiteRadicados) * 100)
    : 0

  return {
    nivel: config.nivel,
    limiteRadicados: config.limiteRadicados,
    radicadosActuales: config.radicadosActuales,
    porcentajeUso,
    limiteSedes: config.limiteSedes,
    apiPublica: config.apiPublica,
    slaHoras: config.slaHoras,
    activo: config.activo,
    fechaVencimiento: config.fechaVencimiento,
    superaCuota80: porcentajeUso >= 80,
    superaCuota100: porcentajeUso >= 100,
  }
}

/**
 * Valida que el tenant puede crear un nuevo radicado.
 * Retorna null si OK, o un string con el motivo de rechazo.
 */
export async function validarCuotaRadicados(): Promise<string | null> {
  const plan = await obtenerPlanConfig()

  if (!plan.activo) {
    return "Plan no activo. Contacte al administrador de la plataforma."
  }

  if (plan.fechaVencimiento && new Date() > plan.fechaVencimiento) {
    return "Plan vencido. Renueve su suscripción para continuar."
  }

  // Enterprise no tiene límite
  if (plan.nivel === "ENTERPRISE") return null

  if (plan.superaCuota100) {
    return `Ha alcanzado el límite de ${plan.limiteRadicados.toLocaleString()} radicados/año del plan ${plan.nivel}. Actualice a un plan superior.`
  }

  return null
}

/**
 * Incrementa el conteo de radicados del año actual.
 * Llamar después de crear exitosamente un radicado.
 */
export async function incrementarConteoRadicados(): Promise<void> {
  const prisma = await getTenantPrisma()

  await prisma.gdPlanConfig.updateMany({
    where: { activo: true },
    data: { radicadosActuales: { increment: 1 } },
  })
}

/**
 * Valida acceso a la API pública según el plan.
 */
export async function validarAccesoApiPublica(): Promise<string | null> {
  const plan = await obtenerPlanConfig()

  if (!plan.apiPublica) {
    return `El plan ${plan.nivel} no incluye acceso a la API pública. Actualice a PROFESIONAL o ENTERPRISE.`
  }

  return null
}

/**
 * Valida el número de sedes/dependencias según el plan.
 */
export async function validarLimiteSedes(sedesActuales: number): Promise<string | null> {
  const plan = await obtenerPlanConfig()

  if (plan.nivel === "ENTERPRISE") return null

  if (sedesActuales >= plan.limiteSedes) {
    return `Ha alcanzado el límite de ${plan.limiteSedes} sedes del plan ${plan.nivel}.`
  }

  return null
}

/**
 * Configuración por plan
 */
export const PLAN_DEFAULTS: Record<string, Omit<PlanLimits, "radicadosActuales" | "porcentajeUso" | "activo" | "fechaVencimiento" | "superaCuota80" | "superaCuota100">> = {
  BASICO: {
    nivel: "BASICO",
    limiteRadicados: 50000,
    limiteSedes: 1,
    apiPublica: false,
    slaHoras: 72,
  },
  PROFESIONAL: {
    nivel: "PROFESIONAL",
    limiteRadicados: 200000,
    limiteSedes: 3,
    apiPublica: true,
    slaHoras: 48,
  },
  ENTERPRISE: {
    nivel: "ENTERPRISE",
    limiteRadicados: 999999999,
    limiteSedes: 999,
    apiPublica: true,
    slaHoras: 24,
  },
}
