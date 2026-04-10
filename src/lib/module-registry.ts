/**
 * module-registry.ts — Re-exportaciones para compatibilidad
 *
 * La fuente de verdad de la lógica de módulos vive en:
 *  - src/lib/modules.ts          → tipos, helpers, catálogo
 *  - src/lib/tenant.ts           → acceso al tenant actual (getTenantModulos, isTenantModuleActive)
 *
 * Este archivo re-exporta lo necesario para que imports existentes sigan funcionando.
 */

export {
  MODULO_IDS,
  MODULOS_DEFAULT,
  MODULOS_CATALOGO,
  resolveModulosConfig,
  isModuleActive,
  getVentanillaConfig,
  getGestionDocumentalConfig,
  type ModuloId,
  type ModulosConfig,
  type ConfigVentanillaUnica,
  type ConfigGestionDocumental,
} from './modules'

export {
  getTenantModulos,
  isTenantModuleActive,
} from './tenant'

/**
 * Helper: retorna la URL pública de PQRS según el módulo activo del tenant.
 * Usa la config de módulos ya resuelta (no hace lookups adicionales).
 */
import { isModuleActive as _isActive, MODULO_IDS as _MODULO_IDS } from './modules'
import type { ModulosConfig as _ModulosConfig } from './modules'

export function getDocumentalUrl(modulos: _ModulosConfig): string | null {
  if (_isActive(modulos, _MODULO_IDS.GESTION_DOCUMENTAL)) {
    return '/gestor-documental'
  }
  return null
}
