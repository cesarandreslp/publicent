/**
 * VU - Health Service
 *
 * Verificacion de salud del modulo Ventanilla Unica:
 * - Conexion a BD del tenant
 * - Estado de la cola de notificaciones VU
 * - Uptime del servidor
 *
 * Portado desde ventanilla_unica_base. Adaptaciones:
 * - prisma global -> getTenantPrisma() (multi-tenant via lib/tenant)
 * - notification -> vuNotificacion (modelo VU)
 * - estados Notificacion en espanol (PENDIENTE / FALLIDA)
 * - isInDegradedMode usa env var en vez de tabla SystemSetting
 */

import { getTenantPrisma } from '@/lib/tenant'

const SERVER_START_TIME = Date.now()

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  message?: string
}

export interface QueueStatus {
  status: 'healthy' | 'degraded' | 'down'
  pendingCount: number
  failedCount: number
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: HealthCheck
    notifications: QueueStatus
  }
}

export class HealthService {
  /**
   * Salud general del modulo VU.
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    const database = await this.checkDatabase()
    const notifications = await this.checkNotificationQueue()

    let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
    if (database.status === 'down' || notifications.status === 'down') {
      overallStatus = 'down'
    } else if (database.status === 'degraded' || notifications.status === 'degraded') {
      overallStatus = 'degraded'
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.SYSTEM_VERSION || '1.0.0',
      uptime: this.getUptime(),
      checks: { database, notifications },
    }
  }

  /**
   * Test de conexion a la BD del tenant actual.
   */
  static async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now()
    try {
      const prisma = await getTenantPrisma()
      await prisma.$queryRaw`SELECT 1 as result`
      const responseTime = Date.now() - start
      return {
        status: responseTime < 2000 ? 'healthy' : 'degraded',
        responseTime,
        message: responseTime < 2000 ? 'Database connected' : 'Database slow response',
      }
    } catch {
      return {
        status: 'down',
        responseTime: Date.now() - start,
        message: 'Database connection failed',
      }
    }
  }

  /**
   * Estado de la cola de notificaciones VU.
   */
  static async checkNotificationQueue(): Promise<QueueStatus> {
    try {
      const prisma = await getTenantPrisma()
      const [pendingCount, failedCount] = await Promise.all([
        prisma.vuNotificacion.count({ where: { estado: 'PENDIENTE' } }),
        prisma.vuNotificacion.count({ where: { estado: 'FALLIDA' } }),
      ])

      let status: 'healthy' | 'degraded' | 'down' = 'healthy'
      if (pendingCount > 100 || failedCount > 50) {
        status = 'degraded'
      }
      return { status, pendingCount, failedCount }
    } catch (error) {
      console.error('[VU/Health] error verificando cola de notificaciones:', error)
      return { status: 'down', pendingCount: -1, failedCount: -1 }
    }
  }

  /**
   * Uptime del servidor en segundos.
   */
  static getUptime(): number {
    return Math.floor((Date.now() - SERVER_START_TIME) / 1000)
  }

  /**
   * Modo degradado se controla por env var (no por DB).
   */
  static async isInDegradedMode(): Promise<boolean> {
    return process.env.SYSTEM_DEGRADED_MODE === 'true'
  }

  /**
   * Formato legible de uptime.
   */
  static formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }
}
