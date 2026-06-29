"use client"

import { useCallback, useState } from "react"

/**
 * AltchaCaptcha — Captcha proof-of-work open-source, self-hosted, sin dependencias de widget.
 *
 * Obtiene el desafío de /api/altcha/challenge (con reintentos para tolerar 503/HTML transitorios),
 * resuelve el PoW en el navegador con crypto.subtle (SHA-256) y entrega el payload base64 que el
 * backend verifica con `verifySolution` (src/lib/altcha.ts). Sin cuentas ni llaves de terceros.
 */

type Estado = "idle" | "verificando" | "verificado" | "error"

interface Challenge {
  algorithm: string
  challenge: string
  maxnumber: number
  salt: string
  signature: string
}

async function obtenerChallenge(): Promise<Challenge | null> {
  for (let intento = 0; intento < 4; intento++) {
    try {
      const res = await fetch("/api/altcha/challenge", { cache: "no-store" })
      const ct = res.headers.get("content-type") ?? ""
      if (res.ok && ct.includes("application/json")) {
        return (await res.json()) as Challenge
      }
    } catch {
      /* reintentar */
    }
    await new Promise((r) => setTimeout(r, 600 * (intento + 1)))
  }
  return null
}

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

async function resolverPoW(ch: Challenge): Promise<number | null> {
  const enc = new TextEncoder()
  for (let n = 0; n <= ch.maxnumber; n++) {
    const hash = toHex(await crypto.subtle.digest("SHA-256", enc.encode(ch.salt + n)))
    if (hash === ch.challenge) return n
  }
  return null
}

export function AltchaCaptcha({
  onVerified,
}: {
  onVerified: (payload: string | null) => void
}) {
  const [estado, setEstado] = useState<Estado>("idle")

  const verificar = useCallback(async () => {
    if (estado === "verificando" || estado === "verificado") return
    setEstado("verificando")
    onVerified(null)
    try {
      const ch = await obtenerChallenge()
      if (!ch) {
        setEstado("error")
        return
      }
      const number = await resolverPoW(ch)
      if (number === null) {
        setEstado("error")
        return
      }
      const payload = btoa(
        JSON.stringify({
          algorithm: ch.algorithm,
          challenge: ch.challenge,
          number,
          salt: ch.salt,
          signature: ch.signature,
        })
      )
      onVerified(payload)
      setEstado("verificado")
    } catch {
      setEstado("error")
    }
  }, [estado, onVerified])

  return (
    <div className="w-full max-w-sm">
      <label
        className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 ${
          estado === "verificado"
            ? "border-green-300"
            : estado === "error"
              ? "border-red-300"
              : "border-gray-300 cursor-pointer hover:border-gov-blue"
        }`}
      >
        <input
          type="checkbox"
          checked={estado === "verificado"}
          disabled={estado === "verificando" || estado === "verificado"}
          onChange={verificar}
          aria-label="Verificar que no soy un robot"
          className="h-5 w-5 rounded border-gray-300 text-gov-blue focus:ring-gov-blue"
        />
        <span className="text-sm text-gray-700">
          {estado === "verificando"
            ? "Verificando…"
            : estado === "verificado"
              ? "Verificación completada ✓"
              : "No soy un robot"}
        </span>
        {estado === "verificando" && (
          <span
            className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-gov-blue border-t-transparent"
            aria-hidden
          />
        )}
      </label>

      {estado === "error" && (
        <button
          type="button"
          onClick={() => {
            setEstado("idle")
            verificar()
          }}
          className="mt-2 text-sm text-gov-blue hover:underline"
        >
          No se pudo verificar. Reintentar.
        </button>
      )}

      <p className="mt-1 text-right text-[10px] text-gray-400">Protegido por ALTCHA · sin cookies</p>
    </div>
  )
}
