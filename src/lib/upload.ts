/**
 * Sistema de Subida de Archivos
 * 
 * Maneja la subida de archivos al servidor local
 * Con opción de migrar a S3 en el futuro
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Tipos de archivos permitidos
export const TIPOS_PERMITIDOS = {
  imagen: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documento: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  excel: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  todos: [] as string[], // Se llena dinámicamente
};

TIPOS_PERMITIDOS.todos = [
  ...TIPOS_PERMITIDOS.imagen,
  ...TIPOS_PERMITIDOS.documento,
  ...TIPOS_PERMITIDOS.excel,
];

// Límites de tamaño (en bytes)
// Estándar entidades públicas colombianas: 5-10 MB por archivo
export const LIMITES_TAMANO = {
  imagen: 5 * 1024 * 1024,      // 5 MB
  documento: 10 * 1024 * 1024,   // 10 MB (estándar GOV.CO)
  excel: 10 * 1024 * 1024,       // 10 MB
  default: 10 * 1024 * 1024,     // 10 MB
};

// Máximo de archivos por request
export const MAX_ARCHIVOS_POR_REQUEST = 5;

// Extensiones bloqueadas (ejecutables, scripting)
const EXTENSIONES_BLOQUEADAS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js',
  '.msi', '.dll', '.com', '.scr', '.pif', '.hta',
  '.cpl', '.msp', '.mst', '.jar', '.wsf',
];

export interface OpcionesSubida {
  carpeta?: string;           // Subcarpeta dentro de uploads
  tiposPermitidos?: string[]; // MIME types permitidos
  maxTamano?: number;         // Tamaño máximo en bytes
  nombrePersonalizado?: string; // Nombre personalizado (sin extensión)
}

export interface ResultadoSubida {
  success: boolean;
  url?: string;
  nombreArchivo?: string;
  tamano?: number;
  tipo?: string;
  error?: string;
}

/**
 * Genera un nombre único para el archivo
 */
function generarNombreUnico(nombreOriginal: string): string {
  const extension = path.extname(nombreOriginal).toLowerCase();
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${timestamp}-${random}${extension}`;
}

/**
 * Sanitiza nombre de archivo contra path traversal y extensiones peligrosas
 */
function sanitizarNombre(nombre: string): { seguro: boolean; error?: string } {
  // Path traversal
  if (nombre.includes('..') || nombre.includes('/') || nombre.includes('\\')) {
    return { seguro: false, error: 'Nombre de archivo contiene caracteres no permitidos' };
  }
  // Extensiones peligrosas
  const ext = path.extname(nombre).toLowerCase();
  if (EXTENSIONES_BLOQUEADAS.includes(ext)) {
    return { seguro: false, error: `Extensión ${ext} no permitida por seguridad` };
  }
  // Nombre vacío
  if (!nombre || nombre.trim().length === 0) {
    return { seguro: false, error: 'Nombre de archivo vacío' };
  }
  return { seguro: true };
}

/**
 * Obtiene la carpeta de destino basada en el año/mes actual
 */
function obtenerCarpetaFecha(): string {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${año}/${mes}`;
}

/**
 * Asegura que el directorio existe
 */
async function asegurarDirectorio(ruta: string): Promise<void> {
  if (!existsSync(ruta)) {
    await mkdir(ruta, { recursive: true });
  }
}

/**
 * Sube un archivo al servidor
 */
export async function subirArchivo(
  archivo: File,
  opciones: OpcionesSubida = {}
): Promise<ResultadoSubida> {
  const {
    carpeta = 'general',
    tiposPermitidos = TIPOS_PERMITIDOS.todos,
    maxTamano = LIMITES_TAMANO.default,
    nombrePersonalizado,
  } = opciones;

  try {
    // Validar nombre de archivo (path traversal + extensiones peligrosas)
    const sanitizado = sanitizarNombre(archivo.name);
    if (!sanitizado.seguro) {
      return { success: false, error: sanitizado.error };
    }

    // Validar tipo de archivo
    if (tiposPermitidos.length > 0 && !tiposPermitidos.includes(archivo.type)) {
      return {
        success: false,
        error: `Tipo de archivo no permitido: ${archivo.type}. Permitidos: ${tiposPermitidos.join(', ')}`,
      };
    }

    // Validar tamaño
    if (archivo.size > maxTamano) {
      const maxMB = Math.round(maxTamano / 1024 / 1024);
      return {
        success: false,
        error: `El archivo excede el tamaño máximo permitido de ${maxMB} MB`,
      };
    }

    // Generar nombre y ruta
    const nombreArchivo = nombrePersonalizado 
      ? `${nombrePersonalizado}${path.extname(archivo.name).toLowerCase()}`
      : generarNombreUnico(archivo.name);
    
    const carpetaFecha = obtenerCarpetaFecha();
    const rutaRelativa = path.join('uploads', carpeta, carpetaFecha);
    const rutaAbsoluta = path.join(process.cwd(), 'public', rutaRelativa);
    
    // Asegurar que el directorio existe
    await asegurarDirectorio(rutaAbsoluta);

    // Convertir archivo a buffer y guardar
    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const rutaCompleta = path.join(rutaAbsoluta, nombreArchivo);
    await writeFile(rutaCompleta, buffer);

    // Generar URL pública
    const url = `/${rutaRelativa.replace(/\\/g, '/')}/${nombreArchivo}`;

    return {
      success: true,
      url,
      nombreArchivo,
      tamano: archivo.size,
      tipo: archivo.type,
    };

  } catch (error) {
    console.error('Error subiendo archivo:', error);
    return {
      success: false,
      error: 'Error interno al subir el archivo',
    };
  }
}

/**
 * Sube múltiples archivos
 */
export async function subirArchivos(
  archivos: File[],
  opciones: OpcionesSubida = {}
): Promise<ResultadoSubida[]> {
  const resultados = await Promise.all(
    archivos.map(archivo => subirArchivo(archivo, opciones))
  );
  return resultados;
}

/**
 * Valida un archivo sin subirlo
 */
export function validarArchivo(
  archivo: File,
  opciones: OpcionesSubida = {}
): { valido: boolean; error?: string } {
  const {
    tiposPermitidos = TIPOS_PERMITIDOS.todos,
    maxTamano = LIMITES_TAMANO.default,
  } = opciones;

  if (tiposPermitidos.length > 0 && !tiposPermitidos.includes(archivo.type)) {
    return {
      valido: false,
      error: `Tipo de archivo no permitido: ${archivo.type}`,
    };
  }

  if (archivo.size > maxTamano) {
    const maxMB = Math.round(maxTamano / 1024 / 1024);
    return {
      valido: false,
      error: `El archivo excede el tamaño máximo de ${maxMB} MB`,
    };
  }

  return { valido: true };
}

/**
 * Obtiene la extensión de un MIME type
 */
export function obtenerExtension(mimeType: string): string {
  const extensiones: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  };
  return extensiones[mimeType] || '';
}

/**
 * Formatea el tamaño de archivo para mostrar
 */
export function formatearTamano(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
