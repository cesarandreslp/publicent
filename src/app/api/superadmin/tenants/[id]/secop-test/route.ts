/**
 * POST /api/superadmin/tenants/[id]/secop-test
 * Verifica que las credenciales SECOP (API Key de datos.gov.co) del tenant sean
 * válidas, haciendo una consulta mínima de los procesos de la entidad por NIT.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSASession } from "@/lib/superadmin-auth"
import { prismaMeta } from "@/lib/prisma-meta"
import { decryptSecretos } from "@/lib/encryption"
import { verificarCredencialesSecop } from "@/lib/integraciones/secop"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const tenant = await prismaMeta.tenant.findUnique({
    where:  { id },
    select: { secretosEncriptados: true },
  })
  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  const secretos = decryptSecretos(tenant.secretosEncriptados)
  const s = secretos.secop
  if (!s?.clientId || !s?.clientSecret)
    return NextResponse.json({ success: false, error: "SECOP no configurado para este tenant." })

  const resultado = await verificarCredencialesSecop({
    clientId: s.clientId, clientSecret: s.clientSecret, nit: s.nit ?? '',
  })

  if (!resultado.ok)
    return NextResponse.json({ success: false, error: resultado.error })

  return NextResponse.json({
    success: true,
    mensaje: `Conexión con SECOP II verificada. ${resultado.total} proceso(s) encontrado(s) para el NIT configurado.`,
  })
}
