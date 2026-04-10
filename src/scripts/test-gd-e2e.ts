import { resolveModulosConfig } from "../lib/modules"
import { uploadFile } from "../lib/storage"
import { prismaMeta } from "../lib/prisma-meta"
import { PrismaClient } from "@prisma/client"

async function run() {
  console.log("Iniciando prueba E2E de Gestor Documental (Radicación + Storage)")
  
  // 1. Obtener tenant
  const tenant = await prismaMeta.tenant.findFirst({ where: { activo: true } })
  if (!tenant) throw new Error("No se encontró un tenant activo")
  console.log("🚀 Tenant seleccionado:", tenant.slug)

  // 2. Conectar BD del tenant
  const prisma = new (PrismaClient as any)({ datasourceUrl: tenant.databaseUrl })
  await prisma.$connect()

  try {
    // 3. Crear Radicado de Prueba
    const numRadicado = `TEST-${Date.now()}`
    const radicado = await prisma.gdRadicado.create({
      data: {
        numero: numRadicado,
        tipo: "ENTRADA",
        medioRecepcion: "WEB",
        prioridad: "NORMAL",
        asunto: "Prueba E2E Storage",
        estado: "RADICADO",
        dependenciaId: "test-dep",
        tramitadorId: "test-user",
        creadorId: "test-user",
        remitentes: {
          create: {
            tipoPersona: "CIUDADANO",
            nombre: "Bot de Pruebas",
          }
        }
      } as any
    })
    console.log(`✅ Radicado creado: ${radicado.numero} (${radicado.id})`)

    // 4. Leer configuración de Storage
    const modulos = resolveModulosConfig(tenant.modulosActivos)
    const storageCfg = modulos.gestion_documental.storage ?? { provider: "local", prefix: "documentos/", publicBaseUrl: "" }
    console.log(`📁 Proveedor de almacenamiento activo: ${storageCfg.provider}`)

    // 5. Crear y subir archivo
    const buffer = Buffer.from("Contenido de prueba automatizada E2E. Radicado: " + numRadicado)
    const result = await uploadFile(
      storageCfg,
      buffer,
      "documento_e2e_prueba.txt",
      "text/plain",
      `radicados/tests/${radicado.id}`
    )
    console.log(`✅ Archivo subido con éxito al proveedor. URL: ${result.url}`)

    // 6. Guardar asociación en la BD
    const doc = await prisma.gdDocumento.create({
      data: {
        nombre: "documento_e2e_prueba.txt",
        archivoUrl: result.url,
        esPrincipal: true,
        folios: 1,
        radicadoId: radicado.id,
      }
    })
    console.log(`✅ Registro GdDocumento asociado en BD: ${doc.id}`)

    // 7. Cleanup opcional (evitamos que se llene de basura)
    await prisma.gdRadicado.delete({ where: { id: radicado.id } })
    console.log(`🧹 Datos de prueba limpiados de la DB local`)

  } catch (error) {
    console.error("❌ Falló la prueba E2E:", error)
  } finally {
    await prisma.$disconnect()
  }
}

run()
