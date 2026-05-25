/**
 * furag-validator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Servicio de validación automática de indicadores FURAG.
 *
 * Cruza datos reales del sistema (PQRSD, Gestor Documental, noticias, etc.)
 * con los indicadores FURAG definidos para detectar inconsistencias entre
 * el puntaje declarado manualmente y los datos operativos.
 *
 * Indicadores con fuente de datos en el sistema:
 *
 *  POL06 — Atención al Ciudadano (PQRSD)
 *    • Tasa de respuesta oportuna (dentro del plazo CPACA)
 *    • Volumen de PQRSD radicados por tipo
 *    • % de solicitudes respondidas vs pendientes
 *    • Uso del canal digital vs presencial
 *    • Cobertura demográfica (FURAG POL06)
 *
 *  POL07 — Gestión Documental (GD)
 *    • % de radicados respondidos en término
 *    • Ratio VoBo aprobados/rechazados
 *    • Existencia de TRD activas
 *
 *  POL03 — Transparencia
 *    • Documentos publicados vs año anterior
 *    • Noticias/comunicados en el período
 *
 * La función principal retorna un array de IndicadorValidado con:
 *   - estado: CONSISTENTE | ALERTA | INCONSISTENTE
 *   - puntajeDeclarado (del registro MipgEvaluacion)
 *   - puntajeSugerido  (calculado automáticamente)
 *   - brecha           (diferencia absoluta)
 *   - evidencia        (datos que respaldan el cálculo)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { PrismaClient } from '@prisma/client'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type EstadoValidacion = 'CONSISTENTE' | 'ALERTA' | 'INCONSISTENTE'

export interface IndicadorValidado {
  /** Código interno del indicador (ej: "POL06-PQRSD-OPORTUNA") */
  codigo:            string
  /** Nombre descriptivo */
  nombre:            string
  /** Política MIPG a la que pertenece (ej: "POL06") */
  politica:          string
  /** Estado de consistencia comparando puntaje declarado vs calculado */
  estado:            EstadoValidacion
  /** Puntaje declarado en la evaluación manual (null si no hay evaluación) */
  puntajeDeclarado:  number | null
  /** Puntaje sugerido según datos del sistema (0–100) */
  puntajeSugerido:   number
  /** Diferencia absoluta puntajeDeclarado – puntajeSugerido */
  brecha:            number | null
  /** Datos reales que soportan el cálculo */
  evidencia:         Record<string, number | string>
  /** Recomendación de acción */
  recomendacion:     string
  /** Timestamp del cálculo */
  calculadoEn:       string
}

export interface ResultadoValidacion {
  anioVigencia:       number
  indicadores:        IndicadorValidado[]
  resumen: {
    totalIndicadores:   number
    consistentes:       number
    alertas:            number
    inconsistentes:     number
    sinEvaluacion:      number
    idiFuragSugerido:   number  // Promedio ponderado de puntajes sugeridos
  }
}

// ─── Umbrales de semáforo de brecha ──────────────────────────────────────────

const UMBRAL_ALERTA      = 10  // Diferencia > 10 puntos → ALERTA
const UMBRAL_INCONSISTENTE = 20  // Diferencia > 20 puntos → INCONSISTENTE

function clasificarEstado(
  puntajeDeclarado: number | null,
  puntajeSugerido:  number
): { estado: EstadoValidacion; brecha: number | null } {
  if (puntajeDeclarado === null) return { estado: 'ALERTA', brecha: null }
  const brecha = Math.abs(puntajeDeclarado - puntajeSugerido)
  if (brecha > UMBRAL_INCONSISTENTE) return { estado: 'INCONSISTENTE', brecha }
  if (brecha > UMBRAL_ALERTA)        return { estado: 'ALERTA',         brecha }
  return { estado: 'CONSISTENTE', brecha }
}

// ─── Función principal ────────────────────────────────────────────────────────

