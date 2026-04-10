/**
 * storage.ts — Helper de almacenamiento multi-proveedor
 *
 * Abstracción unificada para subir, eliminar y generar URLs de archivos.
 * El proveedor se configura por tenant desde el panel de superadmin.
 *
 * Proveedores soportados:
 *  - s3       → AWS S3
 *  - minio    → MinIO (self-hosted, S3-compatible)
 *  - r2       → Cloudflare R2 (S3-compatible)
 *  - gcs      → Google Cloud Storage (via S3-compatible API)
 *  - azure    → Azure Blob Storage (via S3-compatible endpoint)
 *  - sftp     → Servidor SFTP/SSH propio
 *  - local    → Disco local (solo desarrollo)
 */

import path from "path"
import { writeFile, mkdir, unlink } from "fs/promises"
import type { StorageConfig, StorageProvider } from "@/lib/modules"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface UploadResult {
  /** URL pública o ruta de acceso al archivo subido */
  url: string
  /** Clave/path relativo dentro del storage */
  key: string
  /** Tamaño del archivo en bytes */
  size: number
}

// ─── S3 / S3-Compatible (AWS, MinIO, R2, GCS, Azure Blob) ────────────────────

async function uploadToS3Compatible(
  cfg: StorageConfig,
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")

  const client = new S3Client({
    region: cfg.region || "auto",
    endpoint: cfg.endpoint,
    credentials: cfg.accessKeyId && cfg.secretAccessKey
      ? { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey }
      : undefined,
    forcePathStyle: cfg.provider === "minio", // MinIO requiere path-style
  })

  await client.send(new PutObjectCommand({
    Bucket: cfg.bucket!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // Hacerlo público por defecto (ACL puede no estar disponible en todos los proveedores)
    // ACL: "public-read",
  }))

  // Construir URL pública
  let url: string
  if (cfg.publicBaseUrl) {
    url = `${cfg.publicBaseUrl.replace(/\/$/, "")}/${key}`
  } else if (cfg.endpoint) {
    url = `${cfg.endpoint.replace(/\/$/, "")}/${cfg.bucket}/${key}`
  } else {
    // AWS S3 estándar
    url = `https://${cfg.bucket}.s3.${cfg.region || "us-east-1"}.amazonaws.com/${key}`
  }

  return { url, key, size: buffer.length }
}

// ─── SFTP ─────────────────────────────────────────────────────────────────────

async function uploadToSftp(
  cfg: StorageConfig,
  buffer: Buffer,
  key: string
): Promise<UploadResult> {
  const SftpClient = (await import("ssh2-sftp-client")).default
  const sftp = new SftpClient()

  const host = cfg.sftpHost!
  const port = parseInt(cfg.sftpPort || "22")
  const basePath = cfg.sftpBasePath?.replace(/\/$/, "") || "/uploads"
  const remotePath = `${basePath}/${key}`

  await sftp.connect({ host, port, username: cfg.sftpUser, password: cfg.sftpPassword })

  // Crear directorios intermedios si no existen
  const remoteDir = path.dirname(remotePath)
  await sftp.mkdir(remoteDir, true).catch(() => {})

  await sftp.put(buffer, remotePath)
  await sftp.end()

  const url = cfg.publicBaseUrl
    ? `${cfg.publicBaseUrl.replace(/\/$/, "")}/${key}`
    : `sftp://${host}${remotePath}`

  return { url, key, size: buffer.length }
}

// ─── Local (solo desarrollo) ──────────────────────────────────────────────────

async function uploadToLocal(
  cfg: StorageConfig,
  buffer: Buffer,
  key: string
): Promise<UploadResult> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", cfg.prefix || "")
  const filePath = path.join(uploadDir, key)
  const fileDir = path.dirname(filePath)

  await mkdir(fileDir, { recursive: true })
  await writeFile(filePath, buffer)

  const url = `/uploads/${cfg.prefix || ""}${key}`.replace(/\/+/g, "/")
  return { url, key, size: buffer.length }
}

// ─── Eliminar archivo ─────────────────────────────────────────────────────────

