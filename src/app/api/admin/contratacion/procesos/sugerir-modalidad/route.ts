/**
 * POST /api/admin/contratacion/procesos/sugerir-modalidad
 *
 * Sugiere la modalidad de selección (Ley 80/1150) y un supervisor idóneo a
 * partir del objeto y valor estimado del proceso. IA sugiere, funcionario decide.
 *
 * Body: { descripcion: string, valorEstimado: number }
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requireContratacion } from "@/lib/frisco-guard"
import { getTenantPrisma, getTenantId } from "@/lib/tenant"
import { validateBody } from "@/lib/validations"
import { sugerirModalidadYSupervisor, type Funcionario } from "@/lib/contratacion-ia"

const schema = z.object({
  descripcion:   z.string().min(10, "Describa el objeto del proceso (mín. 10 caracteres)").max(2000),
  valorEstimado: z.number().positive("El valor estimado debe ser mayor a 0"),
})

export async function POST(req: Request) {
  const guard = await requireContratacion(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(schema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const usuarios = await prisma.usuario.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, apellido: true, cargo: true },
    take: 100,
  })

  const funcionarios: Funcionario[] = usuarios.map(u => ({
    id: u.id,
    nombre: `${u.nombre} ${u.apellido}`.trim(),
    cargo: u.cargo ?? "Funcionario",
  }))

  const tenantId = await getTenantId()
  const sugerencia = await sugerirModalidadYSupervisor(
    tenantId,
    v.data.descripcion,
    v.data.valorEstimado,
    funcionarios,
  )

  return NextResponse.json({ sugerencia })
}
