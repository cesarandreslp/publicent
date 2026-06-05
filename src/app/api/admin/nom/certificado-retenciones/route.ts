/**
 * GET /api/admin/nom/certificado-retenciones?empleadoId=xxx&anio=2025
 * Genera el Certificado de Ingresos y Retenciones del empleado para el año fiscal,
 * como HTML listo para imprimir (Content-Type: text/html) — sin dependencias nuevas.
 *
 * Gateado por el módulo `nomina_publica` + roles SUPER_ADMIN / ADMIN.
 */

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getTenantPrisma, getTenantId } from "@/lib/tenant"
import { prismaMeta } from "@/lib/prisma-meta"
import { requireNomina } from "@/lib/frisco-guard"

const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
}

export async function GET(req: NextRequest) {
  const guard = await requireNomina(["SUPER_ADMIN", "ADMIN"])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const empleadoId = searchParams.get("empleadoId")
  const anio = parseInt(searchParams.get("anio") ?? String(new Date().getFullYear() - 1))
  if (!empleadoId) return NextResponse.json({ error: "empleadoId es requerido" }, { status: 400 })

  const prisma = await getTenantPrisma()
  const tenantId = await getTenantId()

  const empleado = await prisma.nomEmpleado.findUnique({ where: { id: empleadoId } })
  if (!empleado) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

  const liquidaciones = await prisma.nomLiquidacion.findMany({
    where: { empleadoId, periodo: { anio } },
    include: { detalles: { include: { concepto: { select: { nombre: true, tipo: true } } } } },
  })

  // Acumular por concepto y por tipo.
  let totalDevengado = 0
  let totalDeducciones = 0
  let aportesSeguridadSocial = 0
  const porConcepto = new Map<string, { nombre: string; tipo: string; valor: number }>()

  for (const liq of liquidaciones) {
    totalDevengado += Number(liq.totalDevengado)
    totalDeducciones += Number(liq.totalDeducciones)
    for (const d of liq.detalles) {
      const val = Number(d.valor)
      if (d.concepto.tipo === "DEDUCCION_EMPLEADO") {
        // salud y pensión del empleado son aportes obligatorios a SS
        if (/salud|pensi/i.test(d.concepto.nombre)) aportesSeguridadSocial += val
      }
      const key = d.concepto.nombre
      const prev = porConcepto.get(key)
      if (prev) prev.valor += val
      else porConcepto.set(key, { nombre: d.concepto.nombre, tipo: d.concepto.tipo, valor: val })
    }
  }

  const tenant = await prismaMeta.tenant.findUnique({
    where: { id: tenantId },
    select: { nit: true, nombre: true },
  })
  const identidad = await prisma.identidadInstitucional
    .findFirst({ where: { singletonKey: "default" }, select: { nombreCompleto: true, logoUrl: true } })
    .catch(() => null)

  const razonSocial = identidad?.nombreCompleto ?? tenant?.nombre ?? "Entidad Pública"
  const nombreEmpleado = `${empleado.primerNombre} ${empleado.segundoNombre ?? ""} ${empleado.primerApellido} ${empleado.segundoApellido ?? ""}`
    .replace(/\s+/g, " ")
    .trim()

  const filasDevengados = [...porConcepto.values()]
    .filter((c) => c.tipo === "DEVENGADO")
    .map((c) => `<tr><td>${esc(c.nombre)}</td><td class="num">${cop(c.valor)}</td></tr>`)
    .join("")
  const filasDeducciones = [...porConcepto.values()]
    .filter((c) => c.tipo === "DEDUCCION_EMPLEADO")
    .map((c) => `<tr><td>${esc(c.nombre)}</td><td class="num">${cop(c.valor)}</td></tr>`)
    .join("")

  const html = `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8" />
<title>Certificado de Ingresos y Retenciones ${anio} — ${esc(nombreEmpleado)}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 32px; font-size: 13px; }
  .header { display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 24px; }
  .header img { height: 56px; }
  h1 { font-size: 18px; color: #1e3a8a; margin: 0; }
  h2 { font-size: 14px; margin: 24px 0 8px; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  .meta { color: #64748b; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
  th { background: #f1f5f9; font-size: 12px; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .total { font-weight: bold; background: #f8fafc; }
  .declaracion { font-size: 11px; color: #475569; margin-top: 24px; line-height: 1.5; }
  .firma { margin-top: 48px; }
  .firma .linea { border-top: 1px solid #334155; width: 260px; padding-top: 4px; font-size: 12px; }
  @media print { body { padding: 0; } .noprint { display: none; } }
</style>
</head><body>
  <div class="header">
    ${identidad?.logoUrl ? `<img src="${esc(identidad.logoUrl)}" alt="logo" />` : ""}
    <div>
      <h1>${esc(razonSocial)}</h1>
      <p class="meta">NIT: ${esc(tenant?.nit ?? "—")}</p>
    </div>
  </div>

  <h1 style="text-align:center">Certificado de Ingresos y Retenciones — Año gravable ${anio}</h1>
  <p class="meta" style="text-align:center">Artículo 378 del Estatuto Tributario</p>

  <h2>Datos del empleado</h2>
  <table>
    <tr><td><strong>Nombre</strong></td><td>${esc(nombreEmpleado)}</td></tr>
    <tr><td><strong>Documento</strong></td><td>${esc(empleado.tipoDocumento)} ${esc(empleado.documento)}</td></tr>
    <tr><td><strong>Cargo</strong></td><td>${esc(empleado.cargo)}</td></tr>
  </table>

  <h2>Conceptos devengados</h2>
  <table>
    <thead><tr><th>Concepto</th><th class="num">Valor año</th></tr></thead>
    <tbody>
      ${filasDevengados || '<tr><td colspan="2">Sin devengados registrados.</td></tr>'}
      <tr class="total"><td>Total devengado</td><td class="num">${cop(totalDevengado)}</td></tr>
    </tbody>
  </table>

  <h2>Deducciones y aportes</h2>
  <table>
    <thead><tr><th>Concepto</th><th class="num">Valor año</th></tr></thead>
    <tbody>
      ${filasDeducciones || '<tr><td colspan="2">Sin deducciones registradas.</td></tr>'}
      <tr class="total"><td>Total deducciones</td><td class="num">${cop(totalDeducciones)}</td></tr>
      <tr><td>Aportes obligatorios a seguridad social (salud + pensión)</td><td class="num">${cop(aportesSeguridadSocial)}</td></tr>
    </tbody>
  </table>

  <table style="margin-top:16px">
    <tr class="total"><td>Total neto pagado en el año</td><td class="num">${cop(totalDevengado - totalDeducciones)}</td></tr>
  </table>

  <p class="declaracion">
    El presente certificado se expide de conformidad con el artículo 378 y siguientes del Estatuto Tributario.
    Los valores aquí relacionados corresponden a los pagos efectuados al empleado durante el año gravable ${anio}.
    La retención en la fuente practicada se reporta por separado según el procedimiento aplicable de la DIAN.
  </p>

  <div class="firma">
    <div class="linea">Jefe de Nómina / Pagaduría</div>
    <p class="meta">${esc(razonSocial)}</p>
  </div>

  <p class="noprint" style="margin-top:24px;text-align:center">
    <button onclick="window.print()" style="padding:8px 20px;background:#1e3a8a;color:#fff;border:none;border-radius:8px;cursor:pointer">Imprimir / Guardar PDF</button>
  </p>
</body></html>`

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
