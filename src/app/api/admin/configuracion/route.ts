/**
 * API de Configuración del Sitio (Admin)
 * 
 * GET /api/admin/configuracion - Lista todas las configuraciones
 * POST /api/admin/configuracion - Crea o actualiza una configuración
 * 
 * @description Gestión de configuraciones del sitio desde el panel admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'
import { checkApiRoles } from '@/lib/authorization';
import { getTenantPrisma } from "@/lib/tenant";
import { configuracionSchema, validateBody } from "@/lib/validations"

// GET - Listar todas las configuraciones
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const prisma = await getTenantPrisma()
    const { searchParams } = new URL(request.url);
    const grupo = searchParams.get('grupo');

    const where: Record<string, unknown> = {};
    if (grupo) {
      where.grupo = grupo;
    }

    const configuraciones = await prisma.configuracionSitio.findMany({
      where,
      orderBy: [
        { grupo: 'asc' },
        { clave: 'asc' }
      ]
    });

    // Agrupar por grupo
    type ConfigType = typeof configuraciones[number];
    const grupos: Record<string, ConfigType[]> = {};
    configuraciones.forEach((config: ConfigType) => {
      const grupoName = config.grupo || 'general';
      if (!grupos[grupoName]) {
        grupos[grupoName] = [];
      }
      grupos[grupoName].push(config);
    });

    return NextResponse.json({ 
      configuraciones,
      grupos,
      total: configuraciones.length 
    });

  } catch (error) {
    console.error('Error al obtener configuraciones:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const prisma = await getTenantPrisma()
    const body = await request.json()
    const validated = validateBody(configuracionSchema, body)
    if (!validated.success) return validated.response;
    const { clave, valor, descripcion, grupo, esPublico } = body;

    if (!clave) {
      return NextResponse.json(
        { error: 'La clave es requerida' },
        { status: 400 }
      );
    }

    // Upsert - crear o actualizar
    const configuracion = await prisma.configuracionSitio.upsert({
      where: { clave },
      update: {
        valor: valor ?? {},
        descripcion,
        grupo,
        esPublico: esPublico ?? false,
      },
      create: {
        clave,
        valor: valor ?? {},
        descripcion,
        grupo,
        esPublico: esPublico ?? false,
      }
    });

    return NextResponse.json({
      message: 'Configuración guardada exitosamente',
      configuracion
    });

  } catch (error) {
    console.error('Error al guardar configuración:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar configuración
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo SUPERADMIN puede eliminar configuraciones.' },
        { status: 401 }
      );
    }

    const prisma = await getTenantPrisma()
    const { searchParams } = new URL(request.url);
    const clave = searchParams.get('clave');

    if (!clave) {
      return NextResponse.json(
        { error: 'La clave es requerida' },
        { status: 400 }
      );
    }

    await prisma.configuracionSitio.delete({
      where: { clave }
    });

    return NextResponse.json({
      message: 'Configuración eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar configuración:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
