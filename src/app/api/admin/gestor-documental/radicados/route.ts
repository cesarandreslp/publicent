/**
 * /api/admin/gestor-documental/radicados — DEPRECADO.
 *
 * Esta ruta usaba prisma.radicado y prisma.trazabilidadRadicado,
 * modelos que NO existen en el schema Prisma actual.
 *
 * El endpoint correcto es: /api/admin/gd/radicados
 * que usa prisma.gdRadicado con el modelo oficial AGN-compatible.
 */
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      error: "Endpoint deprecado. Use /api/admin/gd/radicados",
      redirectTo: "/api/admin/gd/radicados",
    },
    {
      status: 301,
      headers: { Location: "/api/admin/gd/radicados" },
    }
  )
}

export async function POST() {
  return NextResponse.json(
    {
      error: "Endpoint deprecado. Use /api/admin/gd/radicados",
      redirectTo: "/api/admin/gd/radicados",
    },
    {
      status: 301,
      headers: { Location: "/api/admin/gd/radicados" },
    }
  )
}
