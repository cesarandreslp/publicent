/**
 * VU - SLA Service
 *
 * Calculo y mantenimiento del SLA institucional de cada PQRS.
 *
 * Adaptaciones respecto a ventanilla_unica_base:
 *  - Case -> PQRS, slaStatus -> VuColorSemaforo (NEGRO == vencido)
 *  - CaseSLAConfig.caseTypeId (FK a CaseType modelo) -> VuConfiguracionSLA.tipo
 *    (enum TipoPQRS unico, ya esta @unique en el schema)
 *  - dueDate -> pqrs.fechaVencimiento; isOverdue -> pqrs.vencido
 *  - legalTermDays -> pqrs.diasTerminoLegal
 *  - El estado del PQRS "CERRADO" en VU es EstadoPQRS.CERRADA
 *  - Usa SystemSettingsService.isBusinessDay para dias habiles
 */

import { getTenantPrisma } from '@/lib/tenant'
import { TipoPQRS, VuColorSemaforo, EstadoPQRS } from '@prisma/client'
import { auditService } from './AuditService'
import { SystemSettingsService } from './SystemSettingsService'

/** Defaults legales colombianos (Ley 1755/2015) si no hay VuConfiguracionSLA. */
const DEFAULT_TERM_DAYS: Record<TipoPQRS, number> = {
  PETICION: 15,
  QUEJA: 15,
  RECLAMO: 15,
  SUGERENCIA: 15,
  DENUNCIA: 15,
  FELICITACION: 10,
  CONSULTA: 30,
}

export class SLAService {
  /**
   * Suma N dias habiles a `startDate` saltando festivos del tenant.
   */
  async calculateDueDate(startDate: Date, businessDays: number): Promise<Date> {
    const d = new Date(startDate)
    let added = 0
    while (added < businessDays) {
      d.setDate(d.getDate() + 1)
      // eslint-disable-next-line no-await-in-loop
      if (await SystemSettingsService.isBusinessDay(d)) added++
    }
    return d
  }

  /**
   * Estado del SLA segun tiempo restante respecto a la fecha de radicacion.
   * Devuelve un VuColorSemaforo. Si no hay diasTerminoLegal se asume 15.
   */
  calculateSLAStatus(
    dueDate: Date,
    filedAt: Date,
    referenceDate: Date = new Date(),
  ): VuColorSemaforo {
    if (referenceDate.getTime() > dueDate.getTime()) return 'NEGRO'
    const total = Math.max(1, dueDate.getTime() - filedAt.getTime())
    const consumed = referenceDate.getTime() - filedAt.getTime()
    const pct = (consumed / total) * 100
    if (pct < 50) return 'VERDE'
    if (pct < 80) return 'AMARILLO'
    return 'ROJO'
  }

  /**
   * Dias habiles configurados para un tipo de PQRS.
   */
  async getSLAConfig(tipo: TipoPQRS): Promise<{ success: boolean; slaDays?: number; error?: string }> {
    try {
      const prisma = await getTenantPrisma()
      const cfg = await prisma.vuConfiguracionSLA.findUnique({ where: { tipo } })
      if (cfg?.activa && cfg.diasHabiles > 0) {
        return { success: true, slaDays: cfg.diasHabiles }
      }
      return { success: true, slaDays: DEFAULT_TERM_DAYS[tipo] ?? 15 }
    } catch (error) {
      console.error('[VU/SLA] error config:', error)
      return { success: false, error: 'Error al obtener configuracion de SLA' }
    }
  }

  /**
   * Calcula SLA y actualiza el PQRS al crearse.
   */
  async calculateAndSetSLA(
    caseId: string,
    tipo: TipoPQRS,
    filedAt: Date,
    userId: string,
    userEmail: string,
    userRole: string,
  ): Promise<{ success: boolean; dueDate?: Date; slaStatus?: VuColorSemaforo; error?: string }> {
    try {
      const cfg = await this.getSLAConfig(tipo)
      if (!cfg.success || !cfg.slaDays) return { success: false, error: cfg.error || 'Sin SLA' }

      const dueDate = await this.calculateDueDate(filedAt, cfg.slaDays)
      const slaStatus = this.calculateSLAStatus(dueDate, filedAt)

      const prisma = await getTenantPrisma()
      await prisma.pQRS.update({
        where: { id: caseId },
        data: {
          diasTerminoLegal: cfg.slaDays,
          fechaVencimiento: dueDate,
          colorSemaforo: slaStatus,
          vencido: slaStatus === 'NEGRO',
        },
      })

      await auditService.log({
        action: 'CASE_CREATED',
        userId,
        userEmail,
        userRole,
        tenantId: null,
        entityType: 'PQRS',
        entityId: caseId,
        ipAddress: 'system',
        userAgent: 'system',
        caseId,
        metadata: { slaDays: cfg.slaDays, dueDate: dueDate.toISOString(), slaStatus },
      })

      return { success: true, dueDate, slaStatus }
    } catch (error) {
      console.error('[VU/SLA] error calcAndSet:', error)
      return { success: false, error: 'Error al calcular SLA' }
    }
  }

