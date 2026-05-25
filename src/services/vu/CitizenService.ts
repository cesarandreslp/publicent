/**
 * VU - Citizen Service
 *
 * En ventanilla_unica_base el ciudadano es un modelo (Citizen). En personeriabuga
 * los datos del ciudadano viven embebidos en cada PQRS (nombreSolicitante,
 * tipoDocumento, numeroDocumento, email, telefono, direccion, municipio).
 *
 * Este servicio opera sobre el modelo PQRS conservando la API del servicio
 * original. "Citizen" es una vista virtual extraida de los PQRS.
 *
 * Implicaciones:
 *  - create() no inserta una fila Citizen — solo valida y devuelve la estructura
 *    para que el caller la use al crear el PQRS.
 *  - findOrCreate() devuelve el "ciudadano" reconstruido a partir del PQRS mas
 *    reciente que tenga ese documento; si no existe, devuelve la estructura
 *    nueva como isNew=true.
 *  - updateContact() actualiza los datos en TODOS los PQRS del ciudadano.
 *  - updateDataConsent() es no-op (no se almacena consentimiento por
 *    ciudadano todavia; agregar campo dedicado si se requiere).
 *  - getCases() devuelve los PQRS de un documento.
 */

import { getTenantPrisma } from '@/lib/tenant'

export interface CreateCitizenInput {
  tenantId?: string  // ignorado (per-tenant DB)
  documentType: string
  documentNumber: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  neighborhood?: string
  city?: string
  department?: string
  dataConsent: boolean
  dataConsentDate: Date
  dataConsentIp: string
  isAnonymous?: boolean
}

export interface CitizenView {
  id: string                // documento como id virtual
  documentType: string
  documentNumber: string
  firstName: string
  firstLastName: string
  email?: string | null
  phone?: string | null
  address?: string | null
  neighborhood?: string | null
  city?: string | null
  department?: string | null
  isAnonymous: boolean
  dataConsent: boolean
  dataConsentDate?: Date | null
}

export interface FindOrCreateResult {
  citizen: CitizenView
  isNew: boolean
}

function virtualId(documentType: string, documentNumber: string): string {
  return `${documentType}:${documentNumber}`
}

function pqrsToCitizen(p: {
  tipoDocumento: string
  numeroDocumento: string
  nombreSolicitante: string
  email: string
  telefono: string | null
  direccion: string | null
  municipio: string | null
  anonimo: boolean
}): CitizenView {
  const [firstName, ...rest] = (p.nombreSolicitante || '').split(' ')
  const firstLastName = rest.join(' ').trim()
  return {
    id: virtualId(p.tipoDocumento, p.numeroDocumento),
    documentType: p.tipoDocumento,
    documentNumber: p.numeroDocumento,
    firstName: firstName || '',
    firstLastName,
    email: p.email,
    phone: p.telefono,
    address: p.direccion,
    neighborhood: null,
    city: p.municipio,
    department: null,
    isAnonymous: p.anonimo,
    dataConsent: true,  // implicito al radicar
    dataConsentDate: null,
  }
}

export class CitizenService {
  /**
   * Busca el PQRS mas reciente con ese documento y devuelve los datos del
   * solicitante como CitizenView. Si no hay coincidencia, devuelve null.
   */
  async findByDocument(documentType: string, documentNumber: string): Promise<CitizenView | null> {
    const prisma = await getTenantPrisma()
    const p = await prisma.pQRS.findFirst({
      where: { tipoDocumento: documentType, numeroDocumento: documentNumber },
      orderBy: { createdAt: 'desc' },
      select: {
        tipoDocumento: true, numeroDocumento: true, nombreSolicitante: true,
        email: true, telefono: true, direccion: true, municipio: true, anonimo: true,
      },
    })
    return p ? pqrsToCitizen(p) : null
  }

