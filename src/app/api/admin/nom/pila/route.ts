/**
 * GET /api/admin/nom/pila?periodoId=xxx
 * Genera el archivo plano PILA (UGPP) del periodo y lo devuelve como text/plain.
 * Registra la entrega en NominaPilaExport para trazabilidad.
 *
 * Gateado por el módulo `nomina_publica` + roles SUPER_ADMIN / ADMIN.
 */

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getTenantPrisma, getTenantId } from "@/lib/tenant"
import { prismaMeta } from "@/lib/prisma-meta"
import { requireNomina } from "@/lib/frisco-guard"
import { registrarAuditoria } from "@/lib/auditoria"
import {
  generarArchivoPILA,
  nombreArchivoPILA,
  type EmpleadoParaPILA,
  type AportanteParaPILA,
} from "@/lib/nomina-pila"

export async function GET(req: NextRequest) {
  const guard = await requireNomina(["SUPER_ADMIN", "ADMIN"])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const periodoId = searchParams.get("periodoId")
  if (!periodoId) {
    return NextResponse.json({ error: "periodoId es requerido" }, { status: 400 })
  }

  const prisma = await getTenantPrisma()
  const tenantId = await getTenantId()

  const periodo = await prisma.nomNominaPeriodo.findUnique({
    where: { id: periodoId },
    include: {
      liquidaciones: {
        include: {
          empleado: true,
          detalles: { include: { concepto: { select: { tipo: true, constitutivoSalario: true } } } },
        },
      },
    },
  })
  if (!periodo) return NextResponse.json({ error: "Periodo no encontrado" }, { status: 404 })
  if (periodo.liquidaciones.length === 0) {
    return NextResponse.json({ error: "El periodo no tiene liquidaciones" }, { status: 409 })
  }

  // Datos del aportante desde la meta-DB.
  const tenant = await prismaMeta.tenant.findUnique({
    where: { id: tenantId },
    select: { nit: true, nombre: true },
  })

  const aportante: AportanteParaPILA = {
    nit: (tenant?.nit ?? "").replace(/\D/g, "") || "000000000",
    razonSocial: tenant?.nombre ?? "ENTIDAD",
    periodoMM: String(periodo.mes).padStart(2, "0"),
    periodoAAAA: String(periodo.anio),
  }

  // Construir los empleados PILA. Sólo dependientes (no contratistas OPS).
  const COTIZANTE_SERVIDOR = ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"]
  const empleados: EmpleadoParaPILA[] = []

  for (const liq of periodo.liquidaciones) {
    const e = liq.empleado
    if (e.tipoVinculacion === "CONTRATISTA") continue // los OPS cotizan como independientes

    // IBC = suma de devengados constitutivos de salario del periodo.
    const ibc = liq.detalles
      .filter((d) => d.concepto.tipo === "DEVENGADO" && d.concepto.constitutivoSalario)
      .reduce((s, d) => s + Number(d.valor), 0) || Number(liq.salarioBasico)

    const esServidor = COTIZANTE_SERVIDOR.includes(e.tipoVinculacion)

    empleados.push({
      tipoDoc: e.tipoDocumento,
      numeroDoc: e.documento,
      primerApellido: e.primerApellido,
      segundoApellido: e.segundoApellido ?? "",
      primerNombre: e.primerNombre,
      segundoNombre: e.segundoNombre ?? "",
      tipoCotizante: esServidor ? "51" : "01",
      subtipoCotizante: "00",
      diasLaborados: liq.diasLiquidados,
      ibc,
      salarioBasico: Number(liq.salarioBasico),
      codigoEPS: e.codigoEPS ?? "",
      codigoAFP: e.codigoAFP ?? "",
      codigoARL: e.codigoARL ?? "",
      codigoCajaComp: e.codigoCajaComp ?? "",
      claseRiesgoARL: e.claseRiesgoARL ?? 1,
      novedad: e.fechaIngreso >= periodo.fechaInicio ? "ING" : undefined,
    })
  }

  if (empleados.length === 0) {
    return NextResponse.json({ error: "No hay empleados dependientes liquidados en el periodo" }, { status: 409 })
  }

  const contenido = generarArchivoPILA(aportante, empleados)
  const nombre = nombreArchivoPILA(aportante.periodoAAAA, aportante.periodoMM)

  // Trazabilidad
  try {
    await prisma.nominaPilaExport.create({
      data: {
        tenantId,
        periodoId,
        generadoPor: guard.user?.id ?? "system",
        totalEmpleados: empleados.length,
        archivoNombre: nombre,
      },
    })
    await registrarAuditoria({
      accion: "EXPORT",
      entidad: "NominaPilaExport",
      entidadId: periodoId,
      usuarioId: guard.user?.id,
      descripcion: `Generación de archivo PILA ${nombre} (${empleados.length} empleados)`,
    })
  } catch { /* trazabilidad no crítica */ }

  return new NextResponse(contenido, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}"`,
    },
  })
}
