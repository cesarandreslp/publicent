import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { gdTrdSchema, validateBody } from "@/lib/validations"

/**
 * GET /api/admin/gd/trd
 * Retorna el árbol completo de la TRD del tenant:
 * Dependencias → Series → Subseries → Tipos Documentales
 */
export async function GET(_req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const prisma = await getTenantPrisma()

    const dependencias = await prisma.gdTrdDependencia.findMany({
      where: { activa: true, padreId: null }, // Solo raíces
      include: {
        hijas: {
          where: { activa: true },
          include: {
            series: {
              include: {
                subseries: {
                  include: {
                    tiposDoc: {
                      where: { activo: true },
                      orderBy: { nombre: "asc" },
                    },
                  },
                  orderBy: { codigo: "asc" },
                },
              },
              orderBy: { codigo: "asc" },
            },
          },
          orderBy: { codigo: "asc" },
        },
        series: {
          include: {
            subseries: {
              include: {
                tiposDoc: {
                  where: { activo: true },
                  orderBy: { nombre: "asc" },
                },
              },
              orderBy: { codigo: "asc" },
            },
          },
          orderBy: { codigo: "asc" },
        },
      },
      orderBy: { codigo: "asc" },
    })

    return NextResponse.json({ dependencias })
  } catch (error: any) {
    console.error("[/api/admin/gd/trd] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al obtener TRD" }, { status: 500 })
  }
}

/**
 * POST /api/admin/gd/trd
 * Crea o actualiza una dependencia, serie, subserie o tipo documental.
 */
export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const prisma = await getTenantPrisma()
    const data = await req.json()
    const validated = validateBody(gdTrdSchema, data)
    if (!validated.success) return validated.response
    const { entidad, payload } = data // entidad: "dependencia" | "serie" | "subserie" | "tipoDocumental"

    let resultado: any

    switch (entidad) {
      case "dependencia":
        resultado = await prisma.gdTrdDependencia.upsert({
          where: { codigo: payload.codigo },
          create: payload,
          update: { nombre: payload.nombre, descripcion: payload.descripcion, activa: payload.activa },
        })
        break
      case "serie":
        resultado = await prisma.gdTrdSerie.create({ data: payload })
        break
      case "subserie":
        resultado = await prisma.gdTrdSubserie.create({ data: payload })
        break
      case "tipoDocumental":
        resultado = await prisma.gdTrdTipoDocumental.create({ data: payload })
        break
      default:
        return NextResponse.json({ error: "Entidad no válida" }, { status: 400 })
    }

    return NextResponse.json(resultado, { status: 201 })
  } catch (error: any) {
    console.error("[/api/admin/gd/trd] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al guardar en TRD" }, { status: 500 })
  }
}
