/**
 * VU - State Machine Service
 *
 * Maquina de estados del modulo Ventanilla Unica sobre el enum EstadoPQRS.
 *
 * Equivalencias respecto a ventanilla_unica_base (CaseState como modelo):
 *   RADICADO              -> RECIBIDA
 *   EN_ESTUDIO            -> EN_TRAMITE
 *   REQUIERE_INFORMACION  -> EN_REVISION
 *   RESUELTO              -> RESPONDIDA
 *   CERRADO               -> CERRADA
 *   (nuevo)               -> ANULADA  (estado final por revocacion)
 *
 * Roles (segun CLAUDE.md de ventanilla_unica_base):
 *   ADMIN, DIRECTOR, ASIGNACION_DE_CASOS, FUNCIONARIO, VENTANILLA_UNICA,
 *   AUXILIAR_ATENCION_USUARIO. DIRECTOR es el rol "supervisor".
 */

import { EstadoPQRS } from '@prisma/client'

export type StateCode = EstadoPQRS

export const ROLES = {
  ADMIN: 'ADMIN',
  DIRECTOR: 'DIRECTOR',
  ASIGNACION_DE_CASOS: 'ASIGNACION_DE_CASOS',
  FUNCIONARIO: 'FUNCIONARIO',
  VENTANILLA_UNICA: 'VENTANILLA_UNICA',
  AUXILIAR_ATENCION_USUARIO: 'AUXILIAR_ATENCION_USUARIO',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

const FINAL_STATES: StateCode[] = [EstadoPQRS.CERRADA, EstadoPQRS.ANULADA]
const INITIAL_STATES: StateCode[] = [EstadoPQRS.RECIBIDA]

/** Transiciones permitidas: estado -> [siguientes]. CERRADA/ANULADA son finales. */
const TRANSITIONS: Record<StateCode, StateCode[]> = {
  RECIBIDA:    [EstadoPQRS.EN_TRAMITE, EstadoPQRS.ANULADA],
  EN_TRAMITE:  [EstadoPQRS.EN_REVISION, EstadoPQRS.RESPONDIDA, EstadoPQRS.CERRADA],
  EN_REVISION: [EstadoPQRS.EN_TRAMITE, EstadoPQRS.RESPONDIDA, EstadoPQRS.CERRADA],
  RESPONDIDA:  [EstadoPQRS.CERRADA, EstadoPQRS.EN_TRAMITE],
  CERRADA:     [],
  ANULADA:     [],
}

const SUPERVISOR_ONLY_TRANSITIONS: Array<{ from: StateCode; to: StateCode }> = [
  // Reapertura de un caso cerrado solo por el Director.
  { from: EstadoPQRS.CERRADA, to: EstadoPQRS.EN_TRAMITE },
  // Anulacion desde EN_TRAMITE (no es transicion normal).
  { from: EstadoPQRS.EN_TRAMITE, to: EstadoPQRS.ANULADA },
]

const REQUIRE_COMMENT: StateCode[] = [EstadoPQRS.EN_REVISION, EstadoPQRS.CERRADA, EstadoPQRS.ANULADA]

const SUPERVISOR_ROLES: Role[] = [ROLES.ADMIN, ROLES.DIRECTOR]

export interface TransitionValidation {
  valid: boolean
  error?: string
  requiresComment?: boolean
  requiresSupervisor?: boolean
}

export interface TransitionRequest {
  currentState: StateCode
  targetState: StateCode
  userRole: Role
  comment?: string
}

export class StateMachineService {
  /**
   * Valida una transicion de estado.
   */
  validateTransition(req: TransitionRequest): TransitionValidation {
    const { currentState, targetState, userRole, comment } = req

    // 1. Estado actual final
    if (FINAL_STATES.includes(currentState) && !SUPERVISOR_ROLES.includes(userRole)) {
      return {
        valid: false,
        error: 'Los casos cerrados o anulados no pueden modificarse. Contacte un supervisor.',
      }
    }

    // 2. Transicion permitida
    const allowed = TRANSITIONS[currentState] || []
    if (!allowed.includes(targetState)) {
      return { valid: false, error: `No se permite pasar de ${currentState} a ${targetState}` }
    }

    // 3. Transicion supervisor-only
    const requiresSupervisor = SUPERVISOR_ONLY_TRANSITIONS.some(
      (t) => t.from === currentState && t.to === targetState,
    )
    if (requiresSupervisor && !SUPERVISOR_ROLES.includes(userRole)) {
      return {
        valid: false,
        error: 'Esta transicion requiere rol Director o Admin',
        requiresSupervisor: true,
      }
    }

    // 4. Comentario obligatorio
    const requiresComment = REQUIRE_COMMENT.includes(targetState)
    if (requiresComment && !comment?.trim()) {
      return {
        valid: false,
        error: `El estado ${targetState} requiere un comentario explicativo`,
        requiresComment: true,
      }
    }

    return { valid: true, requiresComment, requiresSupervisor }
  }

  /**
   * Estados disponibles a partir del estado actual y rol del usuario.
   * No consulta BD: los estados son enum estatico.
   */
  async getAvailableStates(currentStateCode: StateCode, userRole: Role): Promise<{
    states: Array<{
      code: StateCode
      name: string
      requiresComment: boolean
      requiresSupervisor: boolean
    }>
  }> {
    if (FINAL_STATES.includes(currentStateCode) && !SUPERVISOR_ROLES.includes(userRole)) {
      return { states: [] }
    }
    const allowed = TRANSITIONS[currentStateCode] || []
    return {
      states: allowed.map((code) => ({
        code,
        name: code,
        requiresComment: REQUIRE_COMMENT.includes(code),
        requiresSupervisor: SUPERVISOR_ONLY_TRANSITIONS.some(
          (t) => t.from === currentStateCode && t.to === code,
        ),
      })),
    }
  }

  isFinalState(stateCode: StateCode): boolean   { return FINAL_STATES.includes(stateCode) }
  isInitialState(stateCode: StateCode): boolean { return INITIAL_STATES.includes(stateCode) }

  getStateMachineInfo() {
    return {
      states: Object.values(EstadoPQRS),
      finalStates: FINAL_STATES,
      initialStates: INITIAL_STATES,
      transitions: TRANSITIONS,
      supervisorOnlyTransitions: SUPERVISOR_ONLY_TRANSITIONS,
      requireComment: REQUIRE_COMMENT,
    }
  }
}

export const stateMachineService = new StateMachineService()
