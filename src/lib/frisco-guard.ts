/**
 * frisco-guard.ts — Helpers compartidos por las rutas del módulo FRISCO.
 *
 * Cada endpoint del módulo (bienes / depositarios / contratos / destinación)
 * debe pasar por estas verificaciones antes de tocar la BD del tenant.
 */

import { NextResponse } from "next/server"
import { checkApiRoles } from "@/lib/authorization"
import { isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER'

/**
 * Verifica que (1) el módulo indicado esté activo en el tenant actual y
 * (2) el usuario tenga uno de los roles indicados. Si falla devuelve la
 * respuesta lista para `return` desde la ruta.
 */
async function requireModule(
  moduloId: (typeof MODULO_IDS)[keyof typeof MODULO_IDS],
  nombre: string,
  roles: Role[]
) {
  if (!(await isTenantModuleActive(moduloId))) {
    return {
      error: NextResponse.json(
        { error: `Módulo ${nombre} no habilitado para este tenant` },
        { status: 404 }
      ),
      user: null,
    } as const
  }

  const { error, user } = await checkApiRoles(roles)
  if (error) return { error, user: null } as const
  return { error: null, user } as const
}

/** Gate para endpoints del módulo `frisco_bienes`. */
export function requireFrisco(roles: Role[]) {
  return requireModule(MODULO_IDS.FRISCO_BIENES, "FRISCO", roles)
}

/** Gate para endpoints del módulo `frisco_interop`. */
export function requireFriscoInterop(roles: Role[]) {
  return requireModule(MODULO_IDS.FRISCO_INTEROP, "FRISCO Interoperabilidad", roles)
}

/** Gate para endpoints admin del portal externo (módulo `portal_externo`). */
export function requirePortalExterno(roles: Role[]) {
  return requireModule(MODULO_IDS.PORTAL_EXTERNO, "Portal externo", roles)
}

/** Gate para endpoints admin de contabilidad pública (módulo `contabilidad_publica`). */
export function requireContabilidad(roles: Role[]) {
  return requireModule(MODULO_IDS.CONTABILIDAD_PUBLICA, "Contabilidad pública", roles)
}

/** Gate para endpoints admin de ejecución presupuestal (módulo `presupuesto_ejecucion`). */
export function requirePresupuesto(roles: Role[]) {
  return requireModule(MODULO_IDS.PRESUPUESTO_EJECUCION, "Ejecución presupuestal", roles)
}
