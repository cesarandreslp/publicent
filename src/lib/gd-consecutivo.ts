/**
 * Motor de Consecutivo Oficial AGN
 * Genera el número de radicado según el estándar:  YYYY-COD-TIPO-NNNNN
 * Ejemplo: 2026-PERS-ENT-00123
 *
 * Usa una transacción atómica para garantizar que no haya duplicados
 * incluso con múltiples peticiones concurrentes.
 */

import { GdTipoRadicado } from "@prisma/client"
import { getTenantPrisma } from "@/lib/tenant"

const TIPO_SIGLA: Record<GdTipoRadicado, string> = {
  ENTRADA:    "ENT",
  SALIDA:     "SAL",
  INTERNO:    "INT",
  PQRS:       "PQR",
  RESOLUCION: "RES",
  COMUNICADO: "COM",
}

export async function generarNumeroRadicado(
  tipo: GdTipoRadicado,
  codigoDependencia: string
): Promise<string> {
  const prisma = await getTenantPrisma()
  const anio = new Date().getFullYear()
  const sigla = TIPO_SIGLA[tipo]

  // Operación atómica: incrementar el consecutivo y retornar el nuevo valor
  const consecutivo = await prisma.$transaction(async (tx) => {
    const record = await tx.gdConsecutivo.upsert({
      where: {
        anio_tipo_codigoDep: { anio, tipo, codigoDep: codigoDependencia },
      },
      create: { anio, tipo, codigoDep: codigoDependencia, ultimo: 1 },
      update: { ultimo: { increment: 1 } },
    })
    return record.ultimo
  })

  // Formatear: "2026-PERS-ENT-00123"
  const numero = String(consecutivo).padStart(5, "0")
  return `${anio}-${codigoDependencia}-${sigla}-${numero}`
}

/**
 * Sólo consulta —no incrementa— el siguiente número disponible.
 * Útil para mostrar un "preview" del radicado antes de generarlo.
 */
export async function previewNumeroRadicado(
  tipo: GdTipoRadicado,
  codigoDependencia: string
): Promise<string> {
  const prisma = await getTenantPrisma()
  const anio = new Date().getFullYear()
  const sigla = TIPO_SIGLA[tipo]

  const record = await prisma.gdConsecutivo.findUnique({
    where: { anio_tipo_codigoDep: { anio, tipo, codigoDep: codigoDependencia } },
  })

  const siguiente = (record?.ultimo ?? 0) + 1
  const numero = String(siguiente).padStart(5, "0")
  return `${anio}-${codigoDependencia}-${sigla}-${numero}`
}
