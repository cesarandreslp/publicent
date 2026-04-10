import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'
import { checkApiRoles } from '@/lib/authorization';
import { generarReporte, TipoReporte, FormatoExportacion } from '@/lib/reportes';
import { registrarAuditoria } from '@/lib/auditoria';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y rol admin
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') as TipoReporte;
    const formato = (searchParams.get('formato') || 'xlsx') as FormatoExportacion;
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const estado = searchParams.get('estado') || undefined;

    if (!tipo) {
      return NextResponse.json(
        { error: 'El parámetro "tipo" es requerido' },
        { status: 400 }
      );
    }

    const tiposValidos: TipoReporte[] = ['pqrsd', 'noticias', 'documentos', 'usuarios', 'auditoria', 'transparencia'];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo de reporte inválido. Valores válidos: ${tiposValidos.join(', ')}` },
        { status: 400 }
      );
    }

    // Generar reporte
    const resultado = await generarReporte({
      tipo,
      formato,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      estado,
    });

    // Registrar auditoría
    await registrarAuditoria({
      accion: 'EXPORT',
      entidad: 'Reporte',
      entidadId: tipo,
      usuarioId: session.user.id,
      datosDespues: { tipo, formato, fechaInicio, fechaFin },
    });

    // Devolver archivo
    return new NextResponse(new Uint8Array(resultado.buffer), {
      headers: {
        'Content-Type': resultado.mimeType,
        'Content-Disposition': `attachment; filename="${resultado.nombreArchivo}"`,
      },
    });
  } catch (error) {
    console.error('Error generando reporte:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
