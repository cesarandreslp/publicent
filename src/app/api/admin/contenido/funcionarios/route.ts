import { NextRequest, NextResponse } from 'next/server'
import { checkApiRoles } from '@/lib/authorization'
import { getTenantPrisma } from '@/lib/tenant'

const STRING_FIELDS = [
  'nombre',
  'cargo',
  'dependencia',
  'email',
  'telefono',
  'extension',
  'foto',
  'formacionAcademica',
  'experiencia',
  'tipoVinculacion',
] as const

const NUMBER_FIELDS = ['orden'] as const
const BOOLEAN_FIELDS = ['activo', 'visibleEnDirectorio'] as const

function sanitize(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object') return {}
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const key of STRING_FIELDS) {
    if (key in src) {
      const v = src[key]
      out[key] = v == null || v === '' ? null : String(v)
    }
  }
  // Required fields
  if (out.nombre === null) delete out.nombre
  if (out.cargo === null) delete out.cargo
  if (out.dependencia === null) delete out.dependencia

  for (const key of NUMBER_FIELDS) {
    if (key in src) {
      const v = src[key]
      const n = v == null || v === '' ? 0 : Number(v)
      out[key] = Number.isFinite(n) ? n : 0
    }
  }
  for (const key of BOOLEAN_FIELDS) {
    if (key in src) out[key] = Boolean(src[key])
  }
  return out
}

export async function GET() {
  const auth = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
  if (auth.error) return auth.error
  const prisma = await getTenantPrisma()
  const funcionarios = await prisma.funcionario.findMany({
    orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(funcionarios)
}

export async function POST(req: NextRequest) {
  const auth = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
  if (auth.error) return auth.error

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const data = sanitize(body)
  if (!data.nombre || !data.cargo || !data.dependencia) {
    return NextResponse.json(
      { error: 'nombre, cargo y dependencia son obligatorios' },
      { status: 400 },
    )
  }
  const prisma = await getTenantPrisma()
  const funcionario = await prisma.funcionario.create({
    data: {
      nombre: data.nombre as string,
      cargo: data.cargo as string,
      dependencia: data.dependencia as string,
      email: (data.email as string | null) ?? null,
      telefono: (data.telefono as string | null) ?? null,
      extension: (data.extension as string | null) ?? null,
      foto: (data.foto as string | null) ?? null,
      formacionAcademica: (data.formacionAcademica as string | null) ?? null,
      experiencia: (data.experiencia as string | null) ?? null,
      tipoVinculacion: (data.tipoVinculacion as string | null) ?? null,
      orden: (data.orden as number | undefined) ?? 0,
      activo: (data.activo as boolean | undefined) ?? true,
      visibleEnDirectorio: (data.visibleEnDirectorio as boolean | undefined) ?? true,
    },
  })
  return NextResponse.json(funcionario, { status: 201 })
}