export async function validarIndicadoresFURAG(
  prisma: PrismaClient,
  anioVigencia: number
): Promise<ResultadoValidacion> {
  const desde = new Date(anioVigencia, 0, 1)
  const hasta = new Date(Math.min(
    new Date(anioVigencia, 11, 31, 23, 59, 59).getTime(),
    Date.now()
  ))

  const calculadoEn = new Date().toISOString()
  const indicadores: IndicadorValidado[] = []

  // Obtener evaluaciones declaradas del año para comparar
  const evaluaciones = await prisma.mipgEvaluacion.findMany({
    where: { anioVigencia },
    include: { politica: { select: { codigo: true, nombre: true } } },
  }).catch(() => [])

  const evalPorPolitica = new Map<string, number>()
  for (const e of evaluaciones) {
    // Si hay múltiples evaluaciones para la misma política, tomamos el promedio
    const existing = evalPorPolitica.get(e.politica.codigo)
    if (existing !== undefined) {
      evalPorPolitica.set(e.politica.codigo, (existing + e.puntaje) / 2)
    } else {
      evalPorPolitica.set(e.politica.codigo, e.puntaje)
    }
  }

  // ─── POL06: Atención al Ciudadano (PQRSD) ──────────────────────────────────

  try {
    const [
      totalPqrsd,
      respondidas,
      enTermino,
      radicadasDigital,
      conDemografia,
      porTipo,
    ] = await Promise.all([
      // Total PQRSD radicadas en el período
      prisma.pQRS.count({ where: { createdAt: { gte: desde, lte: hasta } } }),

      // Total respondidas
      prisma.pQRS.count({
        where: {
          createdAt: { gte: desde, lte: hasta },
          estado: { in: ['RESPONDIDA', 'CERRADA'] },
        },
      }),

      // Respondidas dentro del plazo (fechaRespuesta <= fechaVencimiento)
      prisma.pQRS.count({
        where: {
          createdAt: { gte: desde, lte: hasta },
          estado: { in: ['RESPONDIDA', 'CERRADA'] },
          fechaVencimiento: { not: null },
          fechaRespuesta:   { lte: prisma.pQRS.fields?.fechaVencimiento as unknown as Date ?? hasta },
        },
      }).catch(() => 0),

      // Radicadas por canal digital (tienen email real, no placeholder)
      prisma.pQRS.count({
        where: {
          createdAt: { gte: desde, lte: hasta },
          email: { not: { contains: 'placeholder' } },
        },
      }),

      // Con datos demográficos (FURAG POL06 específico)
      prisma.vuDemografia?.count({
        where: { pqrs: { createdAt: { gte: desde, lte: hasta } } },
      }).catch(() => 0) ?? 0,

      // Por tipo de PQRSD
      prisma.pQRS.groupBy({
        by: ['tipo'],
        where: { createdAt: { gte: desde, lte: hasta } },
        _count: true,
      }).catch(() => []),
    ])

    // ── Indicador POL06-1: Tasa de respuesta oportuna ──────────────────────

    // Cálculo simplificado: respondidas vs total. El plazo exacto requiere
    // fechaVencimiento que se calcula al momento de radican.
    const respondidasyConocidas = await prisma.pQRS.count({
      where: {
        createdAt: { gte: desde, lte: hasta },
        estado: { in: ['RESPONDIDA', 'CERRADA'] },
        fechaVencimiento: { not: null },
        fechaRespuesta:   { not: null },
      },
    }).catch(() => 0)

    const totalConPlazo = await prisma.pQRS.count({
      where: {
        createdAt: { gte: desde, lte: hasta },
        estado: { in: ['RESPONDIDA', 'CERRADA'] },
        fechaVencimiento: { not: null },
      },
    }).catch(() => 0)

    // Calcular % oportunidad directamente desde la base de datos
    const enTerminoReal = await prisma.pQRS.findMany({
      where: {
        createdAt: { gte: desde, lte: hasta },
        estado: { in: ['RESPONDIDA', 'CERRADA'] },
        fechaVencimiento: { not: null },
        fechaRespuesta:   { not: null },
      },
      select: { fechaRespuesta: true, fechaVencimiento: true },
    }).catch(() => [])

    const enTerminoCount = enTerminoReal.filter(
      r => r.fechaRespuesta && r.fechaVencimiento && r.fechaRespuesta <= r.fechaVencimiento
    ).length

    const tasaOportunidad = totalConPlazo > 0
      ? Math.round((enTerminoCount / totalConPlazo) * 100)
      : totalPqrsd === 0 ? 100 : 0  // Sin radicados = 100% (no aplica)

    const puntajePol06_1 = tasaOportunidad  // 0-100 directo

    const polCod = 'POL06'
    const pdPol06 = evalPorPolitica.get(polCod) ?? null

    const { estado: estado1, brecha: brecha1 } = clasificarEstado(pdPol06, puntajePol06_1)

    indicadores.push({
      codigo:           'POL06-ATENCION-OPORTUNA',
      nombre:           'Respuesta oportuna PQRSD (dentro del plazo CPACA)',
      politica:         polCod,
      estado:           estado1,
      puntajeDeclarado: pdPol06,
      puntajeSugerido:  puntajePol06_1,
      brecha:           brecha1,
      evidencia: {
        totalPqrsd,
        respondidas,
        enTermino:     enTerminoCount,
        totalConPlazo,
        tasaOportunidad: `${tasaOportunidad}%`,
      },
      recomendacion: tasaOportunidad >= 90
        ? 'Excelente gestión de tiempos. Mantener.'
        : tasaOportunidad >= 70
        ? 'Mejorar seguimiento a vencimientos. Revisar semáforos en rojo.'
        : 'Crítico: muchos radicados fuera de término. Activar plan de choque.',
      calculadoEn,
    })

    // ── Indicador POL06-2: Tasa de cobertura digital ───────────────────────

    const tasaDigital = totalPqrsd > 0 ? Math.round((radicadasDigital / totalPqrsd) * 100) : 100
    const puntajePol06_2 = tasaDigital

    const { estado: estado2, brecha: brecha2 } = clasificarEstado(pdPol06, puntajePol06_2)

    indicadores.push({
      codigo:           'POL06-CANAL-DIGITAL',
      nombre:           'Cobertura canal digital PQRSD',
      politica:         polCod,
      estado:           estado2,
      puntajeDeclarado: pdPol06,
      puntajeSugerido:  puntajePol06_2,
      brecha:           brecha2,
      evidencia: {
        totalPqrsd,
        radicadasDigital,
        radicadasPresencial: totalPqrsd - radicadasDigital,
        tasaDigital: `${tasaDigital}%`,
      },
      recomendacion: tasaDigital >= 80
        ? 'Alto uso del canal digital. Continuar promoviendo.'
        : 'Fortalecer divulgación del portal ciudadano digital.',
      calculadoEn,
    })

    // ── Indicador POL06-3: Cobertura demográfica (FURAG POL06 específico) ──

    const tasaDemografia = totalPqrsd > 0 ? Math.round((conDemografia / totalPqrsd) * 100) : 0
    // Puntaje: 100 si >= 70% tiene datos, escala lineal si no
    const puntajePol06_3 = Math.min(100, Math.round((tasaDemografia / 70) * 100))

    indicadores.push({
      codigo:           'POL06-DEMOGRAFIA',
      nombre:           'Recolección datos demográficos (FURAG POL06)',
      politica:         polCod,
      estado:           tasaDemografia >= 50 ? 'CONSISTENTE' : 'ALERTA',
      puntajeDeclarado: null,  // No hay puntaje MIPG directo para este sub-indicador
      puntajeSugerido:  puntajePol06_3,
      brecha:           null,
      evidencia: {
        totalPqrsd,
        conDemografia,
        sinDemografia: totalPqrsd - conDemografia,
        cobertura: `${tasaDemografia}%`,
      },
      recomendacion: tasaDemografia >= 70
        ? 'Buena recolección demográfica. Útil para FURAG POL06.'
        : 'Aumentar recolección de datos demográficos en la radicación.',
      calculadoEn,
    })

    // ── Indicador POL06-4: Distribución tipológica ─────────────────────────

    const denuncias = porTipo.find(t => t.tipo === 'DENUNCIA')?._count ?? 0
    const quejas    = porTipo.find(t => t.tipo === 'QUEJA')?._count ?? 0
    const peticiones = porTipo.find(t => t.tipo === 'PETICION')?._count ?? 0

    // Indicador informativo: no tiene puntaje directo pero sí alerta si hay muchas denuncias
    const pctDenuncias = totalPqrsd > 0 ? Math.round((denuncias / totalPqrsd) * 100) : 0

    indicadores.push({
      codigo:           'POL06-TIPOLOGIA',
      nombre:           'Distribución tipológica PQRSD',
      politica:         polCod,
      estado:           pctDenuncias > 40 ? 'ALERTA' : 'CONSISTENTE',
      puntajeDeclarado: null,
      puntajeSugerido:  100,  // Informativo
      brecha:           null,
      evidencia: {
        totalPqrsd,
        peticiones,
        quejas,
        denuncias,
        pctDenuncias: `${pctDenuncias}%`,
        otros: totalPqrsd - peticiones - quejas - denuncias,
      },
      recomendacion: pctDenuncias > 40
        ? `ALERTA: ${pctDenuncias}% de denuncias. Revisar causas sistémicas.`
        : 'Distribución tipológica normal. Monitorear tendencias.',
      calculadoEn,
    })
  } catch (e) {
    console.error('[furag-validator] Error en POL06:', e instanceof Error ? e.message : e)
  }

  // ─── POL07: Gestión Documental ─────────────────────────────────────────────

  try {
    const [totalGd, respondidosGd, voboAprobados, voboTotal, trdActivas] = await Promise.all([
      prisma.gdRadicado.count({ where: { createdAt: { gte: desde, lte: hasta } } }).catch(() => 0),
      prisma.gdRadicado.count({
        where: { createdAt: { gte: desde, lte: hasta }, estado: 'RESPONDIDO' },
      }).catch(() => 0),
      prisma.gdVoBo.count({ where: { estado: 'APROBADO', createdAt: { gte: desde, lte: hasta } } }).catch(() => 0),
      prisma.gdVoBo.count({ where: { createdAt: { gte: desde, lte: hasta } } }).catch(() => 0),
      prisma.gdTrdDependencia.count({ where: { activa: true } }).catch(() => 0),
    ])

    const tasaRespGd = totalGd > 0 ? Math.round((respondidosGd / totalGd) * 100) : 100
    const tasaVobo  = voboTotal > 0 ? Math.round((voboAprobados / voboTotal) * 100) : 100

    // Puntaje ponderado GD: 50% tasa respuesta + 30% VoBo + 20% TRD
    const puntajeTrd = trdActivas > 0 ? 100 : 0
    const puntajePol07 = Math.round(0.5 * tasaRespGd + 0.3 * tasaVobo + 0.2 * puntajeTrd)

    const polCodGd = 'POL07'
    const pdPol07  = evalPorPolitica.get(polCodGd) ?? null
    const { estado: estadoGd, brecha: brechaGd } = clasificarEstado(pdPol07, puntajePol07)

    indicadores.push({
      codigo:           'POL07-GD-GENERAL',
      nombre:           'Gestión Documental (radicados, VoBo, TRD)',
      politica:         polCodGd,
      estado:           estadoGd,
      puntajeDeclarado: pdPol07,
      puntajeSugerido:  puntajePol07,
      brecha:           brechaGd,
      evidencia: {
        totalRadicadosGd: totalGd,
        respondidosGd,
        tasaRespGd: `${tasaRespGd}%`,
        voboAprobados,
        voboTotal,
        tasaVobo: `${tasaVobo}%`,
        trdActivas,
      },
      recomendacion: puntajePol07 >= 80
        ? 'Gestión documental en niveles óptimos.'
        : trdActivas === 0
        ? 'CRÍTICO: No hay TRD activas. Registrar tablas en el sistema.'
        : 'Mejorar tasa de respuesta en radicados GD.',
      calculadoEn,
    })
  } catch (e) {
    console.error('[furag-validator] Error en POL07:', e instanceof Error ? e.message : e)
  }

  // ─── POL03: Transparencia y acceso a la información ───────────────────────

  try {
    const [totalDocs, totalNoticias, totalTransparencia] = await Promise.all([
      prisma.documento?.count({ where: { createdAt: { gte: desde, lte: hasta } } }).catch(() => 0) ?? 0,
      prisma.noticia?.count({ where: { createdAt: { gte: desde, lte: hasta } } }).catch(() => 0) ?? 0,
      prisma.seccionPagina?.count({ where: { updatedAt: { gte: desde, lte: hasta } } }).catch(() => 0) ?? 0,
    ])

    // Puntaje heurístico: presencia de documentos + noticias + actualizaciones
    // Mínimo esperado: 10 documentos, 4 noticias trimestrales (16/año)
    const puntajeDocsN = Math.min(100, Math.round((totalDocs / 10) * 60))
    const puntajeNotN  = Math.min(40, Math.round((totalNoticias / 16) * 40))
    const puntajePol03 = puntajeDocsN + puntajeNotN

    const polCodT = 'POL03'
    const pdPol03 = evalPorPolitica.get(polCodT) ?? null
    const { estado: estadoT, brecha: brechaT } = clasificarEstado(pdPol03, puntajePol03)

    indicadores.push({
      codigo:           'POL03-TRANSPARENCIA',
      nombre:           'Transparencia y Acceso a la Información Pública',
      politica:         polCodT,
      estado:           estadoT,
      puntajeDeclarado: pdPol03,
      puntajeSugerido:  puntajePol03,
      brecha:           brechaT,
      evidencia: {
        documentosPublicados: totalDocs,
        noticiasComunicados:  totalNoticias,
        seccionesActualizadas: totalTransparencia,
      },
      recomendacion: puntajePol03 >= 80
        ? 'Buena publicación de información pública.'
        : totalDocs < 10
        ? 'Publicar más documentos de transparencia activa.'
        : 'Aumentar frecuencia de comunicados y noticias.',
      calculadoEn,
    })
  } catch (e) {
    console.error('[furag-validator] Error en POL03:', e instanceof Error ? e.message : e)
  }

  // ─── Resumen ─────────────────────────────────────────────────────────────────

  const consistentes    = indicadores.filter(i => i.estado === 'CONSISTENTE').length
  const alertas         = indicadores.filter(i => i.estado === 'ALERTA').length
  const inconsistentes  = indicadores.filter(i => i.estado === 'INCONSISTENTE').length
  const sinEvaluacion   = indicadores.filter(i => i.puntajeDeclarado === null).length

  const puntajesSugeridos = indicadores
    .filter(i => i.puntajeSugerido !== null)
    .map(i => i.puntajeSugerido)

  const idiFuragSugerido = puntajesSugeridos.length > 0
    ? Math.round(puntajesSugeridos.reduce((s, p) => s + p, 0) / puntajesSugeridos.length)
    : 0

  return {
    anioVigencia,
    indicadores,
    resumen: {
      totalIndicadores: indicadores.length,
      consistentes,
      alertas,
      inconsistentes,
      sinEvaluacion,
      idiFuragSugerido,
    },
  }
}
