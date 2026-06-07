/**
 * POST /api/superadmin/tenants/provision
 * Aprovisionamiento AUTOMÁTICO de un tenant: crea la BD en Neon, aplica el esquema,
 * siembra datos base + módulos contratados y registra el tenant en la meta-BD.
 *
 * Solo superadmin (OSS Innovation). Requiere NEON_API_KEY en el entorno del servidor.
 *
 * Nota de límites: en Vercel Hobby las funciones máx 60s. Para tenants con módulos
 * fiscales pesados (contabilidad/presupuesto: catálogos de miles de filas) usar el
 * CLI `npm run provision-tenant` o Vercel Pro.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSASession } from "@/lib/superadmin-auth"
import { provisionTenant, type ProvisionParams } from "@/lib/provisioning/provision"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  let body: ProvisionParams
  try {
    body = (await req.json()) as ProvisionParams
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 })
  }

  // Validación mínima
  const faltan: string[] = []
  if (!body.entidad?.slug) faltan.push("slug")
  if (!body.entidad?.codigo) faltan.push("código")
  if (!body.entidad?.nombre) faltan.push("nombre")
  if (!body.dominioPrincipal) faltan.push("dominio principal")
  if (!body.contacto?.email) faltan.push("email de contacto")
  if (!body.admin?.email) faltan.push("email del admin")
  if (!body.admin?.nombre) faltan.push("nombre del admin")
  if (faltan.length) {
    return NextResponse.json({ error: `Faltan campos: ${faltan.join(", ")}` }, { status: 400 })
  }

  if (!process.env.NEON_API_KEY) {
    return NextResponse.json(
      { error: "NEON_API_KEY no está configurada en el servidor. Agrégala en las variables de entorno de Vercel." },
      { status: 500 }
    )
  }

  try {
    const result = await provisionTenant({
      ...body,
      modulos: Array.isArray(body.modulos) ? body.modulos : [],
    })
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en el aprovisionamiento" },
      { status: 502 }
    )
  }
}
