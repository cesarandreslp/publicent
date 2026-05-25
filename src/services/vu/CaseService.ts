/**
 * VU - Case Service
 *
 * Crea y consulta PQRS bajo la operacion del modulo Ventanilla Unica.
 *
 * Diferencias clave con ventanilla_unica_base:
 *  - No hay modelo `Citizen`: los datos viajan embebidos en la creacion
 *    (compatibles con `CitizenView` de CitizenService).
 *  - `CaseType`/`CaseState` son enums (TipoPQRS / EstadoPQRS).
 *  - Termino legal: si hay `VuConfiguracionSLA` por tipo lo usa; si no,
 *    aplica defaults legales colombianos (Ley 1755/2015).
 *  - `filingNumber`: format VU-{YYYY}-{NNNNNN}. La sigla se toma de env
 *    `VU_FILING_SIGLA` (default: `VU`).
 */

import { getTenantPrisma } from '@/lib/tenant'
import { CanalPQRS, EstadoPQRS, TipoPQRS, PrioridadPQRS } from '@prisma/client'
import { SystemSettingsService } from './SystemSettingsService'

export type CaseChannel = 'WEB' | 'PRESENCIAL' | 'TELEFONO' | 'EMAIL' | 'CORRESPONDENCIA'

const CHANNEL_MAP: Record<CaseChannel, CanalPQRS> = {
  WEB: 'WEB',
  PRESENCIAL: 'PRESENCIAL',
  TELEFONO: 'TELEFONO',
  EMAIL: 'EMAIL',
  CORRESPONDENCIA: 'CORRESPONDENCIA',
}

/** Dias habiles legales por tipo (defaults Ley 1755/2015). Configurable via VuConfiguracionSLA. */
const DEFAULT_TERM_DAYS: Record<TipoPQRS, number> = {
  PETICION: 15,
  QUEJA: 15,
  RECLAMO: 15,
  SUGERENCIA: 15,
  DENUNCIA: 15,
  FELICITACION: 10,
  CONSULTA: 30,
}

export interface CreateCaseInput {
  citizen: {
    nombreCompleto: string
    tipoDocumento: string
    numeroDocumento: string
    email: string
    telefono?: string
    direccion?: string
    municipio?: string
  }
  caseType: TipoPQRS
  subject: string
  description: string
  folios?: number
  channel: CaseChannel
  priority?: PrioridadPQRS
  priorityReason?: string
  metadata?: Record<string, unknown>
  anonimo?: boolean
  registradoPorId?: string  // funcionario que radica en nombre del ciudadano
}

export class CaseService {
  /**
   * Crea un PQRS, calcula su fecha de vencimiento y registra el evento inicial.
   */
  async create(input: CreateCaseInput) {
    const prisma = await getTenantPrisma()

    const diasTerminoLegal = await this.getTermDaysForType(input.caseType)
    const fechaRadicacion = new Date()
    const fechaVencimiento = await this.calculateDueDate(fechaRadicacion, diasTerminoLegal)
    const radicado = await this.generateFilingNumber()

    const created = await prisma.pQRS.create({
      data: {
        radicado,
        tipo: input.caseType,
        asunto: input.subject,
        descripcion: input.description,
        nombreSolicitante: input.citizen.nombreCompleto,
        tipoDocumento: input.citizen.tipoDocumento,
        numeroDocumento: input.citizen.numeroDocumento,
        email: input.citizen.email,
        telefono: input.citizen.telefono,
        direccion: input.citizen.direccion,
        municipio: input.citizen.municipio,
        estado: EstadoPQRS.RECIBIDA,
        prioridad: input.priority ?? PrioridadPQRS.NORMAL,
        razonPrioridad: input.priorityReason,
        fechaRadicacion,
        fechaVencimiento,
        diasTerminoLegal,
        folios: input.folios,
        canal: CHANNEL_MAP[input.channel] ?? CanalPQRS.WEB,
        anonimo: input.anonimo ?? false,
        metadata: input.metadata as object | undefined,
        registradoPorId: input.registradoPorId,
      },
    })

    await prisma.historialPQRS.create({
      data: {
        pqrsId: created.id,
        accion: 'RADICACION',
        descripcion: `PQRS radicado vía canal ${input.channel}`,
        estadoNuevo: EstadoPQRS.RECIBIDA,
        usuarioId: input.registradoPorId,
      },
    })

    return created
  }

  /**
   * Genera un radicado unico: SIGLA-YYYY-NNNNNN.
   */
  async generateFilingNumber(): Promise<string> {
    const prisma = await getTenantPrisma()
    const sigla = (process.env.VU_FILING_SIGLA || 'VU').toUpperCase()
    const year = new Date().getFullYear()
    const prefix = `${sigla}-${year}-`

    const last = await prisma.pQRS.findFirst({
      where: { radicado: { startsWith: prefix } },
      orderBy: { radicado: 'desc' },
      select: { radicado: true },
    })

    let next = 1
    if (last) {
      const parts = last.radicado.split('-')
      const lastN = parseInt(parts[parts.length - 1], 10)
      if (!Number.isNaN(lastN)) next = lastN + 1
    }

    return `${prefix}${next.toString().padStart(6, '0')}`
  }

