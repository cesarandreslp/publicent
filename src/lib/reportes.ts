import { getTenantPrisma } from "@/lib/prisma";
import * as XLSX from 'xlsx';

/**
 * Tipos de reportes disponibles
 */
export type TipoReporte = 
  | 'pqrsd' 
  | 'noticias' 
  | 'documentos' 
  | 'usuarios' 
  | 'auditoria'
  | 'transparencia';

/**
 * Formato de exportación
 */
export type FormatoExportacion = 'xlsx' | 'csv';

/**
 * Opciones para generar reportes
 */
interface OpcionesReporte {
  tipo: TipoReporte;
  fechaInicio?: Date;
  fechaFin?: Date;
  estado?: string;
  formato?: FormatoExportacion;
}

/**
 * Resultado de generación de reporte
 */
interface ResultadoReporte {
  buffer: Buffer;
  nombreArchivo: string;
  mimeType: string;
}

/**
 * Genera un reporte en el formato especificado
 */
export async function generarReporte(opciones: OpcionesReporte): Promise<ResultadoReporte> {
  const { tipo, fechaInicio, fechaFin, estado, formato = 'xlsx' } = opciones;
  
  let datos: Record<string, unknown>[] = [];
  let columnas: string[] = [];
  let nombreBase = '';

  switch (tipo) {
    case 'pqrsd':
      const resultadoPQRSD = await generarReportePQRSD(fechaInicio, fechaFin, estado);
      datos = resultadoPQRSD.datos;
      columnas = resultadoPQRSD.columnas;
      nombreBase = 'reporte_pqrsd';
      break;

    case 'noticias':
      const resultadoNoticias = await generarReporteNoticias(fechaInicio, fechaFin);
      datos = resultadoNoticias.datos;
      columnas = resultadoNoticias.columnas;
      nombreBase = 'reporte_noticias';
      break;

    case 'documentos':
      const resultadoDocumentos = await generarReporteDocumentos(fechaInicio, fechaFin);
      datos = resultadoDocumentos.datos;
      columnas = resultadoDocumentos.columnas;
      nombreBase = 'reporte_documentos';
      break;

    case 'usuarios':
      const resultadoUsuarios = await generarReporteUsuarios();
      datos = resultadoUsuarios.datos;
      columnas = resultadoUsuarios.columnas;
      nombreBase = 'reporte_usuarios';
      break;

    case 'auditoria':
      const resultadoAuditoria = await generarReporteAuditoria(fechaInicio, fechaFin);
      datos = resultadoAuditoria.datos;
      columnas = resultadoAuditoria.columnas;
      nombreBase = 'reporte_auditoria';
      break;

    case 'transparencia':
      const resultadoTransparencia = await generarReporteTransparencia();
      datos = resultadoTransparencia.datos;
      columnas = resultadoTransparencia.columnas;
      nombreBase = 'reporte_transparencia';
      break;

    default:
      throw new Error(`Tipo de reporte no soportado: ${tipo}`);
  }

  // Generar archivo
  const fechaStr = new Date().toISOString().split('T')[0];
  const nombreArchivo = `${nombreBase}_${fechaStr}.${formato}`;

  if (formato === 'csv') {
    const csv = generarCSV(datos, columnas);
    return {
      buffer: Buffer.from(csv, 'utf-8'),
      nombreArchivo,
      mimeType: 'text/csv; charset=utf-8',
    };
  }

  // Excel por defecto
  const buffer = generarExcel(datos, columnas, nombreBase);
  return {
    buffer,
    nombreArchivo,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}

/**
 * Genera CSV a partir de datos
 */
function generarCSV(datos: Record<string, unknown>[], columnas: string[]): string {
  const header = columnas.join(',');
  const rows = datos.map(row => 
    columnas.map(col => {
      const valor = row[col];
      if (valor === null || valor === undefined) return '';
      const str = String(valor);
      // Escapar comillas y envolver en comillas si contiene comas
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );
  
  return [header, ...rows].join('\n');
}

/**
 * Genera Excel a partir de datos
 */
function generarExcel(datos: Record<string, unknown>[], columnas: string[], nombreHoja: string): Buffer {
  const ws = XLSX.utils.json_to_sheet(datos, { header: columnas });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja.substring(0, 31));
  
  // Ajustar anchos de columna
  const colWidths = columnas.map(col => ({
    wch: Math.max(
      col.length,
      ...datos.map(row => String(row[col] || '').length).slice(0, 100)
    ) + 2
  }));
  ws['!cols'] = colWidths;

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

/**
 * Reporte de PQRSD
 */
async function generarReportePQRSD(fechaInicio?: Date, fechaFin?: Date, estado?: string) {
  const prisma = await getTenantPrisma()
  const where: Record<string, unknown> = {};
  
  if (fechaInicio || fechaFin) {
    where.createdAt = {};
    if (fechaInicio) (where.createdAt as Record<string, Date>).gte = fechaInicio;
    if (fechaFin) (where.createdAt as Record<string, Date>).lte = fechaFin;
  }
  
  if (estado) {
    where.estado = estado;
  }

  type PQRSData = {
    radicado: string;
    tipo: string;
    estado: string;
    createdAt: Date;
    fechaVencimiento: Date | null;
    nombreSolicitante: string;
    email: string;
    telefono: string | null;
    asunto: string;
    asignado: { nombre: string } | null;
  };

  const pqrsd = await prisma.pQRS.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      asignado: { select: { nombre: true } },
    },
  }) as PQRSData[];

  const columnas = [
    'Radicado',
    'Tipo',
    'Estado',
    'Fecha Creación',
    'Fecha Límite',
    'Nombre',
    'Email',
    'Teléfono',
    'Asunto',
    'Asignado A',
    'Días Restantes',
  ];

  const datos = pqrsd.map(p => ({
    'Radicado': p.radicado,
    'Tipo': p.tipo,
    'Estado': p.estado,
    'Fecha Creación': p.createdAt.toISOString().split('T')[0],
    'Fecha Límite': p.fechaVencimiento?.toISOString().split('T')[0] ?? 'Sin fecha',
    'Nombre': p.nombreSolicitante,
    'Email': p.email,
    'Teléfono': p.telefono || '',
    'Asunto': p.asunto,
    'Asignado A': p.asignado?.nombre || 'Sin asignar',
    'Días Restantes': p.fechaVencimiento
      ? Math.ceil((p.fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
  }));

  return { datos, columnas };
}

/**
 * Reporte de Noticias
 */
async function generarReporteNoticias(fechaInicio?: Date, fechaFin?: Date) {
  const prisma = await getTenantPrisma()
  const where: Record<string, unknown> = {};
  
  if (fechaInicio || fechaFin) {
    where.fechaPublicacion = {};
    if (fechaInicio) (where.fechaPublicacion as Record<string, Date>).gte = fechaInicio;
    if (fechaFin) (where.fechaPublicacion as Record<string, Date>).lte = fechaFin;
  }

  type NoticiaData = {
    titulo: string;
    estado: string;
    fechaPublicacion: Date | null;
    creador: { nombre: string };
    destacada: boolean;
  };

  const noticias = await prisma.noticia.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      creador: { select: { nombre: true } },
    },
  }) as NoticiaData[];

  const columnas = [
    'Título',
    'Estado',
    'Fecha Publicación',
    'Autor',
    'Destacado',
  ];

  const datos = noticias.map(n => ({
    'Título': n.titulo,
    'Estado': n.estado,
    'Fecha Publicación': n.fechaPublicacion?.toISOString().split('T')[0] ?? '',
    'Autor': n.creador.nombre,
    'Destacado': n.destacada ? 'Sí' : 'No',
  }));

  return { datos, columnas };
}

