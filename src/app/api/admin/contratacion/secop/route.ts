import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma, getTenantId } from "@/lib/tenant"
import { requireIntegracionesEstado } from "@/lib/frisco-guard"
import { getSecopConfig, consultarProcesosSecop, consultarContratosSecop } from "@/lib/integraciones/secop"

/**
 * GET /api/admin/contratacion/secop?tipo=procesos|contratos&limit=&offset=
 * Lista los registros que la entidad tiene publicados en SECOP II (lectura
 * desde datos.gov.co). Para procesos, marca cuáles ya existen en PublicEnt
 * (match por referencia == numero interno).
 */
export async function GET(req: NextRequest) {
  const { error } = await requireIntegracionesEstado(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const tenantId = await getTenantId()
  const config = await getSecopConfig(tenantId)
  if (!config)
    return NextResponse.json(
      { error: 'SECOP no configurado para este tenant. Configure las credenciales en Superadmin → Integración SECOP II.' },
      { status: 422 }
    )

  const { searchParams } = new URL(req.url)
  const tipo   = searchParams.get('tipo') === 'contratos' ? 'contratos' : 'procesos'
  const limit  = Math.min(Number(searchParams.get('limit') ?? 50) || 50, 200)
  const offset = Number(searchParams.get('offset') ?? 0) || 0

  try {
    if (tipo === 'contratos') {
      const contratos = await consultarContratosSecop(config, { limit, offset })
      return NextResponse.json({ tipo, registros: contratos })
    }

    const procesos = await consultarProcesosSecop(config, { limit, offset })

    // Marcar cuáles ya están en PublicEnt (por número/referencia)
    const prisma = await getTenantPrisma()
    const internos = await prisma.conProceso.findMany({ select: { numero: true } })
    const setInternos = new Set(internos.map(p => p.numero))

    const registros = procesos.map(p => ({ ...p, enPublicEnt: setInternos.has(p.referencia) }))
    return NextResponse.json({ tipo, registros })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error consultando SECOP II' },
      { status: 502 }
    )
  }
}
