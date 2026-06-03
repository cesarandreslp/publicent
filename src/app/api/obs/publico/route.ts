import { NextResponse } from "next/server"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"

export async function GET() {
  const activo = await isTenantModuleActive(MODULO_IDS.OBSERVATORIO)
  if (!activo) return NextResponse.json({ error: 'Módulo no disponible' }, { status: 404 })

  const prisma = await getTenantPrisma()
  const indicadores = await prisma.obsIndicador.findMany({
    where: { publicado: true },
    include: { mediciones: { orderBy: { fecha: 'desc' }, take: 24 } },
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
  })
  return NextResponse.json(indicadores)
}
