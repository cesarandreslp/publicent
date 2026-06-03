/**
 * GET /api/cron/diario — Cron diario GLOBAL (un solo cron para todos los tenants).
 *
 * Diseño multi-tenant: `vercel.json` no puede tener un cron por tenant (es estático).
 * Este endpoint hace FAN-OUT: recorre todos los tenants activos de la meta-DB,
 * y por cada uno —según los módulos que tenga activos— ejecuta:
 *   1. Alertas de pólizas FRISCO próximas a vencer (hitos 30/15/5/1/0 días).
 *   2. Alertas de vencimiento de contratos (módulo contratación).
 *   3. (Solo el día 1 del mes) Recordatorio de depositarios sin reporte del periodo.
 *
 * Envía UN email-digest por tenant al primer admin activo (minimiza envíos).
 *
 * Seguridad: protegido con `Authorization: Bearer ${CRON_SECRET}`.
 *   Vercel inyecta este header automáticamente cuando CRON_SECRET está en env.
 *
 * Plan gratis de Vercel: este es 1 de los 2 crons permitidos, corre 1 vez al día.
 * Si más adelante se necesita más frecuencia, dispararlo desde un scheduler externo
 * (GitHub Actions / cron-job.org) con el mismo header — sin cambiar este código.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prismaMeta } from "@/lib/prisma-meta"
import { getOrCreateTenantClientById } from "@/lib/tenant"
import { resolveModulosConfig, isModuleActive, MODULO_IDS } from "@/lib/modules"
import {
  alertasPolizasFrisco,
  alertasVencimientoContratos,
  depositariosSinReporte,
  esHitoDeAlerta,
  type AlertaPoliza,
  type AlertaContrato,
  type DepositarioSinReporte,
} from "@/lib/alertas"
import { sendMail } from "@/lib/mail"

export const dynamic = "force-dynamic"
export const maxDuration = 60

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" })
}

function periodoActual(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

/** Resuelve el remitente "From" usando la identidad del tenant (sin depender de headers). */
async function resolverFrom(prisma: Awaited<ReturnType<typeof getOrCreateTenantClientById>>): Promise<string> {
  const fallbackAddr = process.env.EMAIL_FROM || "noreply@example.gov.co"
  try {
    const i = await prisma.identidadInstitucional.findFirst({
      where: { singletonKey: "default" },
      select: { nombreCorto: true, emailFromName: true, emailFromAddress: true },
    })
    const name = i?.emailFromName || i?.nombreCorto || "Notificaciones"
    const addr = i?.emailFromAddress || fallbackAddr
    return `${name} <${addr}>`
  } catch {
    return `Notificaciones <${fallbackAddr}>`
  }
}

export async function GET(req: NextRequest) {
  // ── Autenticación del cron ──
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 500 })
  }
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const hoy = new Date()
  const esPrimeroDeMes = hoy.getDate() === 1
  const periodo = periodoActual(hoy)

  const tenants = await prismaMeta.tenant.findMany({
    where: { activo: true, suspendido: false },
    select: { id: true, nombre: true, modulosActivos: true },
  })

  const resumen: Array<{
    tenant: string
    polizas: number
    contratos: number
    sinReporte: number
    emailEnviado: boolean
    error?: string
  }> = []

  for (const t of tenants) {
    const fila = { tenant: t.nombre, polizas: 0, contratos: 0, sinReporte: 0, emailEnviado: false } as (typeof resumen)[number]
    try {
      const modulos = resolveModulosConfig(t.modulosActivos)
      const friscoActivo  = isModuleActive(modulos, MODULO_IDS.FRISCO_BIENES)
      const contratacionActiva = isModuleActive(modulos, MODULO_IDS.CONTRATACION)
      const portalActivo  = isModuleActive(modulos, MODULO_IDS.PORTAL_EXTERNO)

      if (!friscoActivo && !contratacionActiva) {
        resumen.push(fila)
        continue
      }

      const prisma = await getOrCreateTenantClientById(t.id)

      // 1. Pólizas FRISCO (solo hitos para no spamear)
      let polizas: AlertaPoliza[] = []
      if (friscoActivo) {
        const todas = await alertasPolizasFrisco(prisma, 30)
        polizas = todas.filter((p) => esHitoDeAlerta(p.diasRestantes))
        fila.polizas = polizas.length
      }

      // 2. Contratos próximos a vencer (solo hitos)
      let contratos: AlertaContrato[] = []
      if (contratacionActiva) {
        const todos = await alertasVencimientoContratos(prisma, 30)
        contratos = todos.filter((c) => esHitoDeAlerta(c.diasRestantes))
        fila.contratos = contratos.length
      }

      // 3. Depositarios sin reporte (solo el día 1 del mes)
      let sinReporte: DepositarioSinReporte[] = []
      if (esPrimeroDeMes && friscoActivo && portalActivo) {
        sinReporte = await depositariosSinReporte(prisma, periodo)
        fila.sinReporte = sinReporte.length
      }

      const hayAlgo = polizas.length || contratos.length || sinReporte.length
      if (hayAlgo) {
        const admin = await prisma.usuario.findFirst({
          where: { activo: true, rol: { nombre: { in: ["ADMIN", "SUPER_ADMIN"] } } },
          select: { email: true },
          orderBy: { createdAt: "asc" },
        })
        if (admin?.email) {
          const from = await resolverFrom(prisma)
          await sendMail({
            to: admin.email,
            from,
            subject: `🔔 Alertas de vencimiento — ${periodo}${sinReporte.length ? " · recordatorio mensual" : ""}`,
            html: construirDigest({ tenant: t.nombre, periodo, polizas, contratos, sinReporte }),
          })
          fila.emailEnviado = true
        }
      }
    } catch (err) {
      fila.error = err instanceof Error ? err.message : String(err)
    }
    resumen.push(fila)
  }

  return NextResponse.json({
    ejecutadoEn: hoy.toISOString(),
    periodo,
    esPrimeroDeMes,
    tenantsProcesados: tenants.length,
    resumen,
  })
}

