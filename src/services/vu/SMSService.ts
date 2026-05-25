/**
 * VU - SMS Service
 *
 * Servicio de envio de SMS (stub para integracion futura con proveedor).
 * Portado desde ventanilla_unica_base sin cambios estructurales.
 *
 * TODO: integrar con Twilio o proveedor SMS colombiano cuando se requiera.
 */

export class SMSService {
  /**
   * Envia un SMS (stub para futuro).
   */
  static async sendSMS(params: {
    to: string
    message: string
  }): Promise<boolean> {
    console.log('[VU/SMS] Preparando envio...')
    console.log('[VU/SMS] Destinatario:', params.to)
    console.log('[VU/SMS] Mensaje:', params.message)

    // TODO: integracion real con Twilio.
    // const client = twilio(process.env.SMS_ACCOUNT_SID, process.env.SMS_AUTH_TOKEN)
    // await client.messages.create({
    //   body: params.message,
    //   from: process.env.SMS_FROM_NUMBER,
    //   to: params.to,
    // })

    console.log('[VU/SMS] Simulando envio exitoso (stub)')
    return true
  }

  /**
   * Valida configuracion SMS.
   */
  static validateConfiguration(): boolean {
    return true
  }

  /**
   * Formatea numero de telefono para Colombia (codigo de pais 57).
   */
  static formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '')
    if (!cleaned.startsWith('57')) {
      cleaned = '57' + cleaned
    }
    return '+' + cleaned
  }
}