/**
 * Reporte de Documentos de Transparencia
 */
async function generarReporteDocumentos(fechaInicio?: Date, fechaFin?: Date) {
  const prisma = await getTenantPrisma()
  const where: Record<string, unknown> = {};
  
  if (fechaInicio || fechaFin) {
    where.createdAt = {};
    if (fechaInicio) (where.createdAt as Record<string, Date>).gte = fechaInicio;
    if (fechaFin) (where.createdAt as Record<string, Date>).lte = fechaFin;
  }

  type DocumentoTransparenciaData = {
    nombre: string;
    descripcion: string | null;
    tipoArchivo: string;
    tamanio: number | null;
    vigencia: Date | null;
    createdAt: Date;
    item: {
      titulo: string;
      subcategoria: {
        nombre: string;
        categoria: { nombre: string };
      };
    };
  };

  const documentos = await prisma.documentoTransparencia.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      item: {
        select: {
          titulo: true,
          subcategoria: {
            select: {
              nombre: true,
              categoria: { select: { nombre: true } },
            },
          },
        },
      },
    },
  }) as DocumentoTransparenciaData[];

  const columnas = [
    'Nombre',
    'Categoría',
    'Subcategoría',
    'Ítem de Transparencia',
    'Fecha Subida',
    'Vigencia',
    'Tipo Archivo',
    'Tamaño',
  ];

  const datos = documentos.map(d => ({
    'Nombre': d.nombre,
    'Categoría': d.item.subcategoria.categoria.nombre,
    'Subcategoría': d.item.subcategoria.nombre,
    'Ítem de Transparencia': d.item.titulo,
    'Fecha Subida': d.createdAt.toISOString().split('T')[0],
    'Vigencia': d.vigencia?.toISOString().split('T')[0] || '',
    'Tipo Archivo': d.tipoArchivo,
    'Tamaño': formatearTamano(d.tamanio || 0),
  }));

  return { datos, columnas };
}

