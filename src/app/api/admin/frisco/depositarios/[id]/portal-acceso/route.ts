/**
 * /api/admin/frisco/depositarios/[id]/portal-acceso
 *
 * GET  — lista accesos vigentes/históricos del depositario.
 * POST — genera un nuevo token (revoca los anteriores activos). Devuelve el
 *        token PLANO una sola vez. Opcional: enviar por email al depositario.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { getTenantPrisma } from "@/lib/tenant"
import { requirePortalExterno } from "@/lib/frisco-guard"
import { validateBody } from "@/lib/validations"
import { generarToken } from "@/lib/frisco-portal"
import { sendMail } from "@/lib/mail"
import { getIdentidadPublica } from "@/lib/identidad-publica"

type Params = { params: Promise<{ id: string }> }

const DIAS_DEFAULT = 90

const schema = z.object({
  diasVigencia: z.number().int().min(1).max(365).optional(),
  enviarEmail:  z.boolean().optional(),
})

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requirePortalExterno(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const accesos = await prisma.friscoPortalAcceso.findMany({
    where: { depositarioId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, expiraEn: true, revocadoEn: true,
      ultimoAccesoEn: true, accesoCount: true,
      createdAt: true, createdBy: true,
    },
  })
  return NextResponse.json({ accesos })
}

export async function POST(req: NextRequest, { params }: Params) {
  const guard = await requirePortalExterno(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (guard.error) return guard.error

  const { id } = await params

  let body: unknown
  try { body = await req.json().catch(() => ({})) }
  catch { return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 }) }

  const validated = validateBody(schema, body ?? {})
  if (!validated.success) return validated.response
  const { diasVigencia = DIAS_DEFAULT, enviarEmail = false } = validated.data

  const prisma = await getTenantPrisma()

  const depositario = await prisma.friscoDepositario.findUnique({
    where: { id },
    include: { bien: { select: { codigo: true, descripcion: true } } },
  })
  if (!depositario) {
    return NextResponse.json({ error: "Depositario no encontrado" }, { status: 404 })
  }

  const { token, hash } = generarToken()
  const expiraEn = new Date(Date.now() + diasVigencia * 24 * 60 * 60 * 1000)
  const userId = (guard.user as { id?: string } | null)?.id ?? null

  const acceso = await prisma.$transaction(async (tx) => {
    // Revoca accesos activos previos del mismo depositario.
    await tx.friscoPortalAcceso.updateMany({
      where: { depositarioId: id, revocadoEn: null },
      data:  { revocadoEn: new Date() },
    })
    return tx.friscoPortalAcceso.create({
      data: { tokenHash: hash, depositarioId: id, expiraEn, createdBy: userId },
    })
  })

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const portalUrl = `${appUrl}/portal/frisco/${token}`

  let emailEnviado: { ok: boolean; error?: string } | null = null
  if (enviarEmail) {
    if (!depositario.email) {
      emailEnviado = { ok: false, error: "El depositario no tiene email registrado" }
    } else {
      emailEnviado = await enviarEmailAcceso(depositario.email, depositario.nombre, depositario.bien, portalUrl, expiraEn)
    }
  }

  return NextResponse.json({
    acceso: { id: acceso.id, expiraEn: acceso.expiraEn, createdAt: acceso.createdAt },
    token,        // mostrar UNA sola vez
    portalUrl,
    emailEnviado,
  }, { status: 201 })
}

async function enviarEmailAcceso(
  to: string,
  nombre: string,
  bien: { codigo: string; descripcion: string },
  url: string,
  expiraEn: Date,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const id = await getIdentidadPublica()
    const fechaExp = expiraEn.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "2-digit" })
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
        <h2 style="color:#003366">Acceso al portal de depositario — ${escapeHtml(id.nombreCompleto)}</h2>
        <p>Hola <strong>${escapeHtml(nombre)}</strong>,</p>
        <p>Como custodio del bien <strong>${escapeHtml(bien.codigo)}</strong> (${escapeHtml(bien.descripcion)}), se ha generado un acceso personal a su portal de seguimiento.</p>
        <p>Desde allí podrá consultar la información del bien y registrar su reporte mensual.</p>
        <div style="text-align:center;margin:30px 0">
          <a href="${url}" style="display:inline-block;background:#003366;color:#fff;padding:14px 26px;text-decoration:none;border-radius:5px;font-weight:bold">
            Abrir portal
          </a>
        </div>
        <p style="font-size:13px;color:#666">Este enlace es personal e intransferible. Vigencia hasta <strong>${fechaExp}</strong>.</p>
        <p style="font-size:12px;color:#999;word-break:break-all">Si el botón no funciona, copie este enlace: ${url}</p>
      </div>
    `
    await sendMail({ to, subject: "Acceso al portal de depositario", html })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido" }
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}
