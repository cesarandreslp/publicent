import { NextRequest, NextResponse } from 'next/server'
import { checkApiRoles } from '@/lib/authorization'
import { getTenantPrisma } from '@/lib/tenant'

const SINGLETON_KEY = 'default'

const STRING_FIELDS = [
  'nombreCompleto',
  'nombreCorto',
  'eslogan',
  'direccionPrincipal',
  'ciudad',
  'departamento',
  'codigoPostal',
  'telefonoConmutador',
  'telefonoPqrsd',
  'emailContacto',
  'emailPqrsd',
  'emailNotificaciones',
  'emailAccesibilidad',
  'logoUrl',
  'faviconUrl',
  'colorPrimario',
  'colorSecundario',
  'facebookUrl',
  'twitterUrl',
  'instagramUrl',
  'youtubeUrl',
  'linkedinUrl',
  'whatsappNumero',
  'seoTitle',
  'seoTitleTemplate',
  'seoDescription',
  'seoKeywords',
  'seoOgImageUrl',
  'seoOgUrl',
  'emailFromName',
  'emailFromAddress',
  'emailSignatureHtml',
  'urlGoogleMapsEmbed',
] as const

const NUMBER_FIELDS = ['coordenadaLat', 'coordenadaLng'] as const

type IdentidadInput = Partial<
  Record<(typeof STRING_FIELDS)[number], string | null>
> &
  Partial<Record<(typeof NUMBER_FIELDS)[number], number | null>>

function sanitize(body: unknown): IdentidadInput {
  if (!body || typeof body !== 'object') return {}
  const src = body as Record<string, unknown>
  const out: IdentidadInput = {}
  for (const key of STRING_FIELDS) {
    if (key in src) {
      const v = src[key]
      out[key] = v == null || v === '' ? null : String(v)
    }
  }
  for (const key of NUMBER_FIELDS) {
    if (key in src) {
      const v = src[key]
      if (v == null || v === '') out[key] = null
      else {
        const n = Number(v)
        out[key] = Number.isFinite(n) ? n : null
      }
    }
  }
  return out
}

export async function GET() {
  const auth = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
  if (auth.error) return auth.error

  const prisma = await getTenantPrisma()
  const identidad = await prisma.identidadInstitucional.findFirst({
    where: { singletonKey: SINGLETON_KEY },
  })
  return NextResponse.json(identidad)
}

export async function PATCH(req: NextRequest) {
  const auth = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
  if (auth.error) return auth.error

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido' }, { status: 400 })
  }

  const data = sanitize(body)

  if (!data.nombreCompleto || !data.nombreCorto) {
    return NextResponse.json(
      { error: 'nombreCompleto y nombreCorto son obligatorios' },
      { status: 400 },
    )
  }

  // Campos requeridos en el modelo Prisma — no pueden ser null en update/create.
  const nombreCompleto = data.nombreCompleto
  const nombreCorto = data.nombreCorto
  const { nombreCompleto: _nc, nombreCorto: _ns, ...restoData } = data

  const prisma = await getTenantPrisma()
  const identidad = await prisma.identidadInstitucional.upsert({
    where: { singletonKey: SINGLETON_KEY },
    create: {
      singletonKey: SINGLETON_KEY,
      nombreCompleto,
      nombreCorto,
      ...restoData,
    },
    update: {
      nombreCompleto,
      nombreCorto,
      ...restoData,
    },
  })

  return NextResponse.json(identidad)
}
