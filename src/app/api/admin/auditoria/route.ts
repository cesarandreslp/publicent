import { NextRequest, NextResponse } from 'next/server';
import { obtenerAuditoria, obtenerEstadisticasAuditoria, AccionAuditoria } from '@/lib/auditoria';
import { checkApiRoles } from '@/lib/authorization';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y rol admin
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    
    // Verificar si es solicitud de estadísticas
    const estadisticas = searchParams.get('estadisticas');
    if (estadisticas === 'true') {
      const dias = parseInt(searchParams.get('dias') || '30');
      const stats = await obtenerEstadisticasAuditoria(dias);
      return NextResponse.json(stats);
    }

    // Parámetros de búsqueda
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const limite = Math.min(parseInt(searchParams.get('limite') || '20'), 100);
    const accion = searchParams.get('accion') as AccionAuditoria | null;
    const entidad = searchParams.get('entidad') || undefined;
    const usuarioId = searchParams.get('usuarioId') || undefined;
    const fechaInicio = searchParams.get('fechaInicio') 
      ? new Date(searchParams.get('fechaInicio')!) 
      : undefined;
    const fechaFin = searchParams.get('fechaFin') 
      ? new Date(searchParams.get('fechaFin')!) 
      : undefined;

    const resultado = await obtenerAuditoria({
      pagina,
      limite,
      accion: accion || undefined,
      entidad,
      usuarioId,
      desde: fechaInicio,
      hasta: fechaFin,
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error obteniendo auditoría:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