// ─── Plantilla del email-digest ───────────────────────────────────────────────

function construirDigest(d: {
  tenant: string
  periodo: string
  polizas: AlertaPoliza[]
  contratos: AlertaContrato[]
  sinReporte: DepositarioSinReporte[]
}): string {
  const secciones: string[] = []

  if (d.polizas.length) {
    const filas = d.polizas.map((p) => `
      <tr>
        <td style="padding:4px 8px">${p.bienCodigo} — ${p.bienTipo}</td>
        <td style="padding:4px 8px">${p.depositario}</td>
        <td style="padding:4px 8px">${fmtFecha(p.polizaVigenteHasta)}</td>
        <td style="padding:4px 8px;text-align:right;font-weight:bold;color:${p.diasRestantes <= 5 ? "#dc2626" : "#d97706"}">
          ${p.diasRestantes < 0 ? "VENCIDA" : `${p.diasRestantes} días`}
        </td>
      </tr>`).join("")
    secciones.push(`
      <h3 style="color:#b45309;margin:16px 0 6px">🛡️ Pólizas de depositarios por vencer (${d.polizas.length})</h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px">
        <tr style="background:#f8fafc;color:#64748b"><th style="padding:4px 8px;text-align:left">Bien</th><th style="padding:4px 8px;text-align:left">Depositario</th><th style="padding:4px 8px;text-align:left">Vence</th><th style="padding:4px 8px;text-align:right">Restan</th></tr>
        ${filas}
      </table>`)
  }

  if (d.contratos.length) {
    const filas = d.contratos.map((c) => `
      <tr>
        <td style="padding:4px 8px">${c.numero}</td>
        <td style="padding:4px 8px">${c.contratista}</td>
        <td style="padding:4px 8px">${c.supervisor ?? "—"}</td>
        <td style="padding:4px 8px">${fmtFecha(c.fechaTerminacion)}</td>
        <td style="padding:4px 8px;text-align:right;font-weight:bold;color:${c.diasRestantes <= 5 ? "#dc2626" : "#d97706"}">
          ${c.diasRestantes < 0 ? "VENCIDO" : `${c.diasRestantes} días`}
        </td>
      </tr>`).join("")
    secciones.push(`
      <h3 style="color:#b45309;margin:16px 0 6px">📄 Contratos por terminar (${d.contratos.length})</h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px">
        <tr style="background:#f8fafc;color:#64748b"><th style="padding:4px 8px;text-align:left">N°</th><th style="padding:4px 8px;text-align:left">Contratista</th><th style="padding:4px 8px;text-align:left">Supervisor</th><th style="padding:4px 8px;text-align:left">Termina</th><th style="padding:4px 8px;text-align:right">Restan</th></tr>
        ${filas}
      </table>`)
  }

  if (d.sinReporte.length) {
    const filas = d.sinReporte.map((s) => `
      <tr>
        <td style="padding:4px 8px">${s.bienCodigo}</td>
        <td style="padding:4px 8px">${s.depositario}</td>
        <td style="padding:4px 8px">${s.email ?? "sin email"}</td>
      </tr>`).join("")
    secciones.push(`
      <h3 style="color:#1d4ed8;margin:16px 0 6px">📅 Depositarios sin reporte de ${d.periodo} (${d.sinReporte.length})</h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px">
        <tr style="background:#f8fafc;color:#64748b"><th style="padding:4px 8px;text-align:left">Bien</th><th style="padding:4px 8px;text-align:left">Depositario</th><th style="padding:4px 8px;text-align:left">Contacto</th></tr>
        ${filas}
      </table>`)
  }

  return `
    <div style="font-family:sans-serif;max-width:680px;margin:0 auto">
      <h2 style="color:#0f172a">Alertas automáticas — ${d.tenant}</h2>
      <p style="color:#475569">Resumen de vencimientos detectados el ${fmtFecha(new Date().toISOString())}.</p>
      ${secciones.join("")}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
      <p style="font-size:12px;color:#94a3b8">PublicEnt · Notificación automática diaria. No responda a este correo.</p>
    </div>`
}
