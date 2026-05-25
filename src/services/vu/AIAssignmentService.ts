/**
 * VU - AI Assignment Service
 *
 * Asignacion automatica de PQRS al funcionario mas apropiado segun el
 * cargo/especialidad usando IA (Groq + LLaMA 3.3).
 *
 * Adaptaciones respecto a ventanilla_unica_base:
 *  - User.position -> Usuario.cargo (texto en personeriabuga)
 *  - Role.level/Role.code -> Rol.nombre (sin nivel jerarquico explicito;
 *    se usa array de roles "elegibles" y "Director" como fallback)
 *  - User.maxCaseLoad -> no existe; se usa MAX_CASE_LOAD por env
 *  - Assignments count -> count VuAsignacionFuncionario ACTIVA
 *  - tenantSettings.groqApiKey -> GROQ_API_KEY env (o lib/groq-client)
 *  - autoAssignCase: omite la pre-notificacion a Ventanilla Unica
 *    (puede agregarse despues como hook). Notifica al funcionario asignado
 *    via NotificationHooks.onCaseAssigned.
 */

import { getTenantPrisma } from '@/lib/tenant'
import { assignmentService } from './AssignmentService'
import { NotificationHooks } from './NotificationHooks'

const MAX_CASE_LOAD_DEFAULT = parseInt(process.env.VU_MAX_CASE_LOAD || '50', 10)
const ELIGIBLE_ROLES = ['FUNCIONARIO', 'DIRECTOR']
const FALLBACK_ROLE = 'DIRECTOR'
const MODEL = 'llama-3.3-70b-versatile'
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

/**
 * Llama directamente al endpoint OpenAI-compatible de Groq (sin SDK)
 * para evitar dependencias adicionales. Si en el futuro se quiere migrar
 * a groq-sdk, basta reemplazar esta funcion.
 */
