/**
 * VU - BlobStorage Service
 *
 * Adapter sobre lib/storage.ts (multi-proveedor: S3/MinIO/R2/GCS/Azure/SFTP/local).
 * Conserva la API original del servicio de ventanilla_unica_base para no romper
 * llamadores existentes, pero internamente usa el storage del tenant configurado
 * en personeriabuga.
 */

import { uploadFile as storageUpload, deleteFile as storageDelete } from '@/lib/storage'
import { getTenantModulos } from '@/lib/tenant'
import { getStorageConfig } from '@/lib/modules'

interface UploadFileParams {
  file: File
  folder?: string
  caseId?: string
}

interface UploadResult {
  success: boolean
  url?: string
  error?: string
  metadata?: {
    filename: string
    size: number
    contentType: string
    uploadedAt: Date
  }
}

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'audio/mpeg',
  'audio/mp3',
  'video/mp4',
]

export class BlobStorageService {
  /**
   * Sube un archivo al storage configurado para el tenant actual.
   */
  async uploadFile({ file, folder = 'general', caseId }: UploadFileParams): Promise<UploadResult> {
    try {
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `El archivo excede el tamano maximo de ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        }
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return {
          success: false,
          error: 'Tipo de archivo no permitido. Solo PDF, Word, imagenes, audio MP3 y video MP4',
        }
      }

      // Resolver storage del tenant
      const modulos = await getTenantModulos()
      const cfg = getStorageConfig(modulos)

      const subFolder = caseId ? `${folder}/${caseId}` : folder
      const buffer = Buffer.from(await file.arrayBuffer())

      const result = await storageUpload(cfg, buffer, file.name, file.type, subFolder)

      return {
        success: true,
        url: result.url,
        metadata: {
          filename: file.name,
          size: file.size,
          contentType: file.type,
          uploadedAt: new Date(),
        },
      }
    } catch (error) {
      console.error('[VU/BlobStorage] error subiendo archivo:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al subir archivo',
      }
    }
  }

  /**
   * Elimina un archivo del storage del tenant.
   * Espera la clave/key del objeto (no la URL).
   */
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const modulos = await getTenantModulos()
      const cfg = getStorageConfig(modulos)
      await storageDelete(cfg, key)
      return { success: true }
    } catch (error) {
      console.error('[VU/BlobStorage] error eliminando archivo:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar archivo',
      }
    }
  }

  /**
   * Lista archivos. No se implementa porque los proveedores tienen APIs
   * distintas; conservar firma para compatibilidad.
   */
  async listFiles(): Promise<{ success: boolean; files?: unknown[]; error?: string }> {
    return { success: true, files: [] }
  }

  /**
   * Valida un archivo segun los limites del modulo.
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `El archivo excede el tamano maximo de ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      }
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Tipo de archivo no permitido' }
    }
    return { valid: true }
  }
}

export const blobStorageService = new BlobStorageService()
