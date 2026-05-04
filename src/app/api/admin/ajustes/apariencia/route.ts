/**
 * API de Apariencia del Tenant (Admin)
 *
 * GET  /api/admin/ajustes/apariencia — Devuelve la configuración visual actual del tenant
 * PATCH /api/admin/ajustes/apariencia — Actualiza logoUrl, colorPrimario, colorSecundario
 *
 * Escribe directamente en la meta-DB (tabla Tenant) para que el cambio sea visible
 * en todos los entornos del tenant (sin depender de la BD propia del tenant).
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getTenantId, getTenantInfo, invalidateTenantCache } from '@/lib/tenant'
import { prismaMeta } from '@/lib/prisma-meta'

// ---------------------------------------------------------------------------
// GET — leer configuración visual actual
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const info = await getTenantInfo()

    return NextResponse.json({
      logoUrl: info.logoUrl,
      colorPrimario: info.colorPrimario,
      colorSecundario: info.colorSecundario,
      nombre: info.nombre,
      nombreCorto: info.nombreCorto,
    })
  } catch (error) {
    console.error('[apariencia GET]', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH — actualizar configuración visual
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { logoUrl, colorPrimario, colorSecundario } = body

    // Validar formato de colores (hex o null)
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
    if (colorPrimario && !hexRegex.test(colorPrimario)) {
      return NextResponse.json({ error: 'colorPrimario debe ser un valor HEX válido (ej. #3366CC)' }, { status: 400 })
    }
    if (colorSecundario && !hexRegex.test(colorSecundario)) {
      return NextResponse.json({ error: 'colorSecundario debe ser un valor HEX válido (ej. #004884)' }, { status: 400 })
    }

    const tenantId = await getTenantId()

    // Construir objeto de actualización solo con los campos presentes en el body
    const updateData: Record<string, string | null> = {}
    if ('logoUrl' in body) updateData.logoUrl = logoUrl ?? null
    if ('colorPrimario' in body) updateData.colorPrimario = colorPrimario ?? null
    if ('colorSecundario' in body) updateData.colorSecundario = colorSecundario ?? null

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No se enviaron campos para actualizar' }, { status: 400 })
    }

    await prismaMeta.tenant.update({
      where: { id: tenantId },
      data: updateData,
    })

    // Invalidar caché para que el próximo render cargue los nuevos valores
    invalidateTenantCache(tenantId)

    return NextResponse.json({ message: 'Apariencia actualizada exitosamente' })
  } catch (error) {
    console.error('[apariencia PATCH]', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
