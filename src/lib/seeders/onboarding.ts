/**
 * onboarding.ts — Seeder de catálogos comunes para nuevos tenants
 *
 * Siembra: dependencias GD, TRD base (series + subseries + tipos documentales)
 * y terceros del Estado para contabilidad/presupuesto.
 *
 * Idempotente: usa upsert por código/documento. Puede correrse varias veces
 * sin duplicar datos ni romper registros existentes.
 *
 * Uso manual:
 *   DATABASE_URL=<url_tenant> npx tsx scripts/seed-onboarding.ts
 */

import {
  DEPENDENCIAS_BASE,
  TRD_SERIES_BASE,
  TERCEROS_ESTADO,
} from './catalogo-entidades'

// ─── Dependencias GD ─────────────────────────────────────────────────────────

export async function seedDependencias(prisma: any): Promise<{ total: number }> {
  // Primera pasada: raíces (sin padre)
  for (const dep of DEPENDENCIAS_BASE.filter((d) => !d.padresCodigo)) {
    await prisma.gdTrdDependencia.upsert({
      where: { codigo: dep.codigo },
      create: { codigo: dep.codigo, nombre: dep.nombre, descripcion: dep.descripcion },
      update: { nombre: dep.nombre, descripcion: dep.descripcion },
    })
  }

  // Segunda pasada: hijas (resuelve padreId)
  for (const dep of DEPENDENCIAS_BASE.filter((d) => d.padresCodigo)) {
    const padre = await prisma.gdTrdDependencia.findUnique({ where: { codigo: dep.padresCodigo! } })
    if (!padre) continue
    await prisma.gdTrdDependencia.upsert({
      where: { codigo: dep.codigo },
      create: { codigo: dep.codigo, nombre: dep.nombre, descripcion: dep.descripcion, padreId: padre.id },
      update: { nombre: dep.nombre, descripcion: dep.descripcion, padreId: padre.id },
    })
  }

  return { total: DEPENDENCIAS_BASE.length }
}

// ─── TRD base ─────────────────────────────────────────────────────────────────

export async function seedTrd(prisma: any): Promise<{ series: number; subseries: number; tipos: number }> {
  let seriesCount = 0
  let subseriesCount = 0
  let tiposCount = 0

  for (const defSerie of TRD_SERIES_BASE) {
    const dep = await prisma.gdTrdDependencia.findUnique({ where: { codigo: defSerie.dependenciaCodigo } })
    if (!dep) continue

    // Serie
    const serie = await prisma.gdTrdSerie.upsert({
      where: { codigo_dependenciaId: { codigo: defSerie.codigo, dependenciaId: dep.id } },
      create: { codigo: defSerie.codigo, nombre: defSerie.nombre, dependenciaId: dep.id },
      update: { nombre: defSerie.nombre },
    })
    seriesCount++

    for (const defSub of defSerie.subseries) {
      const subserie = await prisma.gdTrdSubserie.upsert({
        where: { codigo_serieId: { codigo: defSub.codigo, serieId: serie.id } },
        create: {
          codigo: defSub.codigo,
          nombre: defSub.nombre,
          tiempoGestion: defSub.tiempoGestion ?? 2,
          tiempoCentral: defSub.tiempoCentral ?? 3,
          soporteFisico: defSub.soporteFisico ?? false,
          soporteElectronico: defSub.soporteElectronico ?? true,
          disposicion: defSub.disposicion ?? 'CONSERVACION_TOTAL',
          procedimiento: defSub.procedimiento,
          serieId: serie.id,
        },
        update: {
          nombre: defSub.nombre,
          tiempoGestion: defSub.tiempoGestion ?? 2,
          tiempoCentral: defSub.tiempoCentral ?? 3,
          disposicion: defSub.disposicion ?? 'CONSERVACION_TOTAL',
          procedimiento: defSub.procedimiento,
        },
      })
      subseriesCount++

      for (const tipoNombre of defSub.tiposDocumentales ?? []) {
        // GdTrdTipoDocumental no tiene unique por nombre+subserieId en el schema,
        // así que usamos findFirst + create para evitar duplicados.
        const existe = await prisma.gdTrdTipoDocumental.findFirst({
          where: { nombre: tipoNombre, subserieId: subserie.id },
        })
        if (!existe) {
          await prisma.gdTrdTipoDocumental.create({
            data: { nombre: tipoNombre, subserieId: subserie.id },
          })
          tiposCount++
        }
      }
    }
  }

  return { series: seriesCount, subseries: subseriesCount, tipos: tiposCount }
}

// ─── Terceros del Estado ──────────────────────────────────────────────────────

export async function seedTercerosEstado(prisma: any): Promise<{ total: number }> {
  for (const t of TERCEROS_ESTADO) {
    await prisma.cpAuxiliarTercero.upsert({
      where: { documento: t.documento },
      create: {
        documento: t.documento,
        tipoDocumento: t.tipo,
        razonSocial: t.razonSocial,
        ciudad: t.ciudad,
      },
      update: {
        razonSocial: t.razonSocial,
        ciudad: t.ciudad,
      },
    })
  }
  return { total: TERCEROS_ESTADO.length }
}

// ─── Orquestador completo ─────────────────────────────────────────────────────

export async function seedOnboarding(prisma: any): Promise<{
  dependencias: number
  series: number
  subseries: number
  tiposDoc: number
  terceros: number
}> {
  const deps = await seedDependencias(prisma)
  const trd = await seedTrd(prisma)
  const terceros = await seedTercerosEstado(prisma)

  return {
    dependencias: deps.total,
    series: trd.series,
    subseries: trd.subseries,
    tiposDoc: trd.tipos,
    terceros: terceros.total,
  }
}
