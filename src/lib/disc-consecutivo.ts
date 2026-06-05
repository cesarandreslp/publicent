/**
 * disc-consecutivo.ts — Consecutivos atómicos del módulo Función Disciplinaria.
 *
 * Numeración por tenant + año, reiniciada cada año, atómica vía upsert sobre
 * DiscConsecutivo (mismo patrón que gd-consecutivo.ts):
 *   - Proceso:  "001-2026-P"
 *   - Tutela:   "T-001-2026"
 *   - Visita:   "VP-001-2026"
 */

import { getTenantPrisma, getTenantId } from "@/lib/tenant"

type Serie = "P" | "T" | "VP"

async function siguienteConsecutivo(serie: Serie, anio: number): Promise<number> {
  const prisma = await getTenantPrisma()
  const tenantId = await getTenantId()

  const record = await prisma.$transaction(async (tx) => {
    return tx.discConsecutivo.upsert({
      where: { tenantId_anio_serie: { tenantId, anio, serie } },
      create: { tenantId, anio, serie, ultimo: 1 },
      update: { ultimo: { increment: 1 } },
    })
  })

  return record.ultimo
}

/** Genera "001-2026-P". */
export async function generarNumeroProceso(anio: number = new Date().getFullYear()): Promise<string> {
  const n = await siguienteConsecutivo("P", anio)
  return `${String(n).padStart(3, "0")}-${anio}-P`
}

/** Genera "T-001-2026". */
export async function generarNumeroTutela(anio: number = new Date().getFullYear()): Promise<string> {
  const n = await siguienteConsecutivo("T", anio)
  return `T-${String(n).padStart(3, "0")}-${anio}`
}

/** Genera "VP-001-2026". */
export async function generarNumeroVisita(anio: number = new Date().getFullYear()): Promise<string> {
  const n = await siguienteConsecutivo("VP", anio)
  return `VP-${String(n).padStart(3, "0")}-${anio}`
}