export async function deleteFile(cfg: StorageConfig, key: string): Promise<void> {
  const provider: StorageProvider = cfg.provider

  if (provider === "local") {
    const filePath = path.join(process.cwd(), "public", "uploads", key)
    await unlink(filePath).catch(() => {})
    return
  }

  if (["s3", "minio", "r2", "gcs", "azure"].includes(provider)) {
    const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3")
    const client = new S3Client({
      region: cfg.region || "auto",
      endpoint: cfg.endpoint,
      credentials: cfg.accessKeyId && cfg.secretAccessKey
        ? { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey }
        : undefined,
      forcePathStyle: provider === "minio",
    })
    await client.send(new DeleteObjectCommand({ Bucket: cfg.bucket!, Key: key }))
    return
  }

  if (provider === "sftp") {
    const SftpClient = (await import("ssh2-sftp-client")).default
    const sftp = new SftpClient()
    const basePath = cfg.sftpBasePath?.replace(/\/$/, "") || "/uploads"
    await sftp.connect({ host: cfg.sftpHost!, port: parseInt(cfg.sftpPort || "22"), username: cfg.sftpUser, password: cfg.sftpPassword })
    await sftp.delete(`${basePath}/${key}`).catch(() => {})
    await sftp.end()
  }
}

// ─── Función principal de subida ──────────────────────────────────────────────

/**
 * Sube un archivo al storage configurado por el tenant.
 *
 * @param cfg         Configuración de storage del tenant
 * @param buffer      Contenido del archivo como Buffer
 * @param filename    Nombre original del archivo (ej: "contrato.pdf")
 * @param contentType MIME type (ej: "application/pdf")
 * @param folder      Subcarpeta opcional (ej: "radicados/2026")
 */
export async function uploadFile(
  cfg: StorageConfig,
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder?: string
): Promise<UploadResult> {
  // Sanitizar nombre del archivo
  const safeFilename = filename.replace(/[^a-zA-Z0-9._\-]/g, "_")
  const timestamp = Date.now()
  const uniqueName = `${timestamp}_${safeFilename}`

  // Construir clave completa
  const prefix = cfg.prefix?.replace(/\/$/, "") || "documentos"
  const subFolder = folder ? `/${folder}` : ""
  const key = `${prefix}${subFolder}/${uniqueName}`

  const provider: StorageProvider = cfg.provider

  switch (provider) {
    case "s3":
    case "minio":
    case "r2":
    case "gcs":
    case "azure":
      return uploadToS3Compatible(cfg, buffer, key, contentType)
    case "sftp":
      return uploadToSftp(cfg, buffer, key)
    case "local":
    default:
      return uploadToLocal(cfg, buffer, key)
  }
}

/**
 * Genera una URL pre-firmada para descarga directa (solo S3-compatible).
 * Para otros proveedores, retorna la URL pública directamente.
 */
export async function getPresignedUrl(
  cfg: StorageConfig,
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const provider: StorageProvider = cfg.provider

  if (["s3", "minio", "r2", "gcs", "azure"].includes(provider)) {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3")
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner")

    const client = new S3Client({
      region: cfg.region || "auto",
      endpoint: cfg.endpoint,
      credentials: cfg.accessKeyId && cfg.secretAccessKey
        ? { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey }
        : undefined,
      forcePathStyle: provider === "minio",
    })

    return getSignedUrl(client, new GetObjectCommand({ Bucket: cfg.bucket!, Key: key }), { expiresIn: expiresInSeconds })
  }

  // Para SFTP y local, retornar la URL pública directamente
  const base = cfg.publicBaseUrl?.replace(/\/$/, "") || ""
  return `${base}/${key}`
}

/**
 * Verifica la conectividad con el storage configurado.
 * Útil para el botón "Probar conexión" en el panel de configuración.
 */
export async function testStorageConnection(cfg: StorageConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const provider: StorageProvider = cfg.provider

    if (provider === "local") {
      return { ok: true, message: "Almacenamiento local disponible" }
    }

    if (["s3", "minio", "r2", "gcs", "azure"].includes(provider)) {
      const { S3Client, HeadBucketCommand } = await import("@aws-sdk/client-s3")
      const client = new S3Client({
        region: cfg.region || "auto",
        endpoint: cfg.endpoint,
        credentials: cfg.accessKeyId && cfg.secretAccessKey
          ? { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey }
          : undefined,
        forcePathStyle: provider === "minio",
      })
      await client.send(new HeadBucketCommand({ Bucket: cfg.bucket! }))
      return { ok: true, message: `Bucket "${cfg.bucket}" accesible` }
    }

    if (provider === "sftp") {
      const SftpClient = (await import("ssh2-sftp-client")).default
      const sftp = new SftpClient()
      await sftp.connect({ host: cfg.sftpHost!, port: parseInt(cfg.sftpPort || "22"), username: cfg.sftpUser, password: cfg.sftpPassword })
      await sftp.end()
      return { ok: true, message: `Servidor SFTP ${cfg.sftpHost} accesible` }
    }

    return { ok: false, message: "Proveedor no reconocido" }
  } catch (err: any) {
    return { ok: false, message: err?.message ?? "Error de conexión" }
  }
}
