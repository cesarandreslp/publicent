/**
 * /api/superadmin/tenants/[id]
 * GET    — detalle del tenant
 * PATCH  — actualizar campos parciales
 * DELETE — eliminar tenant (soft delete → suspendido)
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSASession } from "@/lib/superadmin-auth"
import { prismaMeta } from "@/lib/prisma-meta"
import { invalidateTenantCache } from "@/lib/tenant"
import { encryptSecretos, decryptSecretos } from "@/lib/encryption"

type Params = { params: Promise<{ id: string }> }

// ─── GET /api/superadmin/tenants/[id] ────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const tenant = await prismaMeta.tenant.findUnique({
    where: { id },
    include: { eventos: { orderBy: { createdAt: "desc" }, take: 20 } },
  })

  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  return NextResponse.json({ tenant })
}

// ─── PATCH /api/superadmin/tenants/[id] ──────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()

    // Campos que se pueden actualizar (excluye id y campos inmutables)
    const {
      nombre,
      nombreCorto,
      nit,
      municipio,
      departamento,
      codigoDivipola,
      dominioPrincipal,
      dominioPersonalizado,
      databaseUrl,
      databaseName,
      plan,
      activo,
      suspendido,
      motivoSuspension,
      emailContacto,
      telefonoContacto,
      nombreContacto,
      logoUrl,
      colorPrimario,
      colorSecundario,
      fechaActivacion,
      fechaVencimiento,
      modulosActivos,
      groqApiKey,
      shipuApiKey,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpFrom,
      whatsappPhoneNumberId,
      whatsappAccessToken,
      whatsappFromPhone,
      secopClientId,
      secopClientSecret,
      secopNit,
    } = body

    const data: Record<string, unknown> = {}
    if (nombre             !== undefined) data.nombre             = nombre
    if (nombreCorto        !== undefined) data.nombreCorto        = nombreCorto
    if (nit                !== undefined) data.nit                = nit
    if (municipio          !== undefined) data.municipio          = municipio
    if (departamento       !== undefined) data.departamento       = departamento
    if (codigoDivipola     !== undefined) data.codigoDivipola     = codigoDivipola
    if (dominioPrincipal   !== undefined) data.dominioPrincipal   = dominioPrincipal
    if (dominioPersonalizado !== undefined) data.dominioPersonalizado = dominioPersonalizado || null
    if (databaseUrl        !== undefined) data.databaseUrl        = databaseUrl
    if (databaseName       !== undefined) data.databaseName       = databaseName
    if (plan               !== undefined) data.plan               = plan
    if (activo             !== undefined) data.activo             = activo
    if (suspendido         !== undefined) data.suspendido         = suspendido
    if (motivoSuspension   !== undefined) data.motivoSuspension   = motivoSuspension
    if (emailContacto      !== undefined) data.emailContacto      = emailContacto
    if (telefonoContacto   !== undefined) data.telefonoContacto   = telefonoContacto
    if (nombreContacto     !== undefined) data.nombreContacto     = nombreContacto
    if (logoUrl            !== undefined) data.logoUrl            = logoUrl
    if (colorPrimario      !== undefined) data.colorPrimario      = colorPrimario
    if (colorSecundario    !== undefined) data.colorSecundario    = colorSecundario
    if (fechaActivacion    !== undefined) data.fechaActivacion    = fechaActivacion ? new Date(fechaActivacion) : null
    if (fechaVencimiento   !== undefined) data.fechaVencimiento   = fechaVencimiento ? new Date(fechaVencimiento) : null
    if (modulosActivos     !== undefined) data.modulosActivos     = modulosActivos

    // Actualizar secretos cifrados (API keys IA + SMTP + WhatsApp): merge para no borrar otros campos
    const tocaSmtp = smtpHost !== undefined || smtpUser !== undefined || smtpPass !== undefined || smtpFrom !== undefined || smtpPort !== undefined
    const tocaWhatsApp = whatsappPhoneNumberId !== undefined || whatsappAccessToken !== undefined || whatsappFromPhone !== undefined
    const tocaSecop = secopClientId !== undefined || secopClientSecret !== undefined || secopNit !== undefined
    if (groqApiKey !== undefined || shipuApiKey !== undefined || tocaSmtp || tocaWhatsApp || tocaSecop) {
      const tenantActual = await prismaMeta.tenant.findUnique({
        where: { id },
        select: { secretosEncriptados: true },
      })
      const secretosActuales = decryptSecretos(tenantActual?.secretosEncriptados)

      let smtp = secretosActuales.smtp
      if (tocaSmtp) {
        const host = smtpHost !== undefined ? String(smtpHost).trim() : smtp?.host ?? ""
        const user = smtpUser !== undefined ? String(smtpUser).trim() : smtp?.user ?? ""
        // password en blanco en edición = conservar la actual
        const pass = (smtpPass !== undefined && String(smtpPass).length > 0) ? String(smtpPass) : smtp?.pass ?? ""
        const port = smtpPort !== undefined && smtpPort !== "" ? Number(smtpPort) : smtp?.port ?? 587
        const from = smtpFrom !== undefined ? (String(smtpFrom).trim() || undefined) : smtp?.from
        // Si limpian host y user, se elimina la config SMTP del tenant
        smtp = host && user ? { host, port, user, pass, from } : undefined
      }

      let whatsapp = secretosActuales.whatsapp
      if (tocaWhatsApp) {
        const phoneNumberId = whatsappPhoneNumberId !== undefined ? String(whatsappPhoneNumberId).trim() : whatsapp?.phoneNumberId ?? ""
        // token en blanco en edición = conservar el actual
        const accessToken = (whatsappAccessToken !== undefined && String(whatsappAccessToken).length > 0) ? String(whatsappAccessToken) : whatsapp?.accessToken ?? ""
        const fromPhone = whatsappFromPhone !== undefined ? String(whatsappFromPhone).trim() : whatsapp?.fromPhone ?? ""
        // Si limpian phoneNumberId, se elimina la config WhatsApp del tenant
        whatsapp = phoneNumberId && accessToken ? { phoneNumberId, accessToken, fromPhone } : undefined
      }

      let secop = secretosActuales.secop
      if (tocaSecop) {
        const clientId = secopClientId !== undefined ? String(secopClientId).trim() : secop?.clientId ?? ""
        // secret en blanco = conservar el actual
        const clientSecret = (secopClientSecret !== undefined && String(secopClientSecret).length > 0)
          ? String(secopClientSecret)
          : secop?.clientSecret ?? ""
        const nit = secopNit !== undefined ? String(secopNit).trim() : secop?.nit ?? ""
        // Si limpian clientId se elimina la config SECOP del tenant
        secop = clientId && clientSecret ? { clientId, clientSecret, nit } : undefined
      }

      const secretosNuevos = {
        ...secretosActuales,
        ...(groqApiKey  !== undefined ? { groqApiKey:  groqApiKey  || undefined } : {}),
        ...(shipuApiKey !== undefined ? { shipuApiKey: shipuApiKey || undefined } : {}),
        ...(tocaSmtp ? { smtp } : {}),
        ...(tocaWhatsApp ? { whatsapp } : {}),
        ...(tocaSecop ? { secop } : {}),
      }
      data.secretosEncriptados = encryptSecretos(secretosNuevos)
    }

    const tenant = await prismaMeta.tenant.update({ where: { id }, data })

    // Invalidar caché del tenant actualizado
    invalidateTenantCache(id)

    // Registrar evento de auditoría
    await prismaMeta.eventoTenant.create({
      data: {
        tenantId: id,
        tipo:     "CONFIGURACION",
        descripcion: `Actualizado por superadmin ${session.email}`,
        creadoPor: session.id,
      },
    })

    return NextResponse.json({ tenant })
  } catch (err: unknown) {
    console.error("[SA TENANT PATCH]", err instanceof Error ? err.message : String(err))
    const code = (err as { code?: string })?.code
    if (code === "P2025") return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    if (code === "P2002") return NextResponse.json({ error: "Dominio o código duplicado" }, { status: 409 })
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// ─── DELETE /api/superadmin/tenants/[id] ─────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  try {
    // Invalidar caché antes de suspender
    invalidateTenantCache(id)

    // Soft delete: suspender en lugar de eliminar físicamente
    await prismaMeta.tenant.update({
      where: { id },
      data: {
        activo:          false,
        suspendido:      true,
        motivoSuspension: `Eliminado por superadmin ${session.email}`,
      },
    })

    await prismaMeta.eventoTenant.create({
      data: {
        tenantId:    id,
        tipo:        "SUSPENSION",
        descripcion: `Desactivado por superadmin ${session.email}`,
        creadoPor: session.id,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code
    if (code === "P2025") return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
