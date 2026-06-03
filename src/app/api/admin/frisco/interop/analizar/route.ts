/**
 * POST /api/admin/frisco/interop/analizar
 *
 * Recibe los resultados de SNR, IGAC y/o Fiscalía ya consultados en el cliente
 * más los datos internos del bien, y devuelve el análisis de discrepancias.
 * No guarda resultado en DB — es un análisis on-demand en sesión.
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requireFriscoInterop } from "@/lib/frisco-guard"
import { validateBody } from "@/lib/validations"
import { getTenantId } from "@/lib/tenant"
import { analizarDiscrepanciasInterop } from "@/lib/frisco-interop-ia"

const snrSchema = z.object({
  folio:               z.string(),
  estado:              z.string(),
  direccion:           z.string().nullable(),
  area:                z.number().nullable(),
  propietarios:        z.array(z.object({ nombre: z.string(), documento: z.string(), cuota: z.string() })),
  gravamenes:          z.array(z.string()),
}).optional().nullable()

const igacSchema = z.object({
  area:              z.number(),
  avaluoCatastral:   z.number(),
  vigencia:          z.number(),
  direccion:         z.string().nullable(),
  municipio:         z.string(),
  departamento:      z.string(),
  destinoEconomico:  z.string(),
}).optional().nullable()

const fiscaliaSchema = z.object({
  numeroProceso:        z.string(),
  estado:               z.string(),
  delito:               z.string(),
  despacho:             z.string(),
  fechaInicio:          z.string(),
  fechaUltimaActuacion: z.string().nullable(),
  enExtincionDominio:   z.boolean(),
  bienesAsociados:      z.number(),
}).optional().nullable()

const schema = z.object({
  bienInterno: z.object({
    codigo:         z.string(),
    tipo:           z.string(),
    estadoJuridico: z.string(),
    estadoFisico:   z.string().nullable(),
    ubicacion:      z.string().nullable(),
    avaluoVigente:  z.number().nullable(),
  }),
  snr:      snrSchema,
  igac:     igacSchema,
  fiscalia: fiscaliaSchema,
})

export async function POST(req: Request) {
  const guard = await requireFriscoInterop(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(schema, body)
  if (!v.success) return v.response

  const tenantId = await getTenantId()
  const analisis = await analizarDiscrepanciasInterop({ tenantId, ...v.data })
  return NextResponse.json({ analisis })
}
