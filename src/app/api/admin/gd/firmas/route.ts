import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { createHash } from "crypto"
import { uploadFile } from "@/lib/storage"
import { resolveModulosConfig } from "@/lib/modules"
import { prismaMeta } from "@/lib/prisma-meta"
import { generarNumeroRadicado } from "@/lib/gd-consecutivo"
import { gdFirmaSchema, validateBody } from "@/lib/validations"

export async function POST(req: Request) {
  const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError

  const body = await req.json()
    const validated = validateBody(gdFirmaSchema, body)
    if (!validated.success) return validated.response
  const { radicadoOrigenId, asunto, contenidoHtml, trd } = body

  if (!radicadoOrigenId || !asunto || !contenidoHtml || !trd.dependenciaId) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
  }

  const prisma = await getTenantPrisma()

  // 1. Obtener Radicado Origen (para usar sus remitentes como destinatarios)
  const origen = await prisma.gdRadicado.findUnique({
    where: { id: radicadoOrigenId },
    include: { remitentes: true }
  })
  if (!origen) return NextResponse.json({ error: "Radicado origen no encontrado" }, { status: 404 })

  // 2. Generar el número de Radicado de SALIDA
  const fecha = new Date()
  const tipo = "SALIDA"
  
  // Obtenemos dependencia para el código (usado en el consecutivo)
  const dep = await prisma.gdTrdDependencia.findUnique({ where: { id: trd.dependenciaId } })
  if (!dep) return NextResponse.json({ error: "Dependencia no válida" }, { status: 400 })

  const numeroRadicado = await generarNumeroRadicado(tipo as any, dep.codigo)

  // 3. Crear el Radicado de Salida
  const nuevoRadicado = await prisma.gdRadicado.create({
    data: {
      numero: numeroRadicado,
      tipo: tipo,
      medioRecepcion: "WEB",
      asunto: asunto,
      folios: 1, // El documento generado es el folio 1 principal
      radicadoOrigen: origen.numero,
      estado: "RADICADO",
      tramitadorId: user!.id,
      creadorId: user!.id,
      dependenciaId: trd.dependenciaId,
      subserieId: trd.subserieId,
      tipoDocumentalId: trd.tipoDocumentalId,
      // Los destinatarios son los mismos que enviaron la PQRS original
      remitentes: {
        create: origen.remitentes.map(r => ({
          tipoPersona: r.tipoPersona,
          nombre: r.nombre,
          documento: r.documento,
          email: r.email,
          telefono: r.telefono,
          direccion: r.direccion,
          municipio: r.municipio
        }))
      },
      // Dejamos tracking de la operación
      transacciones: {
        create: {
          accion: "RADICACION",
          descripcion: `Documento de salida electrónico generado en respuesta al radicado ${origen.numero}`,
          usuarioId: user!.id,
          estadoNuevo: "RADICADO"
        }
      }
    }
  })

  // 4. Transformar HTML a Buffer y guardarlo al Storage Cloud
  const hostname = req.headers.get("host") || ""
  const hashObj = createHash("sha256").update(contenidoHtml).digest("hex")
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${hostname}`
  const urlVerificacion = `${siteUrl}/verificar?hash=${hashObj}`

  // Generación Código QR Base64
  const QRCode = (await import("qrcode")).default
  const qrDataURL = await QRCode.toDataURL(urlVerificacion, { margin: 1, width: 200, color: { dark: '#1e3a8a', light: '#ffffff' } })

  const documentoFinalHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Radicado de Salida N° ${numeroRadicado}</title>
  <style>
    body { font-family: 'Arial', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; line-height: 1.6; }
    .content { min-height: 600px; }
    .firma-footer { margin-top: 50px; border-top: 2px dashed #ccc; padding-top: 20px; text-align: center; }
    .hash { font-family: monospace; font-size: 11px; background: #f4f4f4; padding: 5px; border-radius: 4px; display: inline-block; word-break: break-all; margin-top: 5px; max-width: 100%; }
    .firma-info p { margin: 2px 0; font-size: 12px; color: #555; }
    .qr-container img { border: 1px solid #eee; border-radius: 8px; padding: 5px; }
  </style>
</head>
<body>
  <div class="content">
    ${contenidoHtml}
  </div>
  
  <div class="firma-footer">
    <div class="qr-container">
      <img src="${qrDataURL}" alt="QR Verificación" width="100" />
    </div>
    <div class="firma-info">
      <p style="font-size:14px; color:#1e3a8a"><strong>FIRMADO ELECTRÓNICAMENTE</strong></p>
      <p>Entidad: <strong>Personería Mpal. de Guadalajara de Buga</strong></p>
      <p>Radicado Oficial N°: <strong>${numeroRadicado}</strong></p>
      <p>Certificación de Integridad SHA-256:</p>
      <div class="hash">${hashObj}</div>
      <p style="margin-top:10px;"><small>Verifique la autenticidad escaneando este código o en:<br><a href="${urlVerificacion}">${urlVerificacion}</a></small></p>
    </div>
  </div>
</body>
</html>
  `
  
  const htmlBuffer = Buffer.from(documentoFinalHtml, "utf-8")
  
  // Obtenemos config del tenant para el storage
  const t = await (prismaMeta.tenant as any).findFirst({ where: { dominios: { has: hostname } } })
  const tenant = t || (await prismaMeta.tenant.findFirst()) // fallback local
  const modulos = resolveModulosConfig(tenant!.modulosActivos)
  const storageCfg = modulos.gestion_documental.storage ?? { provider: "local", prefix: "documentos/", publicBaseUrl: "" }

  const nombreArchivo = `${numeroRadicado}-oficial.html`
  const resultUpload = await uploadFile(
    storageCfg,
    htmlBuffer,
    nombreArchivo,
    "text/html",
    `radicados/${fecha.getFullYear()}/${nuevoRadicado.id}`
  )

  // 5. DB: Registrar Documento y su firma
  const doc = await prisma.gdDocumento.create({
    data: {
      nombre: "Documento Integrado Oficial (Copia de Autenticidad)",
      archivoUrl: resultUpload.url,
      esPrincipal: true,
      folios: 1,
      radicadoId: nuevoRadicado.id,
      subidoPorId: user!.id,
      firmaQr: {
        create: {
          hashFirma: hashObj,
          urlVerificacion: urlVerificacion,
          firmanteId: user!.id,
          ipFirmante: req.headers.get("x-forwarded-for") || "interno"
        }
      }
    }
  })

  // 7. Cerrar (Opcional) el radicado padre si ya fue totalmente respondido
  await prisma.gdLogTransaccion.create({
    data: {
      accion: "RESPUESTA",
      descripcion: `Se emitió radicado de respuesta oficial N° ${numeroRadicado}`,
      estadoAnterior: origen.estado,
      estadoNuevo: "RESUELTO", // Podría ser parametrizable
      radicadoId: origen.id,
      usuarioId: user!.id
    }
  })
  
  await prisma.gdRadicado.update({
    where: { id: origen.id },
    data: { estado: "RESUELTO" }
  })

  return NextResponse.json({
    success: true,
    nuevoRadicadoId: nuevoRadicado.id,
    nuevoRadicadoNumero: nuevoRadicado.numero,
    verificacionQr: urlVerificacion
  })
}
