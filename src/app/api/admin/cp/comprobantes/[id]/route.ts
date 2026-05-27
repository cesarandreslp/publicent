/**
 * /api/admin/cp/comprobantes/[id]
 * GET   — detalle con asientos + cuenta + tercero.
 * DELETE — anula (no borra). Estado pasa a ANULADO, registra usuario y motivo (?motivo=...).
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContabilidad } from "@/lib/frisco-guard"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const comprobante = await prisma.cpComprobante.findUnique({
    where: { id },
    include: {
      periodo: true,
      asientos: {
        include: {
          cuenta: { select: { codigo: true, nombre: true, naturaleza: true } },
          tercero: { select: { documento: true, razonSocial: true } },
        },
      },
    },
  })
  if (!comprobante) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json({ comprobante })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const motivo = searchParams.get('motivo')?.trim() || 'Anulación administrativa'

  const prisma = await getTenantPrisma()
  const comprobante = await prisma.cpComprobante.update({
    where: { id },
    data: {
      estado: 'ANULADO',
      anuladoEn: new Date(),
      anuladoPor: guard.user?.id ?? null,
      motivoAnulacion: motivo,
    },
  })
  return NextResponse.json({ comprobante })
}
