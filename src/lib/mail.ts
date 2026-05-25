import { Resend } from "resend"
import { getIdentidadPublica } from "./identidad-publica"

// Inicialización diferida de Resend para evitar errores en build
let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY no está configurada en las variables de entorno")
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

const defaultEmailFrom = process.env.EMAIL_FROM || "noreply@example.gov.co"
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
  const resend = getResend()

  const safeNombreCompleto = escapeHtml(id.nombreCompleto)
  const safeNombreCorto = escapeHtml(id.nombreCorto)
  const safeCiudadDepto = id.ciudadDepto ? escapeHtml(id.ciudadDepto) : null
  const safeDireccion = id.direccionPrincipal ? escapeHtml(id.direccionPrincipal) : null
  const safeTelefono = id.telefonoConmutador ? escapeHtml(id.telefonoConmutador) : null

  try {
    const { data, error } = await resend.emails.send({
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

    if (error) {
      console.error("Error enviando email:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error enviando email:", error)
    return { success: false, error: "Error al enviar el email" }
  }
}

export async function sendWelcomeEmail(email: string, nombreRaw: string) {
  const id = await getIdentidadPublica()
  const nombre = escapeHtml(nombreRaw)
  const resend = getResend()

  const safeNombreCompleto = escapeHtml(id.nombreCompleto)
  const safeNombreCorto = escapeHtml(id.nombreCorto)
  const safeCiudadDepto = id.ciudadDepto ? escapeHtml(id.ciudadDepto) : null

  try {
    const { data, error } = await resend.emails.send({
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

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch {
    return { success: false, error: "Error al enviar el email" }
  }
}

export async function sendMail(opts: { to: string | string[]; subject: string; html: string; from?: string }) {
  const resend = getResend()
  let from = opts.from
  if (!from) {
    const id = await getIdentidadPublica()
    from = buildFrom(id)
  }
  const { data, error } = await resend.emails.send({
    from,
    to:   opts.to,
    subject: opts.subject,
    html:    opts.html,
  })
  if (error) throw new Error(error.message)
  return data
}
