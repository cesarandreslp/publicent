/**
 * /api/admin/cp/periodos/[id] — cambiar estado (ABIERTO ⇄ CERRADO / AJUSTE).
 * Cerrar un periodo no permite comprobantes nuevos. AJUSTE sólo SUPER_ADMIN.
 */
import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContabilidad } from "@/lib/frisco-guard"
import { cpPeriodoUpdateSchema, validateBody } from "@/lib/validations"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await params
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(cpPeriodoUpdateSchema, body)
  if (!v.success) return v.response
  const { estado } = v.data

  if (estado === 'AJUSTE' && guard.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: "Sólo SUPER_ADMIN puede pasar a AJUSTE" }, { status: 403 })
  }

  const prisma = await getTenantPrisma()
  const periodo = await prisma.cpPeriodoContable.update({
    where: { id },
    data: {
      estado,
      cerradoEn: estado === 'CERRADO' ? new Date() : null,
      cerradoPor: estado === 'CERRADO' ? guard.user?.id ?? null : null,
    },
  })
  return NextResponse.json({ periodo })
}
