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

interface SedeDraft {
  nombre?: string
  direccion?: string
  ciudad?: string | null
  telefono?: string | null
  email?: string | null
  horarioAtencion?: string | null
  observaciones?: string | null
  coordenadaLat?: number | null
  coordenadaLng?: number | null
  orden?: number
  esPrincipal?: boolean
  activa?: boolean
}

function sanitize(body: unknown): SedeDraft {
  if (!body || typeof body !== 'object') return {}
  const src = body as Record<string, unknown>
  const out: SedeDraft = {}
  for (const key of STRING_FIELDS) {
    if (key in src) {
      const v = src[key]
      ;(out as Record<string, unknown>)[key] =
        v == null || v === '' ? null : String(v)
    }
  }
  // Campos required no admiten null (nombre, direccion)
  if (out.nombre === null) out.nombre = undefined
  if (out.direccion === null) out.direccion = undefined

  for (const key of NUMBER_FIELDS) {
    if (key in src) {
      const v = src[key]
      if (v == null || v === '') {
        ;(out as Record<string, unknown>)[key] = key === 'orden' ? 0 : null
      } else {
        const n = Number(v)
        ;(out as Record<string, unknown>)[key] = Number.isFinite(n)
          ? n
          : key === 'orden'
            ? 0
            : null
      }
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
  const sedes = await prisma.sede.findMany({
    orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(sedes)
}

export async function POST(req: NextRequest) {
  const auth = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
  if (auth.error) return auth.error

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido' }, { status: 400 })
  }

  const data = sanitize(body)
  if (!data.nombre || !data.direccion) {
    return NextResponse.json(
      { error: 'nombre y direccion son obligatorios' },
      { status: 400 },
    )
  }

  const prisma = await getTenantPrisma()

  // Si esPrincipal=true, desmarcar las demás (solo una sede principal)
  if (data.esPrincipal) {
    await prisma.sede.updateMany({
      where: { esPrincipal: true },
      data: { esPrincipal: false },
    })
  }

  const sede = await prisma.sede.create({
    data: {
      nombre: data.nombre,
      direccion: data.direccion,
      ciudad: data.ciudad ?? null,
      telefono: data.telefono ?? null,
      email: data.email ?? null,
      horarioAtencion: data.horarioAtencion ?? null,
      observaciones: data.observaciones ?? null,
      coordenadaLat: data.coordenadaLat ?? null,
      coordenadaLng: data.coordenadaLng ?? null,
      orden: data.orden ?? 0,
      esPrincipal: data.esPrincipal ?? false,
      activa: data.activa ?? true,
    },
  })

  return NextResponse.json(sede, { status: 201 })
}
