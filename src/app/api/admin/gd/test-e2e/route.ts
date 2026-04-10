/**
 * Test E2E del Gestor Documental
 * Prueba de inserción de radicado + subida de archivo + mapeo documental
 * 
 * NOTA: Este archivo es un script de prueba que se ejecuta manualmente.
 * Usa `as any` para bypassear tipado estricto en operaciones de prueba.
 */

import { NextResponse } from "next/server"
import { uploadFile } from "@/lib/storage"
import { PrismaClient } from "@prisma/client"
import { checkApiRoles } from "@/lib/authorization"

export async function GET() {
  const { error } = await checkApiRoles(['SUPER_ADMIN'])
  if (error) return error

  let prisma: PrismaClient | null = null

  try {
    // 1. Conectar directo a la BD local del tenant (evitando prismaMeta)
    if (!process.env.DATABASE_URL) throw new Error("Asegúrate de configurar DATABASE_URL")
    prisma = new (PrismaClient as any)({ datasourceUrl: process.env.DATABASE_URL })
    await prisma!.$connect()

    // 2. Crear un Radicado de prueba
    const numRadicado = `TEST-${Date.now()}`
    const radicado = await prisma!.gdRadicado.create({
      data: {
        numero: numRadicado,
        tipo: "ENTRADA",
        medioRecepcion: "WEB",
        prioridad: "NORMAL",
        asunto: "Prueba Mock E2E",
        estado: "RADICADO",
        dependenciaId: "test-dep", // Placeholder en test
        tramitadorId: "test-user",
        creadorId: "test-user",
        remitentes: {
          create: { tipoPersona: "CIUDADANO", nombre: "Tester Automático" }
        }
      } as any
    })

    // 3. Mockear configuración de Storage a Local
    const storageCfg = {
      provider: "local" as const,
      prefix: "documentos/",
      publicBaseUrl: ""
    }

    // 4. Subir archivo
    const buffer = Buffer.from("Contenido seguro de prueba E2E: " + numRadicado)
    const result = await uploadFile(
      storageCfg,
      buffer,
      "documento_e2e.txt",
      "text/plain",
      `radicados/e2e/${radicado.id}`
    )

    // 5. Vincular
    const doc = await prisma!.gdDocumento.create({
      data: {
        nombre: "documento_e2e.txt",
        archivoUrl: result.url,
        esPrincipal: true,
        folios: 1,
        radicadoId: radicado.id,
        subidoPorId: "tester"
      }
    })

    // 6. Cleanup preventivo
    await prisma!.gdRadicado.delete({ where: { id: radicado.id } })

    return NextResponse.json({
      success: true,
      mensaje: "Test Completo. Inserción DB, Subida Local y Mapeo exitosos.",
      radicado: numRadicado,
      archivoURL: result.url
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  } finally {
    if (prisma) await prisma.$disconnect()
  }
}
