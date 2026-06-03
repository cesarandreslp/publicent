import nodemailer, { type Transporter } from "nodemailer"
import { getIdentidadPublica } from "./identidad-publica"
import { prismaMeta } from "./prisma-meta"
import { decryptSecretos } from "./encryption"

/**
 * Correo SMTP MULTI-TENANT (Nodemailer).
 *
 * Cada tenant configura su propio correo institucional (Google Workspace /
 * Microsoft 365 / hosting propio) desde Superadmin → se guarda cifrado en la
 * meta-DB (Tenant.secretosEncriptados.smtp). Aquí se resuelve por tenant.
 *
 * Fallback a variables de entorno globales (SMTP_HOST/USER/PASS/PORT) solo para
 * desarrollo local o despliegues single-tenant.
 */

interface SmtpConfig { host: string; port: number; user: string; pass: string; from?: string }

// Un transporter por configuración (clave: "tenant:<id>" o "env").
const transportCache = new Map<string, Transporter>()

/** Resuelve la config SMTP del tenant dado (o del actual por headers, o env). */
async function resolveSmtp(tenantId?: string): Promise<{ key: string; cfg: SmtpConfig } | null> {
  let tid = tenantId
  if (!tid) {
    try {
      const { getTenantId } = await import("./tenant")
      tid = await getTenantId()
    } catch { tid = undefined }
  }

  if (tid) {
    try {
      const t = await prismaMeta.tenant.findUnique({
        where: { id: tid },
        select: { secretosEncriptados: true },
      })
      const s = decryptSecretos(t?.secretosEncriptados)
      if (s.smtp?.host && s.smtp?.user && s.smtp?.pass) {
        return {
          key: `tenant:${tid}`,
          cfg: { host: s.smtp.host, port: s.smtp.port || 587, user: s.smtp.user, pass: s.smtp.pass, from: s.smtp.from },
        }
      }
    } catch { /* cae al fallback de env */ }
  }

  // Fallback global (dev / single-tenant)
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS
  if (host && user && pass) {
    return {
      key: "env",
      cfg: { host, port: Number(process.env.SMTP_PORT || 587), user, pass, from: process.env.EMAIL_FROM },
    }
  }
  return null
}

/** Obtiene (y cachea) el transporter + config SMTP para el tenant. */
async function getTransportFor(tenantId?: string): Promise<{ transport: Transporter; cfg: SmtpConfig }> {
  const resolved = await resolveSmtp(tenantId)
  if (!resolved) {
    throw new Error("SMTP no configurado para este tenant ni en variables de entorno")
  }
  let transport = transportCache.get(resolved.key)
  if (!transport) {
    transport = nodemailer.createTransport({
      host: resolved.cfg.host,
      port: resolved.cfg.port,
      secure: resolved.cfg.port === 465, // 465 = SSL; 587 = STARTTLS
      auth: { user: resolved.cfg.user, pass: resolved.cfg.pass },
    })
    transportCache.set(resolved.key, transport)
  }
  return { transport, cfg: resolved.cfg }
}

const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

/** Escapa caracteres HTML para prevenir inyección en emails */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Construye el sender "From".
 * Prioridad de dirección: identidad institucional → remitente SMTP del tenant → usuario SMTP.
 */
function buildFrom(
  id: { nombreCorto: string; emailFromName: string | null; emailFromAddress: string | null },
  cfg?: SmtpConfig,
): string {
  const displayName = id.emailFromName || id.nombreCorto
  const address = id.emailFromAddress || cfg?.from || cfg?.user || "noreply@example.gov.co"
  return `${displayName} <${address}>`
}

