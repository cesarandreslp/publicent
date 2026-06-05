/**
 * encryption.ts — Cifrado simétrico AES-256-GCM
 *
 * Usado para guardar secretos por tenant en la meta-DB (API keys, contraseñas SMTP, etc.)
 * La clave maestra se lee de SECRETS_ENCRYPTION_KEY (env del servidor).
 *
 * Formato del texto cifrado: "<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 *
 * Generar clave con: openssl rand -hex 32
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12   // 96 bits recomendado para GCM
const TAG_LENGTH = 16  // 128 bits

function getMasterKey(): Buffer {
  const raw = process.env.SECRETS_ENCRYPTION_KEY
  if (!raw) {
    throw new Error(
      '[encryption] SECRETS_ENCRYPTION_KEY no definida. ' +
      'Generar con: openssl rand -hex 32'
    )
  }
  const buf = Buffer.from(raw, 'hex')
  if (buf.length !== 32) {
    throw new Error('[encryption] SECRETS_ENCRYPTION_KEY debe ser exactamente 32 bytes (64 chars hex)')
  }
  return buf
}

/**
 * Cifra un string con AES-256-GCM.
 * @returns "<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 */
export function encrypt(plaintext: string): string {
  const key = getMasterKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

/**
 * Descifra un string cifrado con encrypt().
 * Lanza si el ciphertext es inválido o fue alterado (autenticación GCM).
 */
export function decrypt(ciphertext: string): string {
  const key = getMasterKey()
  const parts = ciphertext.split(':')
  if (parts.length !== 3) {
    throw new Error('[encryption] Formato de ciphertext inválido')
  }
  const [ivHex, tagHex, dataHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const data = Buffer.from(dataHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })
  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}

// ─── Secretos por tenant ───────────────────────────────────────────────────────

export interface TenantSecretos {
  groqApiKey?:     string  // Groq — clasificación PQRSD y funcionalidades IA del tenant
  shipuApiKey?:    string  // Shipu z.ai — proveedor de respaldo si Groq no responde
  smtpPassword?:   string  // (legacy) — usar el bloque `smtp` para nuevas configuraciones
  sftpPassword?:   string
  r2SecretKey?:    string
  /** Configuración de correo SMTP propia del tenant (correo institucional). */
  smtp?: {
    host: string
    port: number
    user: string
    pass: string
    from?: string  // remitente; si falta se usa `user`
  }
  /**
   * Configuración de WhatsApp (Meta Cloud API) del tenant.
   * Se usa para notificar a ciudadanos de PQRSD / Ventanilla Única.
   */
  whatsapp?: {
    phoneNumberId: string   // ID del número emisor en Meta
    accessToken:   string   // token de acceso (permanente o de sistema)
    fromPhone:     string   // número emisor en formato legible (display)
  }
  /**
   * Credenciales OAuth del conector SECOP II (Colombia Compra Eficiente).
   * Se usa para publicar procesos y contratos en SECOP II automáticamente.
   */
  secop?: {
    clientId:     string   // Client ID de CCE
    clientSecret: string   // Client Secret de CCE
    nit:          string   // NIT de la entidad registrado en SECOP
  }
}

/**
 * Cifra el objeto de secretos de un tenant para guardarlo en la meta-DB.
 */
export function encryptSecretos(secretos: TenantSecretos): string {
  return encrypt(JSON.stringify(secretos))
}

/**
 * Descifra el campo secretosEncriptados de un tenant.
 * Retorna objeto vacío si el campo es null/undefined.
 */
export function decryptSecretos(ciphertext: string | null | undefined): TenantSecretos {
  if (!ciphertext) return {}
  try {
    return JSON.parse(decrypt(ciphertext)) as TenantSecretos
  } catch {
    return {}
  }
}
