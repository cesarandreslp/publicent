import { NextRequest, NextResponse } from 'next/server'
import { checkApiRoles } from '@/lib/authorization'
import { getTenantPrisma } from '@/lib/tenant'

const STRING_FIELDS = [
  'nombre',
  'direccion',
  'ciudad',
  'telefono',
  'email',
  'horarioAtencion',
  'observaciones',
] as const

const NUMBER_FIELDS = ['coordenadaLat', 'coordenadaLng', 'orden'] as const

const BOOLEAN_FIELDS = ['esPrincipal', 'activa'] as const

type SedeDraft = Record<string, unknown>

function sanitize(body: unknown): SedeDraft {
  if (!body || typeof body !== 'object') return {}
  const src = body as Record<string, unknown>
  const out: SedeDraft = {}
  for (const key of STRING_FIELDS) {
    if (key in src) {
      const v = src[key]
      out[key] = v == null || v === '' ? null : String(v)
    }
  }
  if (out.nombre === null) delete out.nombre
  if (out.direccion === null) delete out.direccion

  for (const key of NUMBER_FIELDS) {
    if (key in src) {
      const v = src[key]
      if (v == null || v === '') {
        out[key] = key === 'orden' ? 0 : null
      } else {
        const n = Number(v)
        out[key] = Number.isFinite(n) ? n : key === 'orden' ? 0 : null
      }
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
    return NextResponse.json({ error: 'Cuerpo JSON inválido' }, { status: 400 })
  }

  const data = sanitize(body)
  const prisma = await getTenantPrisma()

  // Si se marca como principal, desmarcar las demás
  if (data.esPrincipal === true) {
    await prisma.sede.updateMany({
      where: { esPrincipal: true, id: { not: id } },
      data: { esPrincipal: false },
    })
  }

  try {
    const sede = await prisma.sede.update({
      where: { id },
      data,
    })
    return NextResponse.json(sede)
  } catch {
    return NextResponse.json({ error: 'Sede no encontrada' }, { status: 404 })
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
    await prisma.sede.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Sede no encontrada' }, { status: 404 })
  }
}
