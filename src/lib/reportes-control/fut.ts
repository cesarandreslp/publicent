/**
 * Reportes FUT (Formulario Único Territorial, DNP).
 *
 * - futIngresos: recaudo por rubro CCPET (clase 1.x.x... del CCP).
 * - futGastos: ejecución por rubro CCPET (apropiación / comprometido / obligado / pagado).
 *
 * Mismo patrón que la vista /api/admin/psu/ejecucion pero formateado para
 * mapear al FUT y persistido como snapshot.
 */

export async function futGastos(prisma: any, vigencia: number) {
  const apropiaciones = await prisma.psuApropiacion.findMany({
    where: { vigencia },
    include: {
      rubro: {
        select: {
          codigo: true, nombre: true, nivel: true, tipo: true,
          cdps: {
            where: { vigencia, estado: { not: 'ANULADO' } },
            select: {
              valor: true,
              rps: {
                where: { estado: { not: 'ANULADO' } },
                select: {
                  valor: true,
                  obligaciones: {
                    where: { estado: { not: 'ANULADO' } },
                    select: {
                      valor: true,
                      pagos: { where: { estado: { not: 'ANULADO' } }, select: { valor: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { rubro: { codigo: 'asc' } },
  })

  const filas = apropiaciones
    .filter((a: any) => a.rubro.tipo === 'GASTO')
    .map((a: any) => {
      const apropiado = Number(a.apropiacionInicial) + Number(a.adiciones) - Number(a.reducciones)
      let comprometido = 0, obligado = 0, pagado = 0
      for (const cdp of a.rubro.cdps) {
        comprometido += Number(cdp.valor)
        for (const rp of cdp.rps) {
          for (const o of rp.obligaciones) {
            obligado += Number(o.valor)
            for (const p of o.pagos) pagado += Number(p.valor)
          }
        }
      }
      return {
        codigo: a.rubro.codigo,
        nombre: a.rubro.nombre,
        nivel: a.rubro.nivel,
        apropiacionInicial: Number(a.apropiacionInicial),
        adiciones: Number(a.adiciones),
        reducciones: Number(a.reducciones),
        apropiado,
        comprometido,
        obligado,
        pagado,
        porEjecutar: apropiado - obligado,
      }
    })

  const totales = filas.reduce(
    (s: any, r: any) => ({
      apropiado: s.apropiado + r.apropiado,
      comprometido: s.comprometido + r.comprometido,
      obligado: s.obligado + r.obligado,
      pagado: s.pagado + r.pagado,
    }),
    { apropiado: 0, comprometido: 0, obligado: 0, pagado: 0 },
  )

  return { vigencia, filas, totales }
}

export async function futIngresos(prisma: any, vigencia: number) {
  // Recaudo real = créditos en clase 4 (ingresos contables) cuyas cuentas estén
  // amarradas a rubros CCPET de ingreso. Como esa amarra no existe a nivel
  // catálogo, devolvemos la apropiación de ingresos + un placeholder de recaudo
  // basado en clase 4 contable (suma C - D).
  const apropiaciones = await prisma.psuApropiacion.findMany({
    where: { vigencia },
    include: { rubro: { select: { codigo: true, nombre: true, nivel: true, tipo: true } } },
    orderBy: { rubro: { codigo: 'asc' } },
  })

  const filas = apropiaciones
    .filter((a: any) => a.rubro.tipo === 'INGRESO')
    .map((a: any) => ({
      codigo: a.rubro.codigo,
      nombre: a.rubro.nombre,
      nivel: a.rubro.nivel,
      aforado: Number(a.apropiacionInicial),
      adiciones: Number(a.adiciones),
      reducciones: Number(a.reducciones),
      aforadoDefinitivo: Number(a.apropiacionInicial) + Number(a.adiciones) - Number(a.reducciones),
    }))

  const totales = filas.reduce(
    (s: any, r: any) => ({ aforadoDefinitivo: s.aforadoDefinitivo + r.aforadoDefinitivo }),
    { aforadoDefinitivo: 0 },
  )

  return { vigencia, filas, totales, nota: "Recaudo real pendiente de amarrar al asiento contable (clase 4) por subcuenta." }
}