  async findByEmail(email: string): Promise<CitizenView | null> {
    const prisma = await getTenantPrisma()
    const p = await prisma.pQRS.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
      select: {
        tipoDocumento: true, numeroDocumento: true, nombreSolicitante: true,
        email: true, telefono: true, direccion: true, municipio: true, anonimo: true,
      },
    })
    return p ? pqrsToCitizen(p) : null
  }

  /**
   * No persiste; valida y devuelve la estructura del ciudadano para
   * adjuntarla a un PQRS al momento de crearlo.
   */
  async create(input: CreateCitizenInput): Promise<CitizenView> {
    if (!this.validateDocumentType(input.documentType)) {
      throw new Error(`Tipo de documento invalido: ${input.documentType}`)
    }
    return {
      id: virtualId(input.documentType, input.documentNumber),
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      firstName: input.firstName,
      firstLastName: input.lastName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      neighborhood: input.neighborhood,
      city: input.city,
      department: input.department,
      isAnonymous: input.isAnonymous ?? false,
      dataConsent: input.dataConsent,
      dataConsentDate: input.dataConsentDate,
    }
  }

  /**
   * Devuelve datos del ciudadano (de un PQRS previo) o la estructura nueva.
   */
  async findOrCreate(input: CreateCitizenInput): Promise<FindOrCreateResult> {
    if (input.isAnonymous) {
      return { citizen: await this.create(input), isNew: true }
    }

    const byDoc = await this.findByDocument(input.documentType, input.documentNumber)
    if (byDoc) return { citizen: byDoc, isNew: false }

    if (input.email) {
      const byEmail = await this.findByEmail(input.email)
      if (byEmail) return { citizen: byEmail, isNew: false }
    }

    return { citizen: await this.create(input), isNew: true }
  }

  /**
   * Actualiza datos de contacto en TODOS los PQRS del documento dado.
   */
  async updateContact(
    citizenId: string,
    data: {
      email?: string
      phone?: string
      address?: string
      city?: string
    },
  ): Promise<{ count: number }> {
    const [documentType, documentNumber] = citizenId.split(':')
    if (!documentType || !documentNumber) return { count: 0 }
    const prisma = await getTenantPrisma()
    const result = await prisma.pQRS.updateMany({
      where: { tipoDocumento: documentType, numeroDocumento: documentNumber },
      data: {
        email: data.email,
        telefono: data.phone,
        direccion: data.address,
        municipio: data.city,
      },
    })
    return { count: result.count }
  }

  /**
   * No-op: el consentimiento se asume al radicar el PQRS. Reservado para
   * cuando exista un campo dedicado.
   */
  async updateDataConsent(_citizenId: string): Promise<void> {
    return
  }

  /**
   * Casos (PQRS) de un ciudadano identificado por documento.
   */
  async getCases(citizenId: string) {
    const [documentType, documentNumber] = citizenId.split(':')
    if (!documentType || !documentNumber) return []
    const prisma = await getTenantPrisma()
    return prisma.pQRS.findMany({
      where: { tipoDocumento: documentType, numeroDocumento: documentNumber },
      orderBy: { createdAt: 'desc' },
    })
  }

  validateDocumentType(type: string): boolean {
    return ['CC', 'TI', 'CE', 'PA', 'RC', 'NIT'].includes(type)
  }

  /**
   * Determina prioridad por criterios constitucionales colombianos.
   */
  determinePriority(data: {
    age?: number
    isMinor?: boolean
    isElderly?: boolean
    hasDisability?: boolean
    isVictim?: boolean
    isPregnant?: boolean
  }): { isPriority: boolean; reason?: string } {
    const reasons: string[] = []
    if (data.isMinor || (data.age != null && data.age < 18))   reasons.push('Menor de edad (Art. 44 CP)')
    if (data.isElderly || (data.age != null && data.age >= 60)) reasons.push('Adulto mayor (Art. 46 CP)')
    if (data.hasDisability) reasons.push('Persona con discapacidad (Art. 47 CP)')
    if (data.isVictim)      reasons.push('Victima del conflicto (Ley 1448/2011)')
    if (data.isPregnant)    reasons.push('Mujer gestante (Art. 43 CP)')
    return { isPriority: reasons.length > 0, reason: reasons.length > 0 ? reasons.join(', ') : undefined }
  }
}

export const citizenService = new CitizenService()
