/**
 * /api/admin/nom/empleados/[id] — PATCH y DELETE (inactiva) de empleado.
 */
import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireNomina } from "@/lib/frisco-guard"
import { nomEmpleadoUpdateSchema, validateBody } from "@/lib/validations"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const empleado = await prisma.nomEmpleado.findUnique({
    where: { id },
    include: {
      novedades: { orderBy: { fechaInicio: 'desc' }, take: 20 },
      liquidaciones: {
        orderBy: { createdAt: 'desc' }, take: 12,
        include: { periodo: { select: { codigo: true, estado: true } } },
      },
    },
  })
  if (!empleado) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json({ empleado })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(nomEmpleadoUpdateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()
  const empleado = await prisma.nomEmpleado.update({
    where: { id },
    data: {
      ...(d.primerNombre !== undefined ? { primerNombre: d.primerNombre } : {}),
      ...(d.segundoNombre !== undefined ? { segundoNombre: d.segundoNombre } : {}),
      ...(d.primerApellido !== undefined ? { primerApellido: d.primerApellido } : {}),
      ...(d.segundoApellido !== undefined ? { segundoApellido: d.segundoApellido } : {}),
      ...(d.email !== undefined ? { email: d.email } : {}),
      ...(d.telefono !== undefined ? { telefono: d.telefono } : {}),
      ...(d.cargo !== undefined ? { cargo: d.cargo } : {}),
      ...(d.dependencia !== undefined ? { dependencia: d.dependencia } : {}),
      ...(d.tipoVinculacion !== undefined ? { tipoVinculacion: d.tipoVinculacion } : {}),
      ...(d.salarioBasico !== undefined ? { salarioBasico: d.salarioBasico } : {}),
      ...(d.cuentaBanco !== undefined ? { cuentaBanco: d.cuentaBanco } : {}),
      ...(d.bancoNombre !== undefined ? { bancoNombre: d.bancoNombre } : {}),
      ...(d.tipoCuenta !== undefined ? { tipoCuenta: d.tipoCuenta } : {}),
      ...(d.eps !== undefined ? { eps: d.eps } : {}),
      ...(d.afp !== undefined ? { afp: d.afp } : {}),
      ...(d.arl !== undefined ? { arl: d.arl } : {}),
      ...(d.cajaCompensacion !== undefined ? { cajaCompensacion: d.cajaCompensacion } : {}),
      ...(d.codigoEPS !== undefined ? { codigoEPS: d.codigoEPS } : {}),
      ...(d.codigoAFP !== undefined ? { codigoAFP: d.codigoAFP } : {}),
      ...(d.codigoARL !== undefined ? { codigoARL: d.codigoARL } : {}),
      ...(d.codigoCajaComp !== undefined ? { codigoCajaComp: d.codigoCajaComp } : {}),
      ...(d.claseRiesgoARL !== undefined ? { claseRiesgoARL: d.claseRiesgoARL } : {}),
      ...(d.activo !== undefined ? { activo: d.activo } : {}),
      ...(d.fechaRetiro !== undefined ? { fechaRetiro: d.fechaRetiro ? new Date(d.fechaRetiro) : null } : {}),
      ...(d.retencionFuenteAplica !== undefined ? { retencionFuenteAplica: d.retencionFuenteAplica } : {}),
    },
  })
  return NextResponse.json({ empleado })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  // No borramos: marcamos inactivo y registramos fecha de retiro
  const empleado = await prisma.nomEmpleado.update({
    where: { id },
    data: { activo: false, fechaRetiro: new Date() },
  })
  return NextResponse.json({ empleado })
}
