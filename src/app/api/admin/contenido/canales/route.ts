import { NextRequest, NextResponse } from 'next/server'
import { checkApiRoles } from '@/lib/authorization'
import { getTenantPrisma } from '@/lib/tenant'
import { TipoCanalAtencion } from '@prisma/client'

const STRING_FIELDS = ['nombre', 'valor', 'descripcion', 'icono'] as const
const NUMBER_FIELDS = ['orden'] as const
const BOOLEAN_FIELDS = ['activo'] as const

const TIPOS_VALIDOS = Object.values(TipoCanalAtencion) as string[]

type CanalDraft = Record<string, unknown>

function sanitize(body: unknown): CanalDraft {
  if (!body || typeof body !== 'object') return {}
  const src = body as Record<string, unknown>
  const out: CanalDraft = {}
  for (const key of STRING_FIELDS) {
    if (key in src) {
      const v = src[key]
      out[key] = v == null || v === '' ? null : String(v)
    }
  }
  if (out.nombre === null) delete out.nombre
  if (out.valor === null) delete out.valor

  if ('tipo' in src) {
    const t = String(src.tipo)
    if (TIPOS_VALIDOS.includes(t)) out.tipo = t
  }
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
  const canales = await prisma.canalAtencion.findMany({
    orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(canales)
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
  if (!data.nombre || !data.valor || !data.tipo) {
    return NextResponse.json(
      { error: 'tipo, nombre y valor son obligatorios' },
      { status: 400 },
    )
  }

  const prisma = await getTenantPrisma()
  const canal = await prisma.canalAtencion.create({
    data: {
      tipo: data.tipo as TipoCanalAtencion,
      nombre: data.nombre as string,
      valor: data.valor as string,
      descripcion: (data.descripcion as string | null) ?? null,
      icono: (data.icono as string | null) ?? null,
      orden: (data.orden as number | undefined) ?? 0,
      activo: (data.activo as boolean | undefined) ?? true,
    },
  })
  return NextResponse.json(canal, { status: 201 })
}