/**
 * Reporte de Usuarios
 */
async function generarReporteUsuarios() {
  const prisma = await getTenantPrisma()
  type UsuarioData = {
    nombre: string;
    apellido: string;
    email: string;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
    rol: { nombre: string };
  };

  const usuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: 'desc' },
    include: { rol: { select: { nombre: true } } },
  }) as UsuarioData[];

  const columnas = [
    'Nombre',
    'Email',
    'Rol',
    'Estado',
    'Fecha Registro',
    'Último Acceso',
  ];

  const datos = usuarios.map(u => ({
    'Nombre': `${u.nombre} ${u.apellido}`,
    'Email': u.email,
    'Rol': u.rol.nombre,
    'Estado': u.activo ? 'Activo' : 'Inactivo',
    'Fecha Registro': u.createdAt.toISOString().split('T')[0],
    'Último Acceso': u.updatedAt.toISOString().split('T')[0],
  }));

  return { datos, columnas };
}

/**
 * Reporte de Auditoría
 */
async function generarReporteAuditoria(fechaInicio?: Date, fechaFin?: Date) {
  const prisma = await getTenantPrisma()
  const where: Record<string, unknown> = {};
  
  if (fechaInicio || fechaFin) {
    where.createdAt = {};
    if (fechaInicio) (where.createdAt as Record<string, Date>).gte = fechaInicio;
    if (fechaFin) (where.createdAt as Record<string, Date>).lte = fechaFin;
  }

  type AuditoriaData = {
    createdAt: Date;
    usuario: { nombre: string; email: string } | null;
    accion: string;
    entidad: string;
    entidadId: string | null;
    ip: string | null;
  };

  const registros = await prisma.registroAuditoria.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      usuario: { select: { nombre: true, email: true } },
    },
    take: 10000, // Limitar a 10,000 registros
  }) as AuditoriaData[];

  const columnas = [
    'Fecha',
    'Usuario',
    'Email',
    'Acción',
    'Entidad',
    'ID Entidad',
    'IP',
  ];

  const datos = registros.map(r => ({
    'Fecha': r.createdAt.toISOString().replace('T', ' ').split('.')[0],
    'Usuario': r.usuario?.nombre ?? '',
    'Email': r.usuario?.email ?? '',
    'Acción': r.accion,
    'Entidad': r.entidad,
    'ID Entidad': r.entidadId || '',
    'IP': r.ip || '',
  }));

  return { datos, columnas };
}

/**
 * Reporte de Transparencia (resumen de cumplimiento)
 */
async function generarReporteTransparencia() {
  const prisma = await getTenantPrisma()
  const categorias = await prisma.categoriaTransparencia.findMany({
    include: {
      subcategorias: {
        include: {
          _count: { select: { items: true } },
        },
      },
      _count: { select: { subcategorias: true } },
    },
    orderBy: { orden: 'asc' },
  });

  const columnas = [
    'Categoría',
    'Subcategoría',
    'Items',
    'Estado',
  ];

  const datos: Record<string, unknown>[] = [];

  for (const cat of categorias) {
    // Agregar la categoría principal
    datos.push({
      'Categoría': cat.nombre,
      'Subcategoría': '',
      'Items': cat._count.subcategorias,
      'Estado': cat._count.subcategorias > 0 ? 'Con subcategorías' : 'Sin subcategorías',
    });

    // Agregar subcategorías
    for (const sub of cat.subcategorias) {
      datos.push({
        'Categoría': cat.nombre,
        'Subcategoría': sub.nombre,
        'Items': sub._count.items,
        'Estado': sub._count.items > 0 ? 'Con items' : 'Sin items',
      });
    }
  }

  return { datos, columnas };
}

/**
 * Formatea tamaño de archivo
 */
function formatearTamano(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
