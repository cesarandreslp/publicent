import { Resend } from "resend"

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

const emailFrom = process.env.EMAIL_FROM || "noreply@personeria-buga.gov.co"
const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

export async function sendPasswordResetEmail(email: string, token: string, nombre: string) {
  const resetLink = `${appUrl}/restablecer-contrasena?token=${token}`
  const resend = getResend()

  try {
    const { data, error } = await resend.emails.send({
      from: `Personería Municipal <${emailFrom}>`,
      to: email,
      subject: "Recuperación de contraseña - Personería Municipal de Guadalajara de Buga",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #003366 0%, #002244 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Personería Municipal</h1>
            <p style="color: #D4AF37; margin: 5px 0 0 0; font-size: 14px;">Guadalajara de Buga</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #003366; margin-top: 0;">Recuperación de Contraseña</h2>
            
            <p>Hola <strong>${nombre}</strong>,</p>
            
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el sistema de la Personería Municipal de Guadalajara de Buga.</p>
            
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
            <p>Personería Municipal de Guadalajara de Buga</p>
            <p>Calle 7 N° 12-45, Guadalajara de Buga, Valle del Cauca</p>
            <p>Tel: (602) 2017004</p>
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

export async function sendWelcomeEmail(email: string, nombre: string) {
  const resend = getResend()
  
  try {
    const { data, error } = await resend.emails.send({
      from: `Personería Municipal <${emailFrom}>`,
      to: email,
      subject: "Bienvenido al Sistema - Personería Municipal de Guadalajara de Buga",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #003366 0%, #002244 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Personería Municipal</h1>
            <p style="color: #D4AF37; margin: 5px 0 0 0; font-size: 14px;">Guadalajara de Buga</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #003366; margin-top: 0;">¡Bienvenido!</h2>
            
            <p>Hola <strong>${nombre}</strong>,</p>
            
            <p>Tu cuenta ha sido creada exitosamente en el sistema de administración de la Personería Municipal de Guadalajara de Buga.</p>
            
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
            <p>Personería Municipal de Guadalajara de Buga</p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Error al enviar el email" }
  }
}
