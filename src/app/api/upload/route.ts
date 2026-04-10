/**
 * API de Subida de Archivos
 * 
 * POST /api/upload - Sube uno o más archivos
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkApiRoles } from '@/lib/authorization';
import { subirArchivo, subirArchivos, TIPOS_PERMITIDOS, LIMITES_TAMANO, MAX_ARCHIVOS_POR_REQUEST } from '@/lib/upload';
import { registrarAuditoria } from '@/lib/auditoria';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol
    const { error, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (error) return error;

    // Obtener el formulario
    const formData = await request.formData();
    const archivos = formData.getAll('archivos') as File[];
    const archivo = formData.get('archivo') as File | null;
    const carpeta = formData.get('carpeta') as string || 'general';
    const tipo = formData.get('tipo') as string || 'todos';

    // Determinar tipos permitidos según el parámetro
    let tiposPermitidos = TIPOS_PERMITIDOS.todos;
    let maxTamano = LIMITES_TAMANO.default;

    if (tipo === 'imagen') {
      tiposPermitidos = TIPOS_PERMITIDOS.imagen;
      maxTamano = LIMITES_TAMANO.imagen;
    } else if (tipo === 'documento') {
      tiposPermitidos = TIPOS_PERMITIDOS.documento;
      maxTamano = LIMITES_TAMANO.documento;
    } else if (tipo === 'excel') {
      tiposPermitidos = TIPOS_PERMITIDOS.excel;
      maxTamano = LIMITES_TAMANO.excel;
    }

    // Subir un solo archivo
    if (archivo) {
      const resultado = await subirArchivo(archivo, {
        carpeta,
        tiposPermitidos,
        maxTamano,
      });

      if (resultado.success) {
        // Registrar auditoría
        await registrarAuditoria({
          accion: 'UPLOAD',
          entidad: 'Archivo',
          usuarioId: user!.id,
          datosDespues: {
            url: resultado.url,
            nombre: resultado.nombreArchivo,
            tamano: resultado.tamano,
            tipo: resultado.tipo,
            carpeta,
          },
        });
      }

      return NextResponse.json(resultado);
    }

    // Subir múltiples archivos
    if (archivos.length > 0) {
      // Limitar cantidad de archivos por request
      if (archivos.length > MAX_ARCHIVOS_POR_REQUEST) {
        return NextResponse.json(
          { error: `Máximo ${MAX_ARCHIVOS_POR_REQUEST} archivos por solicitud` },
          { status: 400 }
        );
      }

      const resultados = await subirArchivos(archivos, {
        carpeta,
        tiposPermitidos,
        maxTamano,
      });

      // Registrar auditoría para archivos exitosos
      const exitosos = resultados.filter(r => r.success);
      if (exitosos.length > 0) {
        await registrarAuditoria({
          accion: 'UPLOAD',
          entidad: 'Archivos',
          usuarioId: user!.id,
          datosDespues: {
            cantidad: exitosos.length,
            archivos: exitosos.map(r => ({ url: r.url, nombre: r.nombreArchivo })),
            carpeta,
          },
        });
      }

      return NextResponse.json({
        success: true,
        resultados,
        exitosos: exitosos.length,
        fallidos: resultados.length - exitosos.length,
      });
    }

    return NextResponse.json(
      { error: 'No se proporcionaron archivos' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error en API de upload:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
