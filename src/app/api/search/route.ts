/**
 * API de Búsqueda Global
 * 
 * GET /api/search - Busca en todo el sitio
 * GET /api/search?sugerencias=true - Obtiene sugerencias de autocompletado
 */

import { NextRequest, NextResponse } from 'next/server';
import { buscarGlobal, obtenerSugerencias } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const sugerencias = searchParams.get('sugerencias') === 'true';
    const tipos = searchParams.get('tipos')?.split(',') as ('noticia' | 'documento' | 'transparencia' | 'servicio' | 'pagina')[] | undefined;
    const limite = parseInt(searchParams.get('limite') || '20');
    const pagina = parseInt(searchParams.get('pagina') || '1');

    // Si se piden sugerencias
    if (sugerencias) {
      const resultados = await obtenerSugerencias(query);
      return NextResponse.json({ sugerencias: resultados });
    }

    // Búsqueda completa
    const resultados = await buscarGlobal({
      query,
      tipos,
      limite,
      pagina,
    });

    return NextResponse.json(resultados);

  } catch (error) {
    console.error('Error en búsqueda:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Error al realizar la búsqueda' },
      { status: 500 }
    );
  }
}
