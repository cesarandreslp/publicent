import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireTesoreria } from "@/lib/frisco-guard"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const extracto = await prisma.tesoExtracto.findUnique({
    where: { id },
    include: { lineas: { orderBy: { fecha: 'asc' } }, cuenta: true },
  })
  if (!extracto) return NextResponse.json({ error: 'Extracto no encontrado' }, { status: 404 })
  return NextResponse.json(extracto)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()

  const conciliadas = await prisma.tesoExtractoLinea.count({ where: { extractoId: id, conciliada: true } })
  if (conciliadas > 0)
    return NextResponse.json({ error: `No se puede eliminar: ${conciliadas} línea(s) ya conciliada(s)` }, { status: 409 })

  await prisma.tesoExtracto.delete({ where: { id } })
  return NextResponse.json({ eliminado: true })
}
