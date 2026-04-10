/**
 * Sistema de Auditoría
 * 
 * Funciones helper para registrar acciones en el sistema
 * Cumple con requisitos de trazabilidad del Anexo 3 Res. 1519
 */

import { getTenantPrisma } from "@/lib/prisma";
import { headers } from 'next/headers';

export type AccionAuditoria = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'VIEW' 
  | 'DOWNLOAD' 
  | 'UPLOAD'
  | 'PUBLISH'
  | 'ARCHIVE'
  | 'ASSIGN'
  | 'RESPOND'
  | 'EXPORT';

export interface DatosAuditoria {
  accion: AccionAuditoria;
  entidad: string;
  entidadId?: string;
  usuarioId?: string;
  datosAntes?: Record<string, unknown>;
  datosDespues?: Record<string, unknown>;
  descripcion?: string;
}

/**
 * Registra una acción en el sistema de auditoría
 */
export async function registrarAuditoria(datos: DatosAuditoria): Promise<void> {
  try {
    const prisma = await getTenantPrisma()
    // Obtener headers para IP y User Agent
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await prisma.registroAuditoria.create({
      data: {
        accion: datos.accion,
        entidad: datos.entidad,
        entidadId: datos.entidadId,
        usuarioId: datos.usuarioId,
        datosAntes: datos.datosAntes as object,
        datosDespues: datos.datosDespues as object,
        ip: ip.split(',')[0].trim(), // Tomar primera IP si hay varias
        userAgent: userAgent.substring(0, 500), // Limitar longitud
      }
    });
  } catch (error) {
    // No fallar la operación principal si la auditoría falla
    console.error('Error registrando auditoría:', error);
  }
}

/**
 * Obtiene los registros de auditoría con filtros
 */
export async function obtenerAuditoria(opciones: {
  usuarioId?: string;
  entidad?: string;
  accion?: AccionAuditoria;
  desde?: Date;
  hasta?: Date;
  pagina?: number;
  limite?: number;
}) {
  const {
    usuarioId,
    entidad,
    accion,
    desde,
    hasta,
    pagina = 1,
    limite = 50
  } = opciones;

  const prisma = await getTenantPrisma()
  const where: Record<string, unknown> = {};

  if (usuarioId) where.usuarioId = usuarioId;
  if (entidad) where.entidad = entidad;
  if (accion) where.accion = accion;
  if (desde || hasta) {
    where.createdAt = {};
    if (desde) (where.createdAt as Record<string, unknown>).gte = desde;
    if (hasta) (where.createdAt as Record<string, unknown>).lte = hasta;
  }

  const [registros, total] = await Promise.all([
    prisma.registroAuditoria.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.registroAuditoria.count({ where })
  ]);

  return {
    registros,
    total,
    paginas: Math.ceil(total / limite),
    paginaActual: pagina,
  };
}

/**
 * Obtiene las entidades únicas para filtros
 */
export async function obtenerEntidadesAuditoria(): Promise<string[]> {
  const prisma = await getTenantPrisma()
  const result = await prisma.registroAuditoria.findMany({
    distinct: ['entidad'],
    select: { entidad: true }
  }) as { entidad: string }[];
  return result.map(r => r.entidad);
}

/**
 * Obtiene estadísticas de auditoría
 */
export async function obtenerEstadisticasAuditoria(dias: number = 30) {
  const prisma = await getTenantPrisma()
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  const [porAccionResult, porEntidadResult, porUsuario, total] = await Promise.all([
    prisma.registroAuditoria.groupBy({
      by: ['accion'],
      _count: true,
      where: { createdAt: { gte: desde } }
    }),
    prisma.registroAuditoria.groupBy({
      by: ['entidad'],
      _count: true,
      where: { createdAt: { gte: desde } }
    }),
    prisma.registroAuditoria.groupBy({
      by: ['usuarioId'],
      _count: true,
      where: { 
        createdAt: { gte: desde },
        usuarioId: { not: null }
      },
      orderBy: { _count: { usuarioId: 'desc' } },
      take: 10
    }),
    prisma.registroAuditoria.count({
      where: { createdAt: { gte: desde } }
    })
  ]);

  const porAccion = porAccionResult as { accion: string; _count: number }[];
  const porEntidad = porEntidadResult as { entidad: string; _count: number }[];

  return {
    porAccion: porAccion.map(p => ({ accion: p.accion, cantidad: p._count })),
    porEntidad: porEntidad.map(p => ({ entidad: p.entidad, cantidad: p._count })),
    porUsuario,
    total,
    periodo: `Últimos ${dias} días`
  };
}
