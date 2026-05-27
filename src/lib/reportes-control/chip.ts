/**
 * Reportes CHIP (Contaduría General de la Nación).
 *
 * - chipBalance: Balance General — saldos por cuenta de las clases 1, 2 y 3
 *   al cierre del periodo. Suma D-C por cuenta hoja, agrupa por clase/grupo.
 * - chipActividad: Estado de Actividad — clases 4 (ingresos) y 5 (gastos).
 *
 * Sólo agrega comprobantes REGISTRADOS y no anulados del periodo.
 */

export type FilaSaldoCgc = {
  codigo: string
  nombre: string
  nivel: number
  naturaleza: 'DEBITO' | 'CREDITO'
  debitos: number
  creditos: number
  saldo: number                                  // según naturaleza
}

export async function chipBalance(prisma: any, periodoId: string) {
  const periodo = await prisma.cpPeriodoContable.findUnique({ where: { id: periodoId } })
  if (!periodo) throw new Error("Periodo contable no encontrado")

  // Agregar asientos por cuenta para clases 1, 2, 3
  const asientos = await prisma.cpAsiento.findMany({
    where: {
      comprobante: { periodoId, estado: 'REGISTRADO' },
      cuenta: { codigo: { in: ['1', '2', '3'].map(_ => undefined as any).filter(Boolean) } },
    },
    include: { cuenta: true },
  })
  // Re-filter en JS porque el "startsWith" sobre los 3 dígitos es más simple:
  const filtrados = asientos.filter((a: any) =>
    a.cuenta.codigo.startsWith('1') || a.cuenta.codigo.startsWith('2') || a.cuenta.codigo.startsWith('3'),
  )

  const acc = new Map<string, FilaSaldoCgc>()
  for (const a of filtrados) {
    const k = a.cuenta.codigo
    const f = acc.get(k) ?? {
      codigo: a.cuenta.codigo,
      nombre: a.cuenta.nombre,
      nivel: a.cuenta.nivel ?? a.cuenta.codigo.length,
      naturaleza: a.cuenta.naturaleza,
      debitos: 0, creditos: 0, saldo: 0,
    }
    f.debitos += Number(a.debito)
    f.creditos += Number(a.credito)
    acc.set(k, f)
  }

  const filas = Array.from(acc.values()).map(f => ({
    ...f,
    saldo: f.naturaleza === 'DEBITO' ? f.debitos - f.creditos : f.creditos - f.debitos,
  })).sort((a, b) => a.codigo.localeCompare(b.codigo))

  const totalActivo = filas.filter(f => f.codigo.startsWith('1')).reduce((s, f) => s + f.saldo, 0)
  const totalPasivo = filas.filter(f => f.codigo.startsWith('2')).reduce((s, f) => s + f.saldo, 0)
  const totalPatrimonio = filas.filter(f => f.codigo.startsWith('3')).reduce((s, f) => s + f.saldo, 0)

  return {
    periodo: { id: periodo.id, codigo: periodo.codigo, anio: periodo.anio, mes: periodo.mes },
    filas,
    totales: {
      activo: totalActivo,
      pasivo: totalPasivo,
      patrimonio: totalPatrimonio,
      pasivoMasPatrimonio: totalPasivo + totalPatrimonio,
      diferencia: totalActivo - (totalPasivo + totalPatrimonio),
    },
  }
}

export async function chipActividad(prisma: any, periodoId: string) {
  const periodo = await prisma.cpPeriodoContable.findUnique({ where: { id: periodoId } })
  if (!periodo) throw new Error("Periodo contable no encontrado")

  const asientos = await prisma.cpAsiento.findMany({
    where: { comprobante: { periodoId, estado: 'REGISTRADO' } },
    include: { cuenta: true },
  })
  const filtrados = asientos.filter((a: any) =>
    a.cuenta.codigo.startsWith('4') || a.cuenta.codigo.startsWith('5'),
  )

  const acc = new Map<string, FilaSaldoCgc>()
  for (const a of filtrados) {
    const k = a.cuenta.codigo
    const f = acc.get(k) ?? {
      codigo: a.cuenta.codigo,
      nombre: a.cuenta.nombre,
      nivel: a.cuenta.nivel ?? a.cuenta.codigo.length,
      naturaleza: a.cuenta.naturaleza,
      debitos: 0, creditos: 0, saldo: 0,
    }
    f.debitos += Number(a.debito)
    f.creditos += Number(a.credito)
    acc.set(k, f)
  }
  const filas = Array.from(acc.values()).map(f => ({
    ...f,
    saldo: f.naturaleza === 'DEBITO' ? f.debitos - f.creditos : f.creditos - f.debitos,
  })).sort((a, b) => a.codigo.localeCompare(b.codigo))

  const ingresos = filas.filter(f => f.codigo.startsWith('4')).reduce((s, f) => s + f.saldo, 0)
  const gastos = filas.filter(f => f.codigo.startsWith('5')).reduce((s, f) => s + f.saldo, 0)

  return {
    periodo: { id: periodo.id, codigo: periodo.codigo, anio: periodo.anio, mes: periodo.mes },
    filas,
    totales: {
      ingresos,
      gastos,
      excedente: ingresos - gastos,
    },
  }
}
