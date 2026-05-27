/**
 * Helpers para tokens del portal externo del depositario FRISCO.
 *
 * Diseño:
 * - El token plano (32 bytes hex) sólo se devuelve al admin en el momento de
 *   creación. La BD guarda únicamente el SHA-256 → imposible recuperarlo.
 * - Para validar acceso público se calcula el hash de lo recibido y se busca.
 */

import { createHash, randomBytes } from "crypto"
import type { Prisma, PrismaClient } from "@prisma/client"

export function generarToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("hex")
  return { token, hash: hashToken(token) }
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

/**
 * Resuelve un token público a su acceso + depositario + bien. Devuelve `null`
 * si el token no existe, expiró o fue revocado. No incrementa el contador
 * (el caller decide si registrar el acceso o sólo validar).
 */
export async function resolverAcceso(
  prisma: PrismaClient | Prisma.TransactionClient,
  token: string,
) {
  if (!token || token.length !== 64) return null
  const hash = hashToken(token)

  const acceso = await prisma.friscoPortalAcceso.findUnique({
    where: { tokenHash: hash },
    include: {
      depositario: {
        include: {
          bien: {
            select: {
              id: true, codigo: true, descripcion: true, tipo: true,
              folioMatricula: true, placa: true, ubicacion: true,
              estadoJuridico: true, estadoFisico: true,
            },
          },
          reportes: { orderBy: { periodo: "desc" }, take: 12 },
        },
      },
    },
  })

  if (!acceso) return null
  if (acceso.revocadoEn) return null
  if (acceso.expiraEn.getTime() < Date.now()) return null
  return acceso
}

/** Periodo actual en formato YYYY-MM, basado en la zona horaria del servidor. */
export function periodoActual(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}