async function callGroqJSON(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY no configurada')

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`)
  }
  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const content = json.choices?.[0]?.message?.content
  if (!content) throw new Error('Sin contenido en respuesta de Groq')
  return content
}

export interface AIAnalysisResult {
  recommendedUserType: string
  recommendedUserId?: string
  confidence: number
  reasoning: string
  matchedKeywords: string[]
  alternativeUserTypes?: Array<{ userType: string; confidence: number }>
}

interface UserTypeInfo {
  userId: string
  email: string
  fullName: string
  roleName: string
  userType: string                 // cargo del funcionario
  userTypeDescription: string
  currentCaseLoad: number
  maxCaseLoad: number
}

export class AIAssignmentService {
  /**
   * Lista de funcionarios elegibles para recibir asignacion via IA.
   */
  private async getAvailableFuncionarios(): Promise<UserTypeInfo[]> {
    const prisma = await getTenantPrisma()
    const users = await prisma.usuario.findMany({
      where: {
        activo: true,
        rol: { nombre: { in: ELIGIBLE_ROLES } },
      },
      include: {
        rol: true,
        vuAsignacionesComoFuncionario: { where: { estado: 'ACTIVA' } },
      },
      orderBy: [{ nombre: 'asc' }],
    })

    return users
      .filter((u) => !!u.cargo || u.rol?.nombre === FALLBACK_ROLE)
      .map((u) => {
        const cargo = u.cargo || u.rol?.nombre || 'Funcionario'
        return {
          userId: u.id,
          email: u.email,
          fullName: `${u.nombre} ${u.apellido}`.trim(),
          roleName: u.rol?.nombre || '',
          userType: cargo,
          userTypeDescription: cargo,
          currentCaseLoad: u.vuAsignacionesComoFuncionario.length,
          maxCaseLoad: MAX_CASE_LOAD_DEFAULT,
        }
      })
  }

  /**
   * Pide a la IA el cargo recomendado y resuelve al usuario concreto.
   */
  async analyzeCase(caseData: {
    subject: string
    description: string
    caseType?: string
    excludeUserId?: string
  }): Promise<AIAnalysisResult> {
    let candidates = await this.getAvailableFuncionarios()
    if (caseData.excludeUserId) {
      candidates = candidates.filter((c) => c.userId !== caseData.excludeUserId)
    }
    if (candidates.length === 0) {
      throw new Error('No hay funcionarios disponibles para asignacion')
    }

    const systemPrompt = this.buildSystemPrompt(candidates)
    const userPrompt = this.buildUserPrompt(caseData)

    const raw = await callGroqJSON(systemPrompt, userPrompt)
    const analysis = JSON.parse(raw) as {
      recommendedUserType?: string
      confidence?: number
      reasoning?: string
      matchedKeywords?: string[]
      alternativeUserTypes?: Array<{ userType: string; confidence: number }>
    }

    const match = candidates.find((c) => c.userType === analysis.recommendedUserType)

    const fallbackToDirector = (reason: string): AIAnalysisResult => {
      const director = candidates.find((c) => c.roleName === FALLBACK_ROLE)
      if (!director) {
        throw new Error(`Cargo recomendado no disponible y sin Director: ${reason}`)
      }
      return {
        recommendedUserType: director.userType,
        recommendedUserId: director.userId,
        confidence: 0.7,
        reasoning: `${reason} Asignando al Director como autoridad principal.`,
        matchedKeywords: analysis.matchedKeywords ?? [],
        alternativeUserTypes: [],
      }
    }

    if (!match) {
      return fallbackToDirector(`Cargo ${analysis.recommendedUserType ?? '(vacio)'} no encontrado.`)
    }

    // Verificar que el funcionario sigue activo y mantiene su cargo
    const prisma = await getTenantPrisma()
    const verified = await prisma.usuario.findFirst({
      where: { id: match.userId, activo: true, cargo: match.userType },
    })
    if (!verified) {
      return fallbackToDirector(`El funcionario ${match.fullName} ya no esta disponible.`)
    }

    return {
      recommendedUserType: match.userType,
      recommendedUserId: verified.id,
      confidence: analysis.confidence ?? 0.8,
      reasoning: analysis.reasoning ?? '',
      matchedKeywords: analysis.matchedKeywords ?? [],
      alternativeUserTypes: analysis.alternativeUserTypes ?? [],
    }
  }

  /**
   * Analiza + asigna + notifica.
   */
  async autoAssignCase(params: {
    caseId: string                 // pqrsId
    aiUserId: string               // userId que dispara la asignacion automatica
    aiUserEmail: string
    ipAddress?: string
    userAgent?: string
  }): Promise<{
    success: boolean
    analysis?: AIAnalysisResult
    assignment?: { id: string; caseId: string; userId: string; assignedAt: Date; isReassignment: boolean }
    error?: string
  }> {
    try {
      const prisma = await getTenantPrisma()
      const pqrs = await prisma.pQRS.findUnique({ where: { id: params.caseId } })
      if (!pqrs) return { success: false, error: 'PQRS no encontrado' }

      const analysis = await this.analyzeCase({
        subject: pqrs.asunto,
        description: pqrs.descripcion ?? '',
        caseType: pqrs.tipo,
      })

      if (!analysis.recommendedUserId) {
        return { success: false, error: `No se pudo determinar usuario: ${analysis.recommendedUserType}`, analysis }
      }

      const target = await prisma.usuario.findUnique({
        where: { id: analysis.recommendedUserId },
      })
      if (!target || !target.activo) {
        return { success: false, error: `Usuario recomendado no esta disponible`, analysis }
      }

      const result = await assignmentService.assignCase({
        caseId: params.caseId,
        newAssigneeId: target.id,
        assignedByUserId: params.aiUserId,
        assignedByEmail: params.aiUserEmail,
        assignedByRole: 'ASIGNACION_DE_CASOS',
        reason: `Asignacion automatica por IA al cargo "${analysis.recommendedUserType}". ${analysis.reasoning} Confianza: ${(analysis.confidence * 100).toFixed(0)}%`,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      })

      if (!result.success) return { success: false, error: result.error, analysis }

      // Notificacion (no critica)
      try {
        await NotificationHooks.onCaseAssigned({
          caseId: params.caseId,
          filingNumber: pqrs.radicado,
          userId: target.id,
          userName: `${target.nombre} ${target.apellido}`.trim() || target.email,
          userEmail: target.email,
          citizenName: pqrs.nombreSolicitante || 'Ciudadano',
          caseType: pqrs.tipo,
          dueDate: pqrs.fechaVencimiento ?? new Date(Date.now() + 15 * 86_400_000),
        })
      } catch (notifError) {
        console.error('[VU/AIAssignment] notif no critica fallo:', notifError)
      }

      return { success: true, analysis, assignment: result.assignment }
    } catch (error) {
      console.error('[VU/AIAssignment] error en auto-asignacion:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  // ─── Prompts ─────────────────────────────────────────────────────────────

  private buildSystemPrompt(candidates: UserTypeInfo[]): string {
    const director = candidates.find((c) => c.roleName === FALLBACK_ROLE)
    const info = candidates.map((c) => {
      const priority = c.roleName === FALLBACK_ROLE
        ? 'MAXIMA AUTORIDAD - Director (fallback para casos complejos)'
        : `Especialista (carga actual ${c.currentCaseLoad}/${c.maxCaseLoad})`
      return `**${c.userType}**\nFuncionario: ${c.fullName}\nRol: ${c.roleName}\nPrioridad: ${priority}\n`
    }).join('\n')

    return [
      'Eres un asistente experto en clasificacion de solicitudes ciudadanas (PQRS) ',
      'colombianas para asignacion a funcionarios segun su cargo/especialidad.',
      '',
      'FUNCIONARIOS DISPONIBLES:',
      info,
      '',
      director
        ? `Si ningun cargo encaja claramente, usa "${director.userType}" como fallback.`
        : 'No hay Director registrado, elige el cargo mas pertinente.',
      '',
      'Responde SOLO en JSON con esta forma:',
      `{
  "recommendedUserType": "<cargo exacto del listado>",
  "confidence": 0.0-1.0,
  "reasoning": "explicacion corta",
  "matchedKeywords": ["palabra1", "palabra2"],
  "alternativeUserTypes": [{ "userType": "...", "confidence": 0.0-1.0 }]
}`,
    ].join('\n')
  }

  private buildUserPrompt(caseData: { subject: string; description: string; caseType?: string }): string {
    return [
      `Tipo de PQRS: ${caseData.caseType ?? '(no especificado)'}`,
      `Asunto: ${caseData.subject}`,
      `Descripcion:`,
      caseData.description,
    ].join('\n')
  }
}

export const aiAssignmentService = new AIAssignmentService()
