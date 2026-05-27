/**
 * cgc-cuentas.ts — Catálogo General de Cuentas (CGC) de la Contaduría General
 * de la Nación, Marco Normativo para Empresas que no Cotizan en el Mercado de
 * Valores y que no Captan ni Administran Ahorro del Público (Resolución
 * 414/2014 + modificatorias, actualizado con Res. 334/2025 y 343/2025).
 *
 * APLICABILIDAD en este proyecto:
 *   - SAE (Sociedad de Activos Especiales SAS) → Marco Empresas (414/2014) ✅
 *   - Otras entidades de gobierno territorial estricto (alcaldías, personerías
 *     puras) → Marco Entidades de Gobierno (Res. 533/2015) — pendiente de
 *     cargar como segundo catálogo opcional.
 *
 * El catálogo COMPLETO (3.745 cuentas: 9 clases + 44 grupos + 359 cuentas +
 * 3333 subcuentas) vive en `cgc-cuentas.generated.ts`, parseado directamente
 * del PDF oficial de la CGN. Este archivo (`cgc-cuentas.ts`) sólo expone:
 *   - El tipo `CuentaCgc`
 *   - El array `CGC_CUENTAS` re-exportado del generado
 *   - La función `seedCgc(prisma)` que siembra la BD del tenant idempotentemente
 *
 * Estructura del código contable (CGN): X-X-XX-XX (6 dígitos máx)
 *   nivel 1 (1 díg) → Clase
 *   nivel 2 (2 díg) → Grupo
 *   nivel 3 (4 díg) → Cuenta
 *   nivel 4 (6 díg) → Subcuenta (hoja típica — permiteMovimientos=true)
 * Cuentas/grupos sin subcuentas hijas también son hoja.
 *
 * NO EDITAR los códigos a mano. Para actualizar el catálogo cuando la CGN
 * emita nuevas resoluciones, reemplazar el PDF en `docs/` y volver a correr
 * `python scripts/parse-cgc-pdf.py`.
 */

export type CuentaCgc = {
  codigo: string
  nombre: string
  nivel: 1 | 2 | 3 | 4 | 5
  naturaleza: "DEBITO" | "CREDITO"
  tipo: "BALANCE" | "RESULTADO" | "ORDEN"
  permiteMovimientos: boolean
  parent?: string
}

import { CGC_CUENTAS_OFICIAL } from "./cgc-cuentas.generated"

/** Catálogo CGC oficial completo (3.745 cuentas) — fuente: PDF CGN. */
export const CGC_CUENTAS: CuentaCgc[] = CGC_CUENTAS_OFICIAL

/**
 * Siembra el CGC en el cliente Prisma dado (la BD del tenant). Idempotente:
 * upsert por `codigo`. Resuelve `parentId` por pasadas hasta cerrar el grafo.
 */
export async function seedCgc(prisma: any): Promise<{ total: number; pasadas: number }> {
  const idsPorCodigo = new Map<string, string>()
  const pendientes = [...CGC_CUENTAS]
  let pasadas = 0

  while (pendientes.length) {
    pasadas++
    const ahora = pendientes.filter(c => !c.parent || idsPorCodigo.has(c.parent))
    if (!ahora.length) {
      throw new Error(`CGC: cuentas con parent inexistente: ${pendientes.map(p => p.codigo).slice(0, 10).join(", ")}…`)
    }
    for (const c of ahora) {
      const parentId = c.parent ? idsPorCodigo.get(c.parent) ?? null : null
      const data = {
        nombre: c.nombre,
        nivel: c.nivel,
        naturaleza: c.naturaleza,
        tipo: c.tipo,
        permiteMovimientos: c.permiteMovimientos,
        parentId,
      }
      const saved = await prisma.cpPlanCuenta.upsert({
        where: { codigo: c.codigo },
        create: { codigo: c.codigo, ...data },
        update: data,
      })
      idsPorCodigo.set(c.codigo, saved.id)
    }
    for (const c of ahora) {
      const idx = pendientes.indexOf(c)
      if (idx >= 0) pendientes.splice(idx, 1)
    }
  }
  return { total: idsPorCodigo.size, pasadas }
}
