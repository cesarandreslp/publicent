/**
 * /api/admin/frisco/bienes
 * GET  — listar bienes con filtros (tipo, estadoJuridico, búsqueda)
 * POST — crear un nuevo bien
 *
 * Gateado por el módulo `frisco_bienes`.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireFrisco } from "@/lib/frisco-guard"
import { friscoBienCreateSchema, validateBody } from "@/lib/validations"
import type { Prisma } from "@prisma/client"

const MAX_PAGE_SIZE = 100

export async function GET(req: NextRequest) {
  const guard = await requireFrisco(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const tipo           = searchParams.get('tipo')
  const estadoJuridico = searchParams.get('estadoJuridico')
  const q              = searchParams.get('q')?.trim()
  const page           = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize       = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(searchParams.get('pageSize') ?? '20')))

  const where: Prisma.FriscoBienWhereInput = {}
  if (tipo)           where.tipo = tipo as Prisma.FriscoBienWhereInput['tipo']
  if (estadoJuridico) where.estadoJuridico = estadoJuridico as Prisma.FriscoBienWhereInput['estadoJuridico']
  if (q) {
    where.OR = [
      { codigo:         { contains: q, mode: 'insensitive' } },
      { folioMatricula: { contains: q, mode: 'insensitive' } },
      { placa:          { contains: q, mode: 'insensitive' } },
      { descripcion:    { contains: q, mode: 'insensitive' } },
      { numeroProceso:  { contains: q, mode: 'insensitive' } },
    ]
  }

  const prisma = await getTenantPrisma()
  const [total, bienes] = await Promise.all([
    prisma.friscoBien.count({ where }),
    prisma.friscoBien.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { depositarios: true, contratos: true } },
        destinacion: { select: { tipo: true, fecha: true } },
      },
    }),
  ])

  return NextResponse.json({ total, page, pageSize, bienes })
}

export async function POST(req: Request) {
  const guard = await requireFrisco(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 })
  }

  const validated = validateBody(friscoBienCreateSchema, body)
  if (!validated.success) return validated.response
  const data = validated.data

  const prisma = await getTenantPrisma()

  try {
    const bien = await prisma.friscoBien.create({
      data: {
        codigo:          data.codigo,
        folioMatricula:  data.folioMatricula ?? null,
        placa:           data.placa ?? null,
        tipo:            data.tipo,
        estadoJuridico:  data.estadoJuridico ?? 'EN_PROCESO',
        estadoFisico:    data.estadoFisico ?? 'SIN_VERIFICAR',
        descripcion:     data.descripcion,
        ubicacion:       data.ubicacion ?? null,
        latitud:         data.latitud ?? null,
        longitud:        data.longitud ?? null,
        avaluoVigente:   data.avaluoVigente ?? null,
        monedaAvaluo:    data.monedaAvaluo ?? 'COP',
        fechaAvaluo:     data.fechaAvaluo ? new Date(data.fechaAvaluo) : null,
        numeroProceso:   data.numeroProceso ?? null,
        juzgado:         data.juzgado ?? null,
        expedienteId:    data.expedienteId ?? null,
        carpetaFisicaId: data.carpetaFisicaId ?? null,
        observaciones:   data.observaciones ?? null,
      },
    })
    return NextResponse.json({ bien }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: `Ya existe un bien con código "${data.codigo}"` },
        { status: 409 }
      )
    }
    console.error("[frisco/bienes POST]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al crear el bien" }, { status: 500 })
  }
}
