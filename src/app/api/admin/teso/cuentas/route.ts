import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireTesoreria } from "@/lib/frisco-guard"
import { tesoCuentaCreateSchema, validateBody } from "@/lib/validations"

export async function GET() {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const prisma = await getTenantPrisma()
  const cuentas = await prisma.tesoCuenta.findMany({
    orderBy: [{ activa: 'desc' }, { nombre: 'asc' }],
  })
  return NextResponse.json(cuentas)
}

export async function POST(req: NextRequest) {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const body = await req.json()
  const v = validateBody(tesoCuentaCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const cuenta = await prisma.tesoCuenta.create({
    data: {
      nombre:               v.data.nombre,
      banco:                v.data.banco,
      nitBanco:             v.data.nitBanco ?? null,
      numeroCuenta:         v.data.numeroCuenta,
      tipo:                 v.data.tipo ?? 'CORRIENTE',
      moneda:               v.data.moneda ?? 'COP',
      descripcion:          v.data.descripcion ?? null,
      cuentaContableCodigo: v.data.cuentaContableCodigo ?? null,
      activa:               v.data.activa ?? true,
    },
  })
  return NextResponse.json(cuenta, { status: 201 })
}
