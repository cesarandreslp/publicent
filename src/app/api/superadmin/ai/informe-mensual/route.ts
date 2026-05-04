/**
 * POST /api/superadmin/ai/informe-mensual
 *
 * Stub temporal — la implementación original referenciaba campos
 * (estadoSemaforo, tipo) que no existen en el modelo PQRS actual.
 * Pendiente: reescribir cálculo de semáforo a partir de fechaVencimiento.
 */

import { NextResponse } from "next/server"
import { getSASession } from "@/lib/superadmin-auth"

export async function POST() {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  return NextResponse.json(
    { error: "Feature no disponible. Pendiente migración a nuevo schema PQRS." },
    { status: 503 }
  )
}
