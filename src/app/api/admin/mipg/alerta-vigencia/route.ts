/**
 * GET /api/admin/mipg/alerta-vigencia?anioVigencia=YYYY
 *
 * Devuelve el estado de la vigencia FURAG para el año indicado
 * (o la vigencia más relevante si no se especifica el año).
 *
 * Respuesta:  EstadoVigenciaFurag
 * Caché:      revalidación cada hora (s-maxage=3600)
 *
 * Acceso: SUPER_ADMIN | ADMIN | EDITOR
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkApiRoles } from '@/lib/authorization'
import {
  calcularEstadoVigenciaFurag,
  calcularVigenciaMasRelevante,
} from '@/lib/furag-alertas'

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const anioStr = searchParams.get('anioVigencia')

    let resultado

    if (anioStr) {
      const anio = parseInt(anioStr, 10)
      if (isNaN(anio) || anio < 2020 || anio > 2100) {
        return NextResponse.json(
          { error: 'anioVigencia debe ser un año válido (2020–2100)' },
          { status: 400 }
        )
      }
      resultado = calcularEstadoVigenciaFurag(anio)
    } else {
      resultado = calcularVigenciaMasRelevante()
    }

    return NextResponse.json(resultado, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error('[GET /api/admin/mipg/alerta-vigencia]', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Error al calcular alerta de vigencia FURAG' },
      { status: 500 }
    )
  }
}