  /**
   * Termino legal en dias habiles para un tipo de PQRS.
   * Consulta VuConfiguracionSLA primero; cae a defaults Ley 1755.
   */
  async getTermDaysForType(tipo: TipoPQRS): Promise<number> {
    try {
      const prisma = await getTenantPrisma()
      const cfg = await prisma.vuConfiguracionSLA.findUnique({ where: { tipo } })
      if (cfg?.activa && cfg.diasHabiles > 0) return cfg.diasHabiles
    } catch (error) {
      console.warn('[VU/Case] no se pudo leer VuConfiguracionSLA, uso default:', error)
    }
    return DEFAULT_TERM_DAYS[tipo] ?? 15
  }

  /**
   * Suma `dias` dias habiles a `from`, saltando festivos del tenant.
   */
  async calculateDueDate(from: Date, dias: number): Promise<Date> {
    const date = new Date(from)
    let added = 0
    while (added < dias) {
      date.setDate(date.getDate() + 1)
      // eslint-disable-next-line no-await-in-loop
      if (await SystemSettingsService.isBusinessDay(date)) added++
    }
    return date
  }

  async findByFilingNumber(filingNumber: string) {
    const prisma = await getTenantPrisma()
    return prisma.pQRS.findUnique({ where: { radicado: filingNumber } })
  }

  async findById(id: string) {
    const prisma = await getTenantPrisma()
    return prisma.pQRS.findUnique({ where: { id } })
  }

  /**
   * PQRS por documento del ciudadano.
   */
  async getCasesByCitizen(tipoDocumento: string, numeroDocumento: string) {
    const prisma = await getTenantPrisma()
    return prisma.pQRS.findMany({
      where: { tipoDocumento, numeroDocumento },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Calcula el semaforo del caso (rojo / amarillo / verde / negro).
   * Verde   : < 50% del termino
   * Amarillo: 50% - 80%
   * Rojo    : > 80% del termino
   * Negro   : vencido
   */
  async calculateCaseStatus(caseId: string): Promise<{
    color: 'VERDE' | 'AMARILLO' | 'ROJO' | 'NEGRO'
    porcentajeConsumido: number
    diasRestantes: number | null
  }> {
    const c = await this.findById(caseId)
    if (!c || !c.fechaVencimiento) {
      return { color: 'VERDE', porcentajeConsumido: 0, diasRestantes: null }
    }
    const ahora = Date.now()
    if (ahora > c.fechaVencimiento.getTime()) {
      return {
        color: 'NEGRO',
        porcentajeConsumido: 100,
        diasRestantes: Math.ceil((ahora - c.fechaVencimiento.getTime()) / 86_400_000) * -1,
      }
    }
    const total = c.fechaVencimiento.getTime() - c.fechaRadicacion.getTime()
    const consumido = ahora - c.fechaRadicacion.getTime()
    const porcentaje = Math.round((consumido / Math.max(1, total)) * 100)
    const diasRestantes = Math.ceil((c.fechaVencimiento.getTime() - ahora) / 86_400_000)
    const color = porcentaje < 50 ? 'VERDE' : porcentaje < 80 ? 'AMARILLO' : 'ROJO'
    return { color, porcentajeConsumido: porcentaje, diasRestantes }
  }

  /**
   * Estadisticas generales del tenant actual.
   */
  async getStats() {
    const prisma = await getTenantPrisma()
    const [total, byType, byState, byPriority, byChannel] = await Promise.all([
      prisma.pQRS.count(),
      prisma.pQRS.groupBy({ by: ['tipo'],      _count: true }),
      prisma.pQRS.groupBy({ by: ['estado'],    _count: true }),
      prisma.pQRS.groupBy({ by: ['prioridad'], _count: true }),
      prisma.pQRS.groupBy({ by: ['canal'],     _count: true }),
    ])
    return { total, byType, byState, byPriority, byChannel }
  }

  /**
   * Lista paginada con filtros.
   */
  async list(params: {
    page?: number
    limit?: number
    tipo?: TipoPQRS
    estado?: EstadoPQRS
    prioridad?: PrioridadPQRS
    canal?: CanalPQRS
  }) {
    const prisma = await getTenantPrisma()
    const page = params.page ?? 1
    const limit = params.limit ?? 20
    const skip = (page - 1) * limit

    const where = {
      tipo: params.tipo,
      estado: params.estado,
      prioridad: params.prioridad,
      canal: params.canal,
    }

    const [items, total] = await Promise.all([
      prisma.pQRS.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip }),
      prisma.pQRS.count({ where }),
    ])

    return {
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }
}

export const caseService = new CaseService()
