/**
 * Sistema de Subida de Archivos
 *
 * Almacena archivos en /private/uploads/ (fuera de /public) para que no sean
 * accesibles directamente desde el navegador sin autenticación.
 * El acceso se hace a través de /api/files/[...path] (autenticado).
 *
 * En producción (Vercel) los archivos deben ir a R2 — ver task #2/#11.
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// ─── Magic bytes de tipos de archivo aceptados ────────────────────────────────
// Valida el contenido real del archivo, no el Content-Type declarado por el cliente.

const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg':    [[0xFF, 0xD8, 0xFF]],
  'image/png':     [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif':     [[0x47, 0x49, 0x46, 0x38]],
  'image/webp':    [[0x52, 0x49, 0x46, 0x46]], // RIFF....WEBP
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  // DOCX, XLSX, ODT son ZIP → mismo magic bytes
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[0x50, 0x4B, 0x03, 0x04]],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':       [[0x50, 0x4B, 0x03, 0x04]],
  'application/msword': [[0xD0, 0xCF, 0x11, 0xE0]], // Compound Document (DOC antiguo)
  'application/vnd.ms-excel': [[0xD0, 0xCF, 0x11, 0xE0]],
}

function validarMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType]
  if (!signatures) return true // Tipo desconocido — se confía en la extensión bloqueada
  return signatures.some(sig => sig.every((byte, i) => buffer[i] === byte))
}

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
    // ⚠️ Guardar en /private/ (fuera de /public) — acceso vía /api/files autenticado
    const rutaAbsoluta = path.join(process.cwd(), 'private', rutaRelativa);
    
    // Asegurar que el directorio existe
    await asegurarDirectorio(rutaAbsoluta);

    // Convertir archivo a buffer
    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validar magic bytes (contenido real vs MIME declarado por el cliente)
    if (!validarMagicBytes(buffer, archivo.type)) {
      return {
        success: false,
        error: `El contenido del archivo no coincide con el tipo declarado (${archivo.type}). Archivo posiblemente alterado.`,
      };
    }

    const rutaCompleta = path.join(rutaAbsoluta, nombreArchivo);
    await writeFile(rutaCompleta, buffer);

    // URL servida por el endpoint autenticado /api/files/... (NO desde /public)
    const url = `/api/files/${rutaRelativa.replace(/\\/g, '/')}/${nombreArchivo}`;

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
