/**
 * alertas.ts — Lógica compartida de detección de vencimientos.
 *
 * Funciones puras que reciben un PrismaClient (de cualquier tenant) y devuelven
 * las alertas. Reutilizadas tanto por:
 *   - los endpoints admin on-demand (UI muestra el listado), como por
 *   - el cron global diario (`/api/cron/diario`) que hace fan-out a todos los tenants.
 *
 * No envían emails ni tocan headers → se pueden ejecutar fuera de una request.
 */

import type { PrismaClient } from "@prisma/client"
import { ConEstadoContrato } from "@prisma/client"

type Db = PrismaClient

function diasHasta(fecha: Date, desde = new Date()): number {
  return Math.ceil((fecha.getTime() - desde.getTime()) / 86_400_000)
}

// ─── Pólizas FRISCO (depositarios) ────────────────────────────────────────────

export type AlertaPoliza = {
  depositarioId: string
  depositario: string
  email: string | null
  telefono: string | null
  bienId: string
  bienCodigo: string
  bienTipo: string
  polizaVigenteHasta: string  // ISO
  diasRestantes: number       // negativo si ya venció
}

/**
 * Depositarios activos cuya póliza vence dentro de `dias` días (o ya venció).
 */
export async function alertasPolizasFrisco(prisma: Db, dias = 30): Promise<AlertaPoliza[]> {
  const ahora = new Date()
  const limite = new Date(ahora)
  limite.setDate(limite.getDate() + dias)

  const deps = await prisma.friscoDepositario.findMany({
    where: {
      activo: true,
      polizaVigenteHasta: { not: null, lte: limite },
    },
    include: { bien: { select: { id: true, codigo: true, tipo: true } } },
    orderBy: { polizaVigenteHasta: "asc" },
  })

  return deps.map((d) => ({
    depositarioId: d.id,
    depositario: d.nombre,
    email: d.email,
    telefono: d.telefono,
    bienId: d.bien.id,
    bienCodigo: d.bien.codigo,
    bienTipo: d.bien.tipo,
    polizaVigenteHasta: d.polizaVigenteHasta!.toISOString(),
    diasRestantes: diasHasta(d.polizaVigenteHasta!, ahora),
  }))
}

// ─── Vencimiento de contratos (módulo contratación) ───────────────────────────

const ESTADOS_CONTRATO_VIGENTE: ConEstadoContrato[] = [
  ConEstadoContrato.SUSCRITO,
  ConEstadoContrato.EN_EJECUCION,
  ConEstadoContrato.SUSPENDIDO,
]

export type AlertaContrato = {
  contratoId: string
  numero: string
  contratista: string
  contratistaEmail: string | null
  supervisor: string | null
  procesoNumero: string
  objeto: string
  fechaTerminacion: string  // ISO
  diasRestantes: number
  estado: string
}

/**
 * Contratos vigentes cuya fecha de terminación cae dentro de `dias` días.
 */
export async function alertasVencimientoContratos(prisma: Db, dias = 30): Promise<AlertaContrato[]> {
  const ahora = new Date()
  const limite = new Date(ahora)
  limite.setDate(limite.getDate() + dias)

  const contratos = await prisma.conContrato.findMany({
    where: {
      estado: { in: ESTADOS_CONTRATO_VIGENTE },
      fechaTerminacion: { not: null, lte: limite },
    },
    include: { proceso: { select: { numero: true, objeto: true } } },
    orderBy: { fechaTerminacion: "asc" },
  })

  return contratos.map((c) => ({
    contratoId: c.id,
    numero: c.numero,
    contratista: c.contratistaNombre,
    contratistaEmail: c.contratistaEmail,
    supervisor: c.supervisorNombre,
    procesoNumero: c.proceso.numero,
    objeto: c.proceso.objeto,
    fechaTerminacion: c.fechaTerminacion!.toISOString(),
    diasRestantes: diasHasta(c.fechaTerminacion!, ahora),
    estado: c.estado,
  }))
}

// ─── Depositarios sin reporte del periodo ─────────────────────────────────────

export type DepositarioSinReporte = {
  depositarioId: string
  depositario: string
  email: string | null
  bienCodigo: string
}

/**
 * Depositarios activos (con acceso al portal vigente) que NO han registrado
 * el reporte del periodo indicado (YYYY-MM).
 */
export async function depositariosSinReporte(prisma: Db, periodo: string): Promise<DepositarioSinReporte[]> {
  const ahora = new Date()

  const deps = await prisma.friscoDepositario.findMany({
    where: {
      activo: true,
      accesos: {
        some: { revocadoEn: null, expiraEn: { gt: ahora } },
      },
      reportes: {
        none: { periodo },
      },
    },
    include: { bien: { select: { codigo: true } } },
  })

  return deps.map((d) => ({
    depositarioId: d.id,
    depositario: d.nombre,
    email: d.email,
    bienCodigo: d.bien.codigo,
  }))
}

/** Hitos de anticipación para no enviar emails todos los días. */
export const HITOS_ALERTA = [30, 15, 5, 1, 0]

/** Devuelve true si `diasRestantes` coincide con un hito de notificación. */
export function esHitoDeAlerta(diasRestantes: number): boolean {
  // Notificar en los hitos exactos y en cualquier día ya vencido (<=0 una vez por estar en 0)
  return HITOS_ALERTA.includes(diasRestantes)
}
