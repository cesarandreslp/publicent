/**
 * VU - System Settings Service
 *
 * Parametrizacion del modulo Ventanilla Unica (calendario, horarios, branding,
 * umbrales SLA, IA, etc.).
 *
 * Adaptaciones respecto a ventanilla_unica_base:
 *  - prisma global -> getTenantPrisma() (multi-tenant)
 *  - prisma.systemSetting -> prisma.vuConfiguracionSistema
 *  - campos key/value -> clave/valor (Json)
 *  - clave es String libre (no enum) — agregar nuevas claves sin migracion
 *  - Auditoria via lib/auditoria.ts del proyecto (no AuditService propio aun)
 */

import { getTenantPrisma } from '@/lib/tenant'

export type SettingKey =
  | 'HOLIDAYS'
  | 'BUSINESS_HOURS'
  | 'ATTENTION_DAYS'
  | 'CASE_TYPES_CONFIG'
  | 'LEGAL_TEXTS'
  | 'NOTIFICATION_FROM_EMAIL'
  | 'NOTIFICATION_FROM_NAME'
  | 'INSTITUTION_NAME'
  | 'INSTITUTION_ADDRESS'
  | 'INSTITUTION_PHONE'
  | 'MAX_CASE_LOAD'
  | 'SLA_WARNING_THRESHOLD'
  | 'AUTO_ASSIGNMENT_ENABLED'

export interface HolidayDate {
  date: string  // YYYY-MM-DD
  name: string
  isNational: boolean
}

export interface BusinessHours {
  start: string // HH:MM
  end: string   // HH:MM
}

export interface LegalTexts {
  [section: string]: string
}

export interface SettingValue {
  HOLIDAYS: HolidayDate[]
  BUSINESS_HOURS: BusinessHours
  ATTENTION_DAYS: string[]
  CASE_TYPES_CONFIG: Record<string, unknown>[]
  LEGAL_TEXTS: LegalTexts
  NOTIFICATION_FROM_EMAIL: string
  NOTIFICATION_FROM_NAME: string
  INSTITUTION_NAME: string
  INSTITUTION_ADDRESS: string
  INSTITUTION_PHONE: string
  MAX_CASE_LOAD: number
  SLA_WARNING_THRESHOLD: number
  AUTO_ASSIGNMENT_ENABLED: boolean
}

export class SystemSettingsService {
  private static readonly DEFAULTS: Partial<SettingValue> = {
    HOLIDAYS: [],
    BUSINESS_HOURS: { start: '08:00', end: '17:00' },
    ATTENTION_DAYS: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    CASE_TYPES_CONFIG: [],
    LEGAL_TEXTS: {
      privacyPolicy: 'Politica de privacidad de la entidad.',
      termsOfService: 'Terminos y condiciones del servicio.',
      transparencyNote: 'En cumplimiento de la Ley 1712 de 2014.',
    },
    NOTIFICATION_FROM_EMAIL: 'noreply@entidad.gov.co',
    NOTIFICATION_FROM_NAME: 'Entidad Institucional',
    INSTITUTION_NAME: 'Entidad Institucional',
    INSTITUTION_ADDRESS: '',
    INSTITUTION_PHONE: '',
    MAX_CASE_LOAD: 50,
    SLA_WARNING_THRESHOLD: 50,
    AUTO_ASSIGNMENT_ENABLED: false,
  }

  /**
   * Lee un setting; si no existe devuelve el default.
   */
  static async getSetting<K extends SettingKey>(key: K): Promise<SettingValue[K]> {
    const prisma = await getTenantPrisma()
    const setting = await prisma.vuConfiguracionSistema.findUnique({
      where: { clave: key },
    })
    if (!setting) return this.DEFAULTS[key] as SettingValue[K]
    return setting.valor as unknown as SettingValue[K]
  }

  /**
   * Lee todos los settings (mezcla con defaults).
   */
  static async getAllSettings(): Promise<Partial<SettingValue>> {
    const prisma = await getTenantPrisma()
    const settings = await prisma.vuConfiguracionSistema.findMany()
    const result: Partial<SettingValue> = { ...this.DEFAULTS }
    settings.forEach((s) => {
      result[s.clave as SettingKey] = s.valor as never
    })
    return result
  }

  /**
   * Upsert con validacion previa.
   */
  static async upsertSetting<K extends SettingKey>(
    key: K,
    value: SettingValue[K],
    userId: string,
    descripcion?: string,
  ): Promise<void> {
    this.validateSetting(key, value)
    const prisma = await getTenantPrisma()

    await prisma.vuConfiguracionSistema.upsert({
      where: { clave: key },
      create: {
        clave: key,
        valor: value as never,
        descripcion,
        actualizadoPorId: userId,
      },
      update: {
        valor: value as never,
        descripcion,
        actualizadoPorId: userId,
      },
    })
  }

