import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireObservatorio } from "@/lib/frisco-guard"
import { obsMedicionSchema, validateBody } from "@/lib/validations"

export async function POST(req: NextRequest) {
  const guard = await requireObservatorio(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(obsMedicionSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const ind = await prisma.obsIndicador.findUnique({ where: { id: v.data.indicadorId } })
  if (!ind) return NextResponse.json({ error: 'Indicador no encontrado' }, { status: 404 })

  const medicion = await prisma.$transaction(async (tx) => {
    const m = await tx.obsMedicion.create({
      data: {
        indicadorId: v.data.indicadorId,
        valor:       v.data.valor,
        fecha:       new Date(v.data.fecha),
        periodo:     v.data.periodo,
        fuente:      v.data.fuente ?? null,
        observacion: v.data.observacion ?? null,
        creadoPor:   guard.user?.id ?? null,
      },
    })
    // Actualizar valor actual desnormalizado si esta medición es la más reciente
    const ultima = await tx.obsMedicion.findFirst({
      where: { indicadorId: v.data.indicadorId },
      orderBy: { fecha: 'desc' },
    })
    if (ultima && ultima.id === m.id) {
      await tx.obsIndicador.update({
        where: { id: v.data.indicadorId },
        data: { valorActual: v.data.valor, fechaUltimaMedicion: new Date(v.data.fecha) },
      })
    }
    return m
  })

  return NextResponse.json(medicion, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireObservatorio(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const prisma = await getTenantPrisma()
  await prisma.obsMedicion.delete({ where: { id } })
  return NextResponse.json({ eliminado: true })
}
