/**
 * GET /api/altcha/challenge
 *
 * Genera un desafío ALTCHA (proof-of-work, open-source, self-hosted).
 * No depende de ningún servicio externo ni cuenta de terceros: el desafío se firma
 * con HMAC usando ALTCHA_HMAC_KEY y el cliente (widget ALTCHA) lo resuelve en el navegador.
 * La solución se verifica luego en POST /api/pqrsd con `verifySolution`.
 */

import { NextResponse } from "next/server"
import { createChallenge } from "altcha-lib/v1"

// Siempre dinámico: cada desafío debe ser único y no cacheable.
export const dynamic = "force-dynamic"

export async function GET() {
  const hmacKey = process.env.ALTCHA_HMAC_KEY
  if (!hmacKey) {
    console.error("[ALTCHA] ALTCHA_HMAC_KEY no configurada")
    return NextResponse.json(
      { error: "Captcha no configurado en el servidor" },
      { status: 500 }
    )
  }

  const challenge = await createChallenge({
    hmacKey,
    maxnumber: 50_000, // dificultad del proof-of-work (resoluble en el navegador en ~1s)
    expires: new Date(Date.now() + 5 * 60_000), // el desafío caduca a los 5 minutos
  })

  return NextResponse.json(challenge, {
    headers: { "Cache-Control": "no-store" },
  })
}
