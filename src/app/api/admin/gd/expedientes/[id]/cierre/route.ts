import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { createHash } from "crypto"
import { uploadFile } from "@/lib/storage"
import { resolveModulosConfig } from "@/lib/modules"
import { prismaMeta } from "@/lib/prisma-meta"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError

  const prisma = await getTenantPrisma()

  // 1. Obtener expediente con todos sus radicados y documentos (Folios)
  const exp = await prisma.gdExpediente.findUnique({
    where: { id },
    include: {
      dependencia: true,
      serie: true,
      subserie: true,
      radicados: {
        include: {
          documentos: { include: { firmaQr: true } }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  })

  if (!exp) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 })
  if (exp.estado === "CERRADO") return NextResponse.json({ error: "El expediente ya está cerrado" }, { status: 400 })

  // 2. Construir la data del Índice Electrónico y el HTML a estampar
  const currentDate = new Date()
  
  let foliosCount = 0
  let indiceHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Índice Electrónico de Expediente - ${exp.codigo}</title>
    <style>
      body { font-family: sans-serif; padding: 30px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f4f4f4; }
    </style>
  </head>
  <body>
    <h2>Personería Mpal. de Guadalajara de Buga</h2>
    <h3>Índice Electrónico del Expediente Múltiple</h3>
    <p><strong>Código:</strong> ${exp.codigo}</p>
    <p><strong>Nombre:</strong> ${exp.nombre}</p>
    <p><strong>Dependencia:</strong> ${exp.dependencia.nombre}</p>
    <p><strong>Fecha de Creación:</strong> ${exp.fechaApertura.toLocaleDateString()}</p>
    <p><strong>Fecha de Cierre:</strong> ${currentDate.toLocaleDateString()}</p>
    
    <table>
      <thead>
        <tr>
          <th>Fecha Inclusión</th>
          <th>Tipo Doc / Radicado</th>
          <th>Nombre del Archivo Base</th>
          <th>Folios</th>
          <th>Identificador Único (SHA-256)</th>
        </tr>
      </thead>
      <tbody>
  `

  // Mapeamos los radicados y generamos hashes encadenados
  const manifestData: any[] = []

  for (const r of exp.radicados) {
    for (const doc of r.documentos) {
      foliosCount += doc.folios
      
      // Si el doc tiene firmaQr, usamos su hash. Sino, simulamos un hash del metadato (para docs no sellados)
      const hashDoc = doc.firmaQr?.hashFirma || createHash("sha256").update(doc.archivoUrl + doc.id).digest("hex")

      manifestData.push({
        radicadoNumero: r.numero,
        documentoNombre: doc.nombre,
        hash: hashDoc,
        fecha: doc.createdAt
      })

      indiceHtml += `
        <tr>
          <td>${doc.createdAt.toLocaleDateString()}</td>
          <td>${r.numero}</td>
          <td>${doc.nombre}</td>
          <td>${doc.folios}</td>
          <td style="font-family: monospace; font-size: 10px;">${hashDoc}</td>
        </tr>
      `
    }
  }

  indiceHtml += `
      </tbody>
    </table>
    
    <p style="margin-top:40px;"><em>Índice Electrónico cerrado y compuesto electrónicamente. Total de folios virtuales: ${foliosCount}</em></p>
  </body>
  </html>
  `

  // 3. Generar el Hash Global del Índice
  const hashIndiceMain = createHash("sha256").update(indiceHtml).digest("hex")

  // 4. Subir el HTML del Índice al Storage
  const htmlBuffer = Buffer.from(indiceHtml, "utf-8")
  
  const hostname = req.headers.get("host") || ""
  const t = await (prismaMeta.tenant as any).findFirst({ where: { dominios: { has: hostname } } })
  const tenant = t || (await prismaMeta.tenant.findFirst())
  const modulos = resolveModulosConfig(tenant!.modulosActivos)
  const storageCfg = modulos.gestion_documental.storage ?? { provider: "local", prefix: "documentos/", publicBaseUrl: "" }

  const nombreArchivo = `${exp.codigo}_indice_electronico.html`
  const resultUpload = await uploadFile(
    storageCfg,
    htmlBuffer,
    nombreArchivo,
    "text/html",
    `expedientes/${currentDate.getFullYear()}/${exp.id}`
  )

  // 5. Transacción DB: Actualizar Estado Expediente y Crear Indice
  await prisma.$transaction([
    prisma.gdExpediente.update({
      where: { id: exp.id },
      data: { estado: "CERRADO", fechaCierre: currentDate }
    }),
    prisma.gdIndiceElectronico.create({
      data: {
        hashCierre: hashIndiceMain,
        documentoUrl: resultUpload.url,
        expedienteId: exp.id,
        firmanteId: user!.id
      }
    })
  ])

  return NextResponse.json({ success: true, url: resultUpload.url })
}
