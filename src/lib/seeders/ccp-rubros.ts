/**
 * ccp-rubros.ts — Catálogo de Clasificación Presupuestal CCPET — CCPET es el
 * "Catálogo de Clasificación Presupuestal para Entidades Territoriales y sus
 * Descentralizadas", emitido por el Ministerio de Hacienda y Crédito Público
 * a través de la Dirección General de Apoyo Fiscal Territorial.
 *
 * Normativa vigente: Resolución 3832/2019 + 2662/2023 y modificatorias.
 * Versión 8 (actual al momento de la última descarga).
 *
 * Aplica a:
 *   - Alcaldías y gobernaciones
 *   - Personerías y contralorías municipales
 *   - Entes descentralizados del orden territorial
 *
 * Estructura del código (jerarquía hasta 10 niveles):
 *   1               (Agregado: Ingresos / Gastos)
 *   1.1             (Grupo)
 *   1.1.01          (Subgrupo)
 *   1.1.01.01       (Concepto)
 *   1.1.01.01.014   (Subconcepto)
 *   1.1.01.01.014.01 (Item)
 *   …                (hasta 10 segmentos en algunos rubros tributarios)
 *
 * El catálogo COMPLETO (oficial) vive en `ccp-rubros.generated.ts`, parseado
 * directamente de los anexos XLSX de MinHacienda. Este archivo expone:
 *   - El tipo `RubroCcp` (acepta nivel 1..10)
 *   - El array `CCP_RUBROS` re-exportado del generado
 *   - La función `seedCcp(prisma)` que siembra idempotentemente
 *
 * Para actualizar: bajar nuevamente los anexos 1A y 2A de MinHacienda
 * (https://www.minhacienda.gov.co/apoyo-fiscal-territorial/.../ccpet-cuipo)
 * a `docs/ccpet/ccpet_ingresos_territoriales.xlsx` y
 * `docs/ccpet/ccpet_gastos_territoriales.xlsx`, luego correr:
 *   python scripts/parse-ccpet-xlsx.py
 */

export type RubroCcp = {
  codigo: string
  nombre: string
  tipo: "GASTO" | "INGRESO"
  nivel: number  // 1..10 (CCPET tiene rubros tributarios de hasta 10 niveles)
  permiteMovimientos: boolean
  parent?: string
}

import { CCP_RUBROS_OFICIAL } from "./ccp-rubros.generated"

/** Catálogo CCPET oficial completo — fuente: anexos XLSX de MinHacienda. */
export const CCP_RUBROS: RubroCcp[] = CCP_RUBROS_OFICIAL

/**
 * Siembra el CCPET en el cliente Prisma dado. Idempotente: upsert por
 * `codigo`. Resuelve `parentId` por pasadas hasta cerrar el grafo.
 */
export async function seedCcp(prisma: any): Promise<{ total: number; pasadas: number }> {
  const idsPorCodigo = new Map<string, string>()
  const pendientes = [...CCP_RUBROS]
  let pasadas = 0

  while (pendientes.length) {
    pasadas++
    const ahora = pendientes.filter(c => !c.parent || idsPorCodigo.has(c.parent))
    if (!ahora.length) {
      throw new Error(`CCP: rubros con parent inexistente: ${pendientes.map(p => p.codigo).slice(0, 10).join(", ")}…`)
    }
    for (const c of ahora) {
      const parentId = c.parent ? idsPorCodigo.get(c.parent) ?? null : null
      const data = {
        nombre: c.nombre,
        tipo: c.tipo,
        nivel: c.nivel,
        permiteMovimientos: c.permiteMovimientos,
        parentId,
      }
      const saved = await prisma.psuRubro.upsert({
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
