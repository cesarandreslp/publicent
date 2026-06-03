import nodemailer, { type Transporter } from "nodemailer"
import { getIdentidadPublica } from "./identidad-publica"

// Inicialización diferida del transporte SMTP para evitar errores en build.
let transporter: Transporter | null = null

/**
 * Transporte SMTP genérico (Nodemailer). Funciona con cualquier proveedor:
 * correo institucional (Google Workspace / Microsoft 365), Brevo, SES SMTP, etc.
 *
 * Variables requeridas:
 *  - SMTP_HOST   (ej. smtp.gmail.com, smtp.office365.com)
 *  - SMTP_USER   (cuenta autenticada)
 *  - SMTP_PASS   (contraseña o app password)
 *  - SMTP_PORT   (opcional; 587 STARTTLS por defecto, 465 SSL)
 */
function getTransport(): Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const port = Number(process.env.SMTP_PORT || 587)
    if (!host || !user || !pass) {
      throw new Error("SMTP no configurado: faltan SMTP_HOST, SMTP_USER y/o SMTP_PASS")
    }
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = SSL; 587 = STARTTLS
      auth: { user, pass },
    })
  }
  return transporter
}

// Remitente por defecto: EMAIL_FROM → la propia cuenta SMTP → genérico.
const defaultEmailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@example.gov.co"
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
 * Construye el sender "From" usando la identidad institucional.
 * Prioridad: emailFromName/emailFromAddress configurados → env EMAIL_FROM → fallback genérico.
 */
function buildFrom(id: { nombreCorto: string; emailFromName: string | null; emailFromAddress: string | null }): string {
  const displayName = id.emailFromName || id.nombreCorto
  const address = id.emailFromAddress || defaultEmailFrom
  return `${displayName} <${address}>`
}

export async function sendPasswordResetEmail(email: string, token: string, nombre: string) {
  const id = await getIdentidadPublica()
  const safeNombre = escapeHtml(nombre)
  const safeToken = encodeURIComponent(token)
  const resetLink = `${appUrl}/restablecer-contrasena?token=${safeToken}`
  const transport = getTransport()

  const safeNombreCompleto = escapeHtml(id.nombreCompleto)
  const safeNombreCorto = escapeHtml(id.nombreCorto)
  const safeCiudadDepto = id.ciudadDepto ? escapeHtml(id.ciudadDepto) : null
  const safeDireccion = id.direccionPrincipal ? escapeHtml(id.direccionPrincipal) : null
  const safeTelefono = id.telefonoConmutador ? escapeHtml(id.telefonoConmutador) : null

  try {
    const data = await transport.sendMail({
      from: buildFrom(id),
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
  const transport = getTransport()

  const safeNombreCompleto = escapeHtml(id.nombreCompleto)
  const safeNombreCorto = escapeHtml(id.nombreCorto)
  const safeCiudadDepto = id.ciudadDepto ? escapeHtml(id.ciudadDepto) : null

  try {
    const data = await transport.sendMail({
      from: buildFrom(id),
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

export async function sendMail(opts: { to: string | string[]; subject: string; html: string; from?: string }) {
  const transport = getTransport()
  let from = opts.from
  if (!from) {
    const id = await getIdentidadPublica()
    from = buildFrom(id)
  }
  const info = await transport.sendMail({
    from,
    to:   opts.to,
    subject: opts.subject,
    html:    opts.html,
  })
  return info
}
