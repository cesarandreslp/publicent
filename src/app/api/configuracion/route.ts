/**
 * API de Configuración Pública
 * 
 * GET /api/configuracion - Obtiene configuraciones públicas del sitio
 * 
 * @description Endpoint público para obtener configuraciones del sitio
 * marcadas como públicas (esPublico: true)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTenantPrisma } from "@/lib/tenant";

// GET - Obtener configuraciones públicas
export async function GET(request: NextRequest) {
  try {
    const prisma = await getTenantPrisma()
    const { searchParams } = new URL(request.url);
    const clave = searchParams.get('clave');
    const grupo = searchParams.get('grupo');

    // Si se solicita una clave específica
    if (clave) {
      const configuracion = await prisma.configuracionSitio.findUnique({
        where: { 
          clave,
        },
        select: {
          clave: true,
          valor: true,
          descripcion: true,
          grupo: true,
        }
      });

      if (!configuracion) {
        return NextResponse.json(
          { error: 'Configuración no encontrada' },
          { status: 404 }
        );
      }

      // Verificar que sea pública
      const configCompleta = await prisma.configuracionSitio.findUnique({
        where: { clave }
      });

      if (!configCompleta?.esPublico) {
        return NextResponse.json(
          { error: 'Configuración no disponible' },
          { status: 403 }
        );
      }

      return NextResponse.json(configuracion);
    }

    // Si se solicita un grupo específico
    const where: Record<string, unknown> = { esPublico: true };
    if (grupo) {
      where.grupo = grupo;
    }

    const configuraciones = await prisma.configuracionSitio.findMany({
      where,
      select: {
        clave: true,
        valor: true,
        descripcion: true,
        grupo: true,
      },
      orderBy: [
        { grupo: 'asc' },
        { clave: 'asc' }
      ]
    });

    // Convertir a objeto clave-valor para fácil acceso
    const configObject: Record<string, unknown> = {};
    configuraciones.forEach((config: { clave: string; valor: unknown }) => {
      configObject[config.clave] = config.valor;
    });

    return NextResponse.json({
      configuraciones: configObject,
      lista: configuraciones
    });

  } catch (error) {
    console.error('Error al obtener configuraciones:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