export async function sendPasswordResetEmail(email: string, token: string, nombre: string) {
  const id = await getIdentidadPublica()
  const safeNombre = escapeHtml(nombre)
  const safeToken = encodeURIComponent(token)
  const resetLink = `${appUrl}/restablecer-contrasena?token=${safeToken}`
  const { transport, cfg } = await getTransportFor()

  const safeNombreCompleto = escapeHtml(id.nombreCompleto)
  const safeNombreCorto = escapeHtml(id.nombreCorto)
  const safeCiudadDepto = id.ciudadDepto ? escapeHtml(id.ciudadDepto) : null
  const safeDireccion = id.direccionPrincipal ? escapeHtml(id.direccionPrincipal) : null
  const safeTelefono = id.telefonoConmutador ? escapeHtml(id.telefonoConmutador) : null

  try {
    const data = await transport.sendMail({
      from: buildFrom(id, cfg),
      to: email,
      subject: `Recuperación de contraseña - ${id.nombreCompleto}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #003366 0%, #002244 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${safeNombreCorto}</h1>
            ${safeCiudadDepto ? `<p style="color: #D4AF37; margin: 5px 0 0 0; font-size: 14px;">${safeCiudadDepto}</p>` : ""}
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #003366; margin-top: 0;">Recuperación de Contraseña</h2>

            <p>Hola <strong>${safeNombre}</strong>,</p>

            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el sistema de ${safeNombreCompleto}.</p>

            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background: #003366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Restablecer Contraseña
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Este enlace expirará en <strong>1 hora</strong> por motivos de seguridad.
            </p>

            <p style="color: #666; font-size: 14px;">
              Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá sin cambios.
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
            </p>
            <p style="color: #003366; font-size: 12px; word-break: break-all;">
              ${resetLink}
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>${safeNombreCompleto}</p>
            ${safeDireccion || safeCiudadDepto ? `<p>${[safeDireccion, safeCiudadDepto].filter(Boolean).join(", ")}</p>` : ""}
            ${safeTelefono ? `<p>Tel: ${safeTelefono}</p>` : ""}
          </div>
        </body>
        </html>
      `,
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error enviando email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al enviar el email" }
  }
}

export async function sendWelcomeEmail(email: string, nombreRaw: string) {
  const id = await getIdentidadPublica()
  const nombre = escapeHtml(nombreRaw)
  const { transport, cfg } = await getTransportFor()

  const safeNombreCompleto = escapeHtml(id.nombreCompleto)
  const safeNombreCorto = escapeHtml(id.nombreCorto)
  const safeCiudadDepto = id.ciudadDepto ? escapeHtml(id.ciudadDepto) : null

  try {
    const data = await transport.sendMail({
      from: buildFrom(id, cfg),
      to: email,
      subject: `Bienvenido al Sistema - ${id.nombreCompleto}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #003366 0%, #002244 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${safeNombreCorto}</h1>
            ${safeCiudadDepto ? `<p style="color: #D4AF37; margin: 5px 0 0 0; font-size: 14px;">${safeCiudadDepto}</p>` : ""}
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #003366; margin-top: 0;">¡Bienvenido!</h2>

            <p>Hola <strong>${nombre}</strong>,</p>

            <p>Tu cuenta ha sido creada exitosamente en el sistema de administración de ${safeNombreCompleto}.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/login" style="display: inline-block; background: #003366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Iniciar Sesión
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>${safeNombreCompleto}</p>
          </div>
        </body>
        </html>
      `,
    })

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al enviar el email" }
  }
}

/**
 * Envía un correo usando la config SMTP del tenant.
 * @param opts.tenantId  Obligatorio fuera de una request (p. ej. crons), donde no
 *                       hay headers para resolver el tenant actual.
 */
export async function sendMail(opts: {
  to: string | string[]
  subject: string
  html: string
  from?: string
  tenantId?: string
}) {
  const { transport, cfg } = await getTransportFor(opts.tenantId)
  let from = opts.from
  if (!from) {
    const id = await getIdentidadPublica()
    from = buildFrom(id, cfg)
  }
  const info = await transport.sendMail({
    from,
    to:   opts.to,
    subject: opts.subject,
    html:    opts.html,
  })
  return info
}
