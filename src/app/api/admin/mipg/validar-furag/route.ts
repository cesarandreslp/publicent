/**
 * GET /api/admin/mipg/validar-furag?anioVigencia=2026
 *
 * Ejecuta la validación automática de indicadores FURAG cruzando datos reales
 * del sistema (PQRSD, Gestor Documental, Transparencia) con los puntajes
 * declarados en las evaluaciones MIPG.
 *
 * Retorna:
 *   - Array de IndicadorValidado con estado CONSISTENTE | ALERTA | INCONSISTENTE
 *   - Resumen con IDI FURAG sugerido y conteos por estado
 *
 * Acceso: SUPER_ADMIN | ADMIN
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkApiRoles } from '@/lib/authorization'
import { getTenantPrisma } from '@/lib/tenant'
import { validarIndicadoresFURAG } from '@/lib/furag-validator'

// Cache en memoria para evitar re-cálculos repetidos (TTL 5 minutos)
const cache = new Map<string, { ts: number; data: unknown }>()
const CACHE_TTL_MS = 5 * 60 * 1000

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const anioStr = searchParams.get('anioVigencia')
    const forzar  = searchParams.get('forzar') === 'true'  // Omitir caché

    if (!anioStr) {
      return NextResponse.json(
        { error: 'El parámetro anioVigencia es requerido (ej: ?anioVigencia=2026)' },
        { status: 400 }
      )
    }

    const anioVigencia = parseInt(anioStr, 10)
    if (isNaN(anioVigencia) || anioVigencia < 2020 || anioVigencia > 2100) {
      return NextResponse.json(
        { error: 'anioVigencia debe ser un año válido (2020–2100)' },
        { status: 400 }
      )
    }

    // Verificar caché
    const cacheKey = `furag-${anioVigencia}`
    if (!forzar) {
      const cached = cache.get(cacheKey)
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        return NextResponse.json(cached.data, {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-Age': String(Math.round((Date.now() - cached.ts) / 1000)) + 's',
          },
        })
      }
    }

    const prisma = await getTenantPrisma()
    const resultado = await validarIndicadoresFURAG(prisma as any, anioVigencia)

    // Guardar en caché
    cache.set(cacheKey, { ts: Date.now(), data: resultado })

    return NextResponse.json(resultado, {
      headers: { 'X-Cache': 'MISS' },
    })
  } catch (err) {
    console.error('[GET /api/admin/mipg/validar-furag]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Error interno al validar indicadores FURAG' }, { status: 500 })
  }
}