  // ─── Validaciones ─────────────────────────────────────────────────────────

  static validateSetting<K extends SettingKey>(key: K, value: SettingValue[K]): void {
    switch (key) {
      case 'HOLIDAYS':
        this.validateHolidays(value as HolidayDate[])
        break
      case 'BUSINESS_HOURS':
        this.validateBusinessHours(value as BusinessHours)
        break
      case 'ATTENTION_DAYS':
        this.validateAttentionDays(value as string[])
        break
      case 'NOTIFICATION_FROM_EMAIL':
        this.validateEmail(value as string)
        break
      case 'MAX_CASE_LOAD':
        this.validateNumber(value as number, 1, 500)
        break
      case 'SLA_WARNING_THRESHOLD':
        this.validateNumber(value as number, 1, 100)
        break
      case 'AUTO_ASSIGNMENT_ENABLED':
        if (typeof value !== 'boolean') {
          throw new Error('AUTO_ASSIGNMENT_ENABLED debe ser booleano')
        }
        break
      case 'LEGAL_TEXTS':
        if (typeof value !== 'object' || value === null) {
          throw new Error('LEGAL_TEXTS debe ser un objeto')
        }
        break
      case 'NOTIFICATION_FROM_NAME':
      case 'INSTITUTION_NAME':
      case 'INSTITUTION_ADDRESS':
      case 'INSTITUTION_PHONE':
        if (typeof value !== 'string' || value.length === 0) {
          throw new Error(`${key} debe ser un string no vacio`)
        }
        break
      default:
        break
    }
  }

  private static validateHolidays(holidays: HolidayDate[]): void {
    if (!Array.isArray(holidays)) throw new Error('HOLIDAYS debe ser un array')
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    holidays.forEach((h, i) => {
      if (!h.date || !h.name) throw new Error(`Holiday ${i} incompleto`)
      if (!dateRegex.test(h.date)) throw new Error(`Fecha invalida en ${i} (YYYY-MM-DD)`)
      if (typeof h.isNational !== 'boolean') throw new Error(`isNational debe ser booleano en ${i}`)
    })
  }

  private static validateBusinessHours(hours: BusinessHours): void {
    const re = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!re.test(hours.start)) throw new Error('start debe ser HH:MM')
    if (!re.test(hours.end)) throw new Error('end debe ser HH:MM')
    const [sh, sm] = hours.start.split(':').map(Number)
    const [eh, em] = hours.end.split(':').map(Number)
    if (sh * 60 + sm >= eh * 60 + em) throw new Error('Hora de inicio debe ser menor que la de fin')
  }

  private static validateAttentionDays(days: string[]): void {
    const valid = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    if (!Array.isArray(days) || days.length === 0) throw new Error('ATTENTION_DAYS no puede estar vacio')
    days.forEach((d) => {
      if (!valid.includes(d)) throw new Error(`Dia invalido: ${d}`)
    })
  }

  private static validateEmail(email: string): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email invalido')
  }

  private static validateNumber(value: number, min: number, max: number): void {
    if (typeof value !== 'number' || isNaN(value)) throw new Error('Debe ser un numero')
    if (value < min || value > max) throw new Error(`Debe estar entre ${min} y ${max}`)
  }

  // ─── Calendario de negocio ────────────────────────────────────────────────

  static async getBusinessCalendar(): Promise<{
    holidays: Date[]
    businessHours: BusinessHours
    attentionDays: string[]
  }> {
    const [holidays, businessHours, attentionDays] = await Promise.all([
      this.getSetting('HOLIDAYS'),
      this.getSetting('BUSINESS_HOURS'),
      this.getSetting('ATTENTION_DAYS'),
    ])
    return {
      holidays: holidays.map((h) => new Date(h.date)),
      businessHours,
      attentionDays,
    }
  }

  /**
   * Indica si una fecha es dia habil segun calendario y festivos del tenant.
   */
  static async isBusinessDay(date: Date): Promise<boolean> {
    const calendar = await this.getBusinessCalendar()
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const dayName = dayNames[date.getDay()]
    if (!calendar.attentionDays.includes(dayName)) return false
    const dateStr = date.toISOString().split('T')[0]
    const isHoliday = calendar.holidays.some((h) => h.toISOString().split('T')[0] === dateStr)
    return !isHoliday
  }
}
