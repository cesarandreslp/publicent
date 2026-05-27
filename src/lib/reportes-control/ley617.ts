/**
 * Indicador Ley 617 / 2000.
 *
 * Para Personerías municipales y Contralorías territoriales fija un tope de
 * gastos de funcionamiento como % de los Ingresos Corrientes de Libre
 * Destinación (ICLD) del municipio. Para personerías municipales el rango es
 * 1.5%–3.7% del ICLD según categoría municipal.
 *
 * Este cálculo simplificado toma:
 *   - Gastos de funcionamiento  = apropiación rubro A.1 (CCPET) + A.2 ejecutada
 *   - ICLD                      = aforado definitivo rubros 1.1.0x.x (tributarios + no tributarios de libre dest.)
 *
 * El usuario puede pasar `icldManual` para sobreescribir la cifra ICLD cuando
 * la maneja por fuera (típico: lo manda la Secretaría de Hacienda municipal).
 */

export async function ley617({ prisma, vigencia, icldManual, topeCategoria = 0.037 }: {
  prisma: any
  vigencia: number
  icldManual?: number
  topeCategoria?: number                         // 0.037 = 3.7% (default categoría 6)
}) {
  // Gastos de funcionamiento ejecutados (obligados) de rubros A.1 y A.2
  const apropiaciones = await prisma.psuApropiacion.findMany({
    where: { vigencia, rubro: { tipo: 'GASTO', codigo: { startsWith: 'A.' } } },
    include: {
      rubro: {
        select: {
          codigo: true, nombre: true,
          cdps: {
            where: { vigencia, estado: { not: 'ANULADO' } },
            select: {
              valor: true,
              rps: {
                where: { estado: { not: 'ANULADO' } },
                select: {
                  obligaciones: {
                    where: { estado: { not: 'ANULADO' } },
                    select: { valor: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  let funcionamientoObligado = 0
  let funcionamientoApropiado = 0
  for (const a of apropiaciones) {
    const cod = a.rubro.codigo
    if (!cod.startsWith('A.1') && !cod.startsWith('A.2')) continue
    funcionamientoApropiado += Number(a.apropiacionInicial) + Number(a.adiciones) - Number(a.reducciones)
    for (const cdp of a.rubro.cdps) {
      for (const rp of cdp.rps) {
        for (const o of rp.obligaciones) funcionamientoObligado += Number(o.valor)
      }
    }
  }

  // ICLD: ingresos corrientes de libre destinación (CCPET 1.1.0x.x simplificado)
  let icld = icldManual ?? 0
  if (!icldManual) {
    const ingresos = await prisma.psuApropiacion.findMany({
      where: { vigencia, rubro: { tipo: 'INGRESO', codigo: { startsWith: '1.1' } } },
      include: { rubro: { select: { codigo: true } } },
    })
    icld = ingresos.reduce((s: number, a: any) => s + Number(a.apropiacionInicial) + Number(a.adiciones) - Number(a.reducciones), 0)
  }

  const indicador = icld > 0 ? funcionamientoObligado / icld : 0
  const cumple = indicador <= topeCategoria

  return {
    vigencia,
    funcionamientoApropiado,
    funcionamientoObligado,
    icld,
    icldFuente: icldManual ? 'manual' : 'derivado-ccpet-1.1',
    topeCategoria,
    indicador,
    indicadorPct: indicador * 100,
    topeCategoriaPct: topeCategoria * 100,
    cumple,
    holguraPesos: icld * topeCategoria - funcionamientoObligado,
  }
}
