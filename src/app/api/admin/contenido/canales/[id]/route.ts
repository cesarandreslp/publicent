import { NextRequest, NextResponse } from 'next/server'
import { checkApiRoles } from '@/lib/authorization'
import { getTenantPrisma } from '@/lib/tenant'
import { TipoCanalAtencion } from '@prisma/client'

const STRING_FIELDS = ['nombre', 'valor', 'descripcion', 'icono'] as const
const NUMBER_FIELDS = ['orden'] as const
const BOOLEAN_FIELDS = ['activo'] as const
const TIPOS_VALIDOS = Object.values(TipoCanalAtencion) as string[]

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
  if (auth.error) return auth.error
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const data = sanitize(body)
  const prisma = await getTenantPrisma()
  try {
    const canal = await prisma.canalAtencion.update({ where: { id }, data })
    return NextResponse.json(canal)
  } catch {
    return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
  if (auth.error) return auth.error
  const { id } = await params
  const prisma = await getTenantPrisma()
  try {
    await prisma.canalAtencion.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 })
  }
}
