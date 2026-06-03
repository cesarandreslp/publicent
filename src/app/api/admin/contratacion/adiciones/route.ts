import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContratacion } from "@/lib/frisco-guard"
import { conAdicionCreateSchema, validateBody } from "@/lib/validations"

export async function POST(req: NextRequest) {
  const { error } = await requireContratacion(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (error) return error

  const body = await req.json()
  const v = validateBody(conAdicionCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const contrato = await prisma.conContrato.findUnique({ where: { id: v.data.contratoId } })
  if (!contrato)
    return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

  const adicion = await prisma.$transaction(async (tx) => {
    const ad = await tx.conAdicion.create({
      data: {
        contratoId:    v.data.contratoId,
        tipo:          v.data.tipo,
        numero:        v.data.numero,
        valor:         v.data.valor ?? null,
        plazoMeses:    v.data.plazoMeses ?? null,
        fecha:         new Date(v.data.fecha),
        justificacion: v.data.justificacion,
      },
    })
    // Actualizar totales en el contrato
    if (v.data.valor && (v.data.tipo === 'ADICION_VALOR' || v.data.tipo === 'ADICION_VALOR_Y_PROROGA')) {
      await tx.conContrato.update({
        where: { id: v.data.contratoId },
        data: { valorAdiciones: { increment: v.data.valor } },
      })
    }
    return ad
  })

  return NextResponse.json(adicion, { status: 201 })
}
