import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { gdCarpetaArchivoSchema, validateBody } from "@/lib/validations"

export async function POST(req: Request) {
  const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError

  try {
    const body = await req.json()
    const validated = validateBody(gdCarpetaArchivoSchema, body)
    if (!validated.success) return validated.response
    const { edificio, piso, bodega, estante, entrepano, caja, carpeta, titulo, expedienteId } = body

    if (!caja || !carpeta || !titulo) return NextResponse.json({ error: "Campos de carpeta obligatorios" }, { status: 400 })

    const prisma = await getTenantPrisma()

    // Lógica "Upsert" Ascendente
    // 1. Edificio
    let dbEdificio = await prisma.gaEdificio.findFirst({ where: { nombre: edificio } })
    if (!dbEdificio) dbEdificio = await prisma.gaEdificio.create({ data: { nombre: edificio } })

    // 2. Piso
    let dbPiso = await prisma.gaPiso.findFirst({ where: { nombre: piso, edificioId: dbEdificio.id } })
    if (!dbPiso) dbPiso = await prisma.gaPiso.create({ data: { nombre: piso, edificioId: dbEdificio.id } })

    // 3. Bodega
    let dbBodega = await prisma.gaBodega.findFirst({ where: { nombre: bodega, pisoId: dbPiso.id } })
    if (!dbBodega) dbBodega = await prisma.gaBodega.create({ data: { nombre: bodega, pisoId: dbPiso.id } })

    // 4. Estante
    let dbEstante = await prisma.gaEstante.findFirst({ where: { codigo: estante, bodegaId: dbBodega.id } })
    if (!dbEstante) dbEstante = await prisma.gaEstante.create({ data: { codigo: estante, bodegaId: dbBodega.id } })

    // 5. Entrepaño
    let dbEntrepano = await prisma.gaEntrepano.findFirst({ where: { codigo: entrepano, estanteId: dbEstante.id } })
    if (!dbEntrepano) dbEntrepano = await prisma.gaEntrepano.create({ data: { codigo: entrepano, estanteId: dbEstante.id } })

    // 6. Caja
    let dbCaja = await prisma.gaCaja.findFirst({ where: { codigo: caja, entrepanoId: dbEntrepano.id } })
    if (!dbCaja) dbCaja = await prisma.gaCaja.create({ data: { codigo: caja, entrepanoId: dbEntrepano.id } })

    // 7. Finalmente, crear la Carpeta
    const nuevaCarpeta = await prisma.gaCarpeta.create({
      data: {
        codigo: carpeta,
        titulo: titulo,
        cajaId: dbCaja.id,
        expedienteId: expedienteId || null
      }
    })

    return NextResponse.json({ success: true, carpetaId: nuevaCarpeta.id })

  } catch (error: any) {
    console.error("Error topografía:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
