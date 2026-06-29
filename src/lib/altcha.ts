/**
 * altcha.ts — Implementación mínima del protocolo ALTCHA (proof-of-work) con node:crypto.
 *
 * Open-source, self-hosted, SIN dependencias externas ni cuentas de terceros: el reto se firma
 * con HMAC usando un secreto propio (ALTCHA_HMAC_KEY). Compatible con el widget cliente `altcha`
 * (algoritmo clásico SHA-256): el navegador busca `number` tal que SHA-256(salt + number) === challenge.
 */

import crypto from "node:crypto"

const ALGORITHM = "SHA-256" as const

export interface AltchaChallenge {
  algorithm: typeof ALGORITHM
  challenge: string
  maxnumber: number
  salt: string
  signature: string
}

const sha256Hex = (s: string) => crypto.createHash("sha256").update(s).digest("hex")
const hmacHex = (key: string, s: string) => crypto.createHmac("sha256", key).update(s).digest("hex")

/** Genera un reto firmado. `expiresInSec` codifica una caducidad dentro del salt. */
export function createChallenge(
  hmacKey: string,
  opts: { maxnumber?: number; expiresInSec?: number } = {}
): AltchaChallenge {
  const maxnumber = opts.maxnumber ?? 50_000
  const number = crypto.randomInt(0, maxnumber)
  const saltBytes = crypto.randomBytes(12).toString("hex")
  const salt = opts.expiresInSec
    ? `${saltBytes}?expires=${Math.floor(Date.now() / 1000) + opts.expiresInSec}`
    : saltBytes
  const challenge = sha256Hex(salt + number)
  const signature = hmacHex(hmacKey, challenge)
  return { algorithm: ALGORITHM, challenge, maxnumber, salt, signature }
}

/** Verifica el payload base64 que entrega el widget. Comprueba PoW, firma HMAC y caducidad. */
export function verifySolution(payloadBase64: string, hmacKey: string): boolean {
  let p: {
    algorithm?: string
    challenge?: string
    number?: number
    salt?: string
    signature?: string
  }
  try {
    p = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf8"))
  } catch {
    return false
  }

  if (
    !p ||
    p.algorithm !== ALGORITHM ||
    typeof p.challenge !== "string" ||
    typeof p.salt !== "string" ||
    typeof p.signature !== "string" ||
    typeof p.number !== "number"
  ) {
    return false
  }

  // Caducidad (si el salt la codifica)
  const expMatch = p.salt.match(/[?&]expires=(\d+)/)
  if (expMatch) {
    const expires = Number.parseInt(expMatch[1], 10)
    if (Number.isFinite(expires) && expires < Math.floor(Date.now() / 1000)) return false
  }

  // Proof-of-work
  if (sha256Hex(p.salt + p.number) !== p.challenge) return false

  // Firma HMAC (comparación en tiempo constante)
  const expectedSig = hmacHex(hmacKey, p.challenge)
  if (expectedSig.length !== p.signature.length) return false
  return crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(p.signature))
}
