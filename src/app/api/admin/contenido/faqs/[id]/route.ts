import { NextRequest, NextResponse } from 'next/server'
import { checkApiRoles } from '@/lib/authorization'
import { getTenantPrisma } from '@/lib/tenant'
import { CategoriaFaq } from '@prisma/client'

const CATEGORIAS_VALIDAS = Object.values(CategoriaFaq) as string[]

function sanitize(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object') return {}
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  if ('pregunta' in src) {
    const v = src.pregunta
    out.pregunta = v == null || v === '' ? null : String(v)
  }
  if ('respuesta' in src) {
    const v = src.respuesta
    out.respuesta = v == null || v === '' ? null : String(v)
  }
  if (out.pregunta === null) delete out.pregunta
  if (out.respuesta === null) delete out.respuesta
  if ('categoria' in src) {
    const c = String(src.categoria)
    if (CATEGORIAS_VALIDAS.includes(c)) out.categoria = c
  }
  if ('orden' in src) {
    const v = src.orden
    const n = v == null || v === '' ? 0 : Number(v)
    out.orden = Number.isFinite(n) ? n : 0
  }
  if ('publicada' in src) out.publicada = Boolean(src.publicada)
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
    const faq = await prisma.preguntaFrecuente.update({ where: { id }, data })
    return NextResponse.json(faq)
  } catch {
    return NextResponse.json({ error: 'FAQ no encontrada' }, { status: 404 })
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
    await prisma.preguntaFrecuente.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'FAQ no encontrada' }, { status: 404 })
  }
}