  /**
   * Recalcula el SLA con la fecha actual (util tras cambios de estado).
   */
  async recalculateSLA(
    caseId: string,
    userId: string,
    userEmail: string,
    userRole: string,
  ): Promise<{ success: boolean; dueDate?: Date; slaStatus?: VuColorSemaforo; error?: string }> {
    try {
      const prisma = await getTenantPrisma()
      const pqrs = await prisma.pQRS.findUnique({ where: { id: caseId } })
      if (!pqrs) return { success: false, error: 'PQRS no encontrado' }
      if (!pqrs.fechaVencimiento) return { success: false, error: 'PQRS sin fechaVencimiento' }

      const slaStatus = this.calculateSLAStatus(pqrs.fechaVencimiento, pqrs.fechaRadicacion)
      if (slaStatus !== pqrs.colorSemaforo) {
        await prisma.pQRS.update({
          where: { id: caseId },
          data: { colorSemaforo: slaStatus, vencido: slaStatus === 'NEGRO' },
        })
        if (slaStatus === 'NEGRO' && pqrs.colorSemaforo !== 'NEGRO') {
          await auditService.log({
            action: 'STATUS_CHANGED',
            userId,
            userEmail,
            userRole,
            tenantId: null,
            entityType: 'PQRS',
            entityId: caseId,
            ipAddress: 'system',
            userAgent: 'system',
            caseId,
            metadata: {
              slaStatusChanged: true,
              oldStatus: pqrs.colorSemaforo,
              newStatus: slaStatus,
              dueDate: pqrs.fechaVencimiento.toISOString(),
            },
          })
        }
      }
      return { success: true, dueDate: pqrs.fechaVencimiento, slaStatus }
    } catch (error) {
      console.error('[VU/SLA] error recalculo:', error)
      return { success: false, error: 'Error al recalcular SLA' }
    }
  }

  /**
   * Marca como vencidos todos los PQRS no cerrados cuyo termino paso.
   * Apropiado para correr via cron diario.
   */
  async updateAllOverdueStatus(): Promise<{ success: boolean; updated: number; error?: string }> {
    try {
      const prisma = await getTenantPrisma()
      const now = new Date()
      const result = await prisma.pQRS.updateMany({
        where: {
          fechaVencimiento: { lt: now },
          colorSemaforo: { not: VuColorSemaforo.NEGRO },
          estado: { notIn: [EstadoPQRS.CERRADA, EstadoPQRS.ANULADA] },
        },
        data: { colorSemaforo: VuColorSemaforo.NEGRO, vencido: true },
      })
      return { success: true, updated: result.count }
    } catch (error) {
      console.error('[VU/SLA] error update overdue:', error)
      return { success: false, updated: 0, error: 'Error al actualizar vencimientos' }
    }
  }

  /**
   * Crea/actualiza la configuracion de SLA para un tipo.
   */
  async upsertSLAConfig(
    tipo: TipoPQRS,
    diasHabiles: number,
    options?: {
      diasAlerta?: number
      diasCriticoVencido?: number
      userId?: string
      userEmail?: string
      userRole?: string
    },
  ): Promise<{ success: boolean; config?: unknown; error?: string }> {
    try {
      const prisma = await getTenantPrisma()
      const existing = await prisma.vuConfiguracionSLA.findUnique({ where: { tipo } })

      const config = await prisma.vuConfiguracionSLA.upsert({
        where: { tipo },
        create: {
          tipo,
          diasHabiles,
          diasAlerta: options?.diasAlerta ?? Math.max(1, Math.floor(diasHabiles * 0.5)),
          diasCriticoVencido: options?.diasCriticoVencido,
          activa: true,
        },
        update: {
          diasHabiles,
          diasAlerta: options?.diasAlerta,
          diasCriticoVencido: options?.diasCriticoVencido,
        },
      })

      if (options?.userId && options?.userEmail && options?.userRole) {
        await auditService.log({
          action: existing ? 'SLA_UPDATED' : 'SLA_CREATED',
          userId: options.userId,
          userEmail: options.userEmail,
          userRole: options.userRole,
          tenantId: null,
          entityType: 'VuConfiguracionSLA',
          entityId: config.id,
          ipAddress: 'system',
          userAgent: 'system',
          metadata: { tipo, diasHabiles },
          before: existing ? { diasHabiles: existing.diasHabiles } : undefined,
          after: { diasHabiles: config.diasHabiles },
        })
      }

      return { success: true, config }
    } catch (error) {
      console.error('[VU/SLA] error upsert:', error)
      return { success: false, error: 'Error al guardar configuracion de SLA' }
    }
  }

  /**
   * Lista todas las configuraciones de SLA del tenant.
   */
  async getAllSLAConfigs() {
    try {
      const prisma = await getTenantPrisma()
      const configs = await prisma.vuConfiguracionSLA.findMany({
        orderBy: { tipo: 'asc' },
      })
      return {
        success: true,
        configs: configs.map((c) => ({
          id: c.id,
          tipo: c.tipo,
          diasHabiles: c.diasHabiles,
          diasAlerta: c.diasAlerta,
          diasCriticoVencido: c.diasCriticoVencido,
          activa: c.activa,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      }
    } catch (error) {
      console.error('[VU/SLA] error lista configs:', error)
      return { success: false, configs: [], error: 'Error al obtener configuraciones' }
    }
  }
}

export const slaService = new SLAService()
