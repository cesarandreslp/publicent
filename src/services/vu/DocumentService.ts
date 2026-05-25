/**
 * VU - Document Service
 *
 * Gestiona los documentos del modulo Ventanilla Unica asociados a un PQRS.
 * Usa el modelo VuDocumento (distinto de `Documento` transversal y de
 * `GdDocumento` de Orfeo) y delega la persistencia binaria en
 * `BlobStorageService` (lib/storage.ts del proyecto).
 */

import { getTenantPrisma } from '@/lib/tenant'
import { VuTipoDocumento } from '@prisma/client'
import { auditService } from './AuditService'
import { blobStorageService } from './BlobStorageService'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'audio/mpeg',
  'audio/mp3',
  'video/mp4',
]
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

export interface UploadDocumentInput {
  file: File
  caseId: string                 // pqrsId
  userId: string | null          // null para ciudadanos
  userEmail: string
  userRole: string
  documentType?: VuTipoDocumento
  description?: string
  isInternal?: boolean
  ipAddress?: string
  userAgent?: string
}

export class DocumentService {
  private validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `Archivo muy grande. Maximo ${MAX_FILE_SIZE / 1024 / 1024} MB` }
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: 'Tipo no permitido. PDF, DOCX, JPG, PNG, MP3 o MP4' }
    }
    return { valid: true }
  }

  /**
   * Sube un documento al storage del tenant y guarda metadata en BD.
   */
  async uploadDocument(input: UploadDocumentInput): Promise<{
    success: boolean
    document?: { id: string; fileName: string; fileUrl: string; fileSize: number }
    error?: string
  }> {
    try {
      const validation = this.validateFile(input.file)
      if (!validation.valid) return { success: false, error: validation.error }

      const upload = await blobStorageService.uploadFile({
        file: input.file,
        folder: 'vu/casos',
        caseId: input.caseId,
      })
      if (!upload.success || !upload.url) {
        return { success: false, error: upload.error || 'Error al subir archivo' }
      }

      const prisma = await getTenantPrisma()
      const doc = await prisma.vuDocumento.create({
        data: {
          pqrsId: input.caseId,
          fileName: upload.metadata?.filename ?? input.file.name,
          originalName: input.file.name,
          mimeType: input.file.type,
          fileSize: input.file.size,
          fileUrl: upload.url,
          documentType: input.documentType ?? VuTipoDocumento.OTRO,
          descripcion: input.description,
          esInterno: input.isInternal ?? false,
          subidoPorId: input.userId,
          subidoPorTipo: input.userRole === 'CITIZEN' || input.userRole === 'CIUDADANO' ? 'CITIZEN' : 'USER',
        },
      })

      await auditService.logDocumentUploaded(
        doc.id,
        input.userId ?? 'citizen',
        input.userEmail,
        input.userRole,
        '',
        {
          caseId: input.caseId,
          fileName: input.file.name,
          fileSize: input.file.size,
          mimeType: input.file.type,
          documentType: doc.documentType,
        },
      )

      return {
        success: true,
        document: { id: doc.id, fileName: doc.fileName, fileUrl: doc.fileUrl, fileSize: doc.fileSize },
      }
    } catch (error) {
      console.error('[VU/Document] error subiendo:', error)
      return { success: false, error: 'Error al subir documento' }
    }
  }

  async getDocument(documentId: string) {
    try {
      const prisma = await getTenantPrisma()
      const doc = await prisma.vuDocumento.findUnique({
        where: { id: documentId },
        include: {
          pqrs: { select: { id: true, radicado: true } },
        },
      })
      if (!doc) return { success: false, error: 'Documento no encontrado' }
      return { success: true, document: doc }
    } catch (error) {
      console.error('[VU/Document] error obteniendo:', error)
      return { success: false, error: 'Error al obtener documento' }
    }
  }

  async listDocumentsByCase(caseId: string) {
    try {
      const prisma = await getTenantPrisma()
      const documents = await prisma.vuDocumento.findMany({
        where: { pqrsId: caseId },
        orderBy: { createdAt: 'desc' },
      })
      return { success: true, documents }
    } catch (error) {
      console.error('[VU/Document] error listando:', error)
      return { success: false, error: 'Error al listar documentos', documents: [] }
    }
  }

  async deleteDocument(documentId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const prisma = await getTenantPrisma()
      const doc = await prisma.vuDocumento.findUnique({ where: { id: documentId } })
      if (!doc) return { success: false, error: 'Documento no encontrado' }

      // Intentar borrar del storage usando fileKey (si lo guardamos) o la URL completa
      if (doc.fileKey) {
        await blobStorageService.deleteFile(doc.fileKey).catch(() => undefined)
      }

      await prisma.vuDocumento.delete({ where: { id: documentId } })

      await auditService.log({
        action: 'DOCUMENT_DELETED',
        userId,
        userEmail: '',
        userRole: '',
        tenantId: null,
        entityType: 'VuDocumento',
        entityId: documentId,
        ipAddress: 'system',
        userAgent: 'system',
        metadata: { caseId: doc.pqrsId, fileName: doc.fileName },
      })

      return { success: true }
    } catch (error) {
      console.error('[VU/Document] error eliminando:', error)
      return { success: false, error: 'Error al eliminar documento' }
    }
  }
}

export const documentService = new DocumentService()
