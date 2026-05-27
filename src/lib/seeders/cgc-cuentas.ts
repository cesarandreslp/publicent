/**
 * cgc-cuentas.ts — Catálogo General de Cuentas (CGC) del sector público
 * colombiano, según el Régimen de Contabilidad Pública (RCP) — Resolución 533
 * de 2015 de la Contaduría General de la Nación y modificatorias.
 *
 * Este catálogo es DISTINTO al PUC privado (Decreto 2650/93). Las clases
 * 6 (costos de venta) y la estructura de transferencias/ingresos son
 * específicas del sector público.
 *
 * Subset operativo del MVP: ~210 cuentas cubriendo todas las clases
 * (1..9) y los grupos más usados por entidades del orden territorial y
 * organismos del Estado pequeños/medianos. Las subcuentas y auxiliares
 * pueden ampliarse en este mismo archivo sin romper la idempotencia
 * (upsert por código).
 *
 * Niveles (CGN): 1=Clase, 2=Grupo, 3=Cuenta, 4=Subcuenta, 5=Auxiliar.
 * `permiteMovimientos=true` SOLO en cuentas hoja (sin hijos).
 */

export type CuentaCgc = {
  codigo: string
  nombre: string
  nivel: 1 | 2 | 3 | 4 | 5
  naturaleza: "DEBITO" | "CREDITO"
  tipo: "BALANCE" | "RESULTADO" | "ORDEN"
  permiteMovimientos: boolean
  parent?: string
}

export const CGC_CUENTAS: CuentaCgc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // CLASE 1 — ACTIVOS
  // ═══════════════════════════════════════════════════════════════════════════
  { codigo: "1", nombre: "ACTIVOS", nivel: 1, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: false },

  // 1.1 Efectivo y equivalentes al efectivo
  { codigo: "11", nombre: "Efectivo y equivalentes al efectivo", nivel: 2, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: false, parent: "1" },
  { codigo: "1105", nombre: "Caja", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: false, parent: "11" },
  { codigo: "110501", nombre: "Caja principal", nivel: 4, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "1105" },
  { codigo: "110502", nombre: "Caja menor", nivel: 4, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "1105" },
  { codigo: "110503", nombre: "Caja recaudadora", nivel: 4, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "1105" },
  { codigo: "1110", nombre: "Depósitos en instituciones financieras", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: false, parent: "11" },
  { codigo: "111005", nombre: "Cuenta corriente", nivel: 4, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "1110" },
  { codigo: "111006", nombre: "Cuenta de ahorro", nivel: 4, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "1110" },
  { codigo: "111007", nombre: "Depósitos en fideicomiso", nivel: 4, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "1110" },
  { codigo: "1120", nombre: "Fondos en tránsito", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "11" },
  { codigo: "1132", nombre: "Efectivo de uso restringido", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "11" },
  { codigo: "1133", nombre: "Equivalentes al efectivo", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "11" },

  // 1.2 Inversiones e instrumentos derivados
  { codigo: "12", nombre: "Inversiones e instrumentos derivados", nivel: 2, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: false, parent: "1" },
  { codigo: "1224", nombre: "Inversiones de administración de liquidez al costo amortizado", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "12" },
  { codigo: "1225", nombre: "Inversiones de administración de liquidez a valor razonable con cambios en el resultado", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "12" },
  { codigo: "1231", nombre: "Inversiones de administración de liquidez a valor razonable con cambios en el patrimonio", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "12" },

  // 1.3 Cuentas por cobrar
  { codigo: "13", nombre: "Cuentas por cobrar", nivel: 2, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: false, parent: "1" },
  { codigo: "1305", nombre: "Impuestos, retención en la fuente y anticipos de impuestos", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: false, parent: "13" },
  { codigo: "130507", nombre: "Impuesto predial unificado", nivel: 4, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "1305" },
  { codigo: "130508", nombre: "Impuesto de industria y comercio", nivel: 4, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "1305" },
  { codigo: "130509", nombre: "Sobretasa a la gasolina", nivel: 4, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "1305" },
  { codigo: "130590", nombre: "Otros impuestos", nivel: 4, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "1305" },
  { codigo: "1311", nombre: "Contribuciones, tasas e ingresos no tributarios", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "13" },
  { codigo: "1317", nombre: "Prestación de servicios", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "13" },
  { codigo: "1337", nombre: "Transferencias por cobrar", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "13" },
  { codigo: "1384", nombre: "Otras cuentas por cobrar", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "13" },
  { codigo: "1385", nombre: "Cuentas por cobrar de difícil recaudo", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "13" },
  { codigo: "1386", nombre: "Deterioro acumulado de cuentas por cobrar (cr)", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "13" },

  // 1.5 Inventarios
  { codigo: "15", nombre: "Inventarios", nivel: 2, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: false, parent: "1" },
  { codigo: "1510", nombre: "Mercancías en existencia", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "15" },
  { codigo: "1514", nombre: "Materiales y suministros", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "15" },
  { codigo: "1518", nombre: "Productos terminados", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "15" },

  // 1.6 Propiedades, planta y equipo
  { codigo: "16", nombre: "Propiedades, planta y equipo", nivel: 2, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: false, parent: "1" },
  { codigo: "1605", nombre: "Terrenos", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1615", nombre: "Construcciones en curso", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1635", nombre: "Bienes muebles en bodega", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1637", nombre: "Propiedades, planta y equipo no explotados", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1640", nombre: "Edificaciones", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1645", nombre: "Plantas, ductos y túneles", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1650", nombre: "Redes, líneas y cables", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1655", nombre: "Maquinaria y equipo", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1660", nombre: "Equipo médico y científico", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1665", nombre: "Muebles, enseres y equipo de oficina", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1670", nombre: "Equipos de comunicación y computación", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1675", nombre: "Equipos de transporte, tracción y elevación", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1680", nombre: "Equipos de comedor, cocina, despensa y hotelería", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1685", nombre: "Depreciación acumulada (cr)", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },
  { codigo: "1695", nombre: "Deterioro acumulado de propiedades, planta y equipo (cr)", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "16" },

  // 1.7 Bienes de uso público e históricos y culturales
  { codigo: "17", nombre: "Bienes de uso público e históricos y culturales", nivel: 2, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: false, parent: "1" },
  { codigo: "1705", nombre: "Bienes de uso público en construcción", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "17" },
  { codigo: "1710", nombre: "Bienes de uso público en servicio", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "17" },
  { codigo: "1715", nombre: "Bienes históricos y culturales", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "17" },
  { codigo: "1785", nombre: "Depreciación acumulada de bienes de uso público (cr)", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "17" },

  // 1.9 Otros activos
  { codigo: "19", nombre: "Otros activos", nivel: 2, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: false, parent: "1" },
  { codigo: "1902", nombre: "Plan de activos para beneficios a los empleados a largo plazo", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "19" },
  { codigo: "1905", nombre: "Bienes y servicios pagados por anticipado", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "19" },
  { codigo: "1906", nombre: "Avances y anticipos entregados", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "19" },
  { codigo: "1908", nombre: "Recursos entregados en administración", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "19" },
  { codigo: "1909", nombre: "Depósitos entregados en garantía", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "19" },
  { codigo: "1926", nombre: "Derechos en fideicomiso", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "19" },
  { codigo: "1960", nombre: "Bienes de arte y cultura", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "19" },
  { codigo: "1970", nombre: "Activos intangibles", nivel: 3, naturaleza: "DEBITO", tipo: "BALANCE", permiteMovimientos: true, parent: "19" },
  { codigo: "1975", nombre: "Amortización acumulada de activos intangibles (cr)", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "19" },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASE 2 — PASIVOS
  // ═══════════════════════════════════════════════════════════════════════════
  { codigo: "2", nombre: "PASIVOS", nivel: 1, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: false },

  { codigo: "22", nombre: "Préstamos por pagar", nivel: 2, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: false, parent: "2" },
  { codigo: "2207", nombre: "Financiamiento interno de largo plazo", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "22" },
  { codigo: "2208", nombre: "Financiamiento externo de largo plazo", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "22" },
  { codigo: "2212", nombre: "Financiamiento interno de corto plazo", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "22" },

  { codigo: "24", nombre: "Cuentas por pagar", nivel: 2, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: false, parent: "2" },
  { codigo: "2401", nombre: "Adquisición de bienes y servicios nacionales", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "24" },
  { codigo: "2407", nombre: "Recursos a favor de terceros", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "24" },
  { codigo: "2424", nombre: "Descuentos de nómina", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "24" },
  { codigo: "2436", nombre: "Retención en la fuente e impuesto de timbre", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: false, parent: "24" },
  { codigo: "243603", nombre: "Honorarios", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2436" },
  { codigo: "243605", nombre: "Servicios", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2436" },
  { codigo: "243625", nombre: "Compras", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2436" },
  { codigo: "243627", nombre: "Salarios y pagos laborales", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2436" },
  { codigo: "2440", nombre: "Impuestos, contribuciones y tasas por pagar", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "24" },
  { codigo: "2445", nombre: "Impuesto al valor agregado - IVA", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "24" },
  { codigo: "2453", nombre: "Recursos recibidos en administración", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "24" },
  { codigo: "2460", nombre: "Créditos judiciales", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "24" },
  { codigo: "2490", nombre: "Otras cuentas por pagar", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "24" },

  { codigo: "25", nombre: "Beneficios a los empleados", nivel: 2, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: false, parent: "2" },
  { codigo: "2505", nombre: "Beneficios a empleados de corto plazo", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: false, parent: "25" },
  { codigo: "250501", nombre: "Sueldos por pagar", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2505" },
  { codigo: "250503", nombre: "Cesantías", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2505" },
  { codigo: "250504", nombre: "Intereses sobre cesantías", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2505" },
  { codigo: "250505", nombre: "Vacaciones", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2505" },
  { codigo: "250506", nombre: "Prima de vacaciones", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2505" },
  { codigo: "250507", nombre: "Prima de servicios", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2505" },
  { codigo: "250508", nombre: "Prima de navidad", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2505" },
  { codigo: "250590", nombre: "Otros beneficios a empleados de corto plazo", nivel: 4, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "2505" },
  { codigo: "2510", nombre: "Beneficios a empleados de largo plazo", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "25" },
  { codigo: "2511", nombre: "Beneficios por terminación del vínculo laboral", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "25" },
  { codigo: "2512", nombre: "Beneficios posempleo - pensiones", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "25" },

  { codigo: "27", nombre: "Provisiones", nivel: 2, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: false, parent: "2" },
  { codigo: "2701", nombre: "Litigios y demandas", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "27" },
  { codigo: "2702", nombre: "Garantías", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "27" },
  { codigo: "2715", nombre: "Provisiones diversas", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "27" },

  { codigo: "29", nombre: "Otros pasivos", nivel: 2, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: false, parent: "2" },
  { codigo: "2902", nombre: "Recaudos a favor de terceros", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "29" },
  { codigo: "2910", nombre: "Ingresos recibidos por anticipado", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "29" },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASE 3 — PATRIMONIO
  // ═══════════════════════════════════════════════════════════════════════════
  { codigo: "3", nombre: "PATRIMONIO", nivel: 1, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: false },

  { codigo: "31", nombre: "Patrimonio de las entidades de gobierno", nivel: 2, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: false, parent: "3" },
  { codigo: "3105", nombre: "Capital fiscal", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "31" },
  { codigo: "3109", nombre: "Resultados de ejercicios anteriores", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "31" },
  { codigo: "3110", nombre: "Resultado del ejercicio", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "31" },
  { codigo: "3115", nombre: "Superávit por revaluación", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "31" },
  { codigo: "3120", nombre: "Ganancias o pérdidas por planes de beneficios a empleados", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "31" },
  { codigo: "3125", nombre: "Patrimonio público incorporado", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "31" },
  { codigo: "3145", nombre: "Impactos por la transición al nuevo marco de regulación", nivel: 3, naturaleza: "CREDITO", tipo: "BALANCE", permiteMovimientos: true, parent: "31" },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASE 4 — INGRESOS
  // ═══════════════════════════════════════════════════════════════════════════
  { codigo: "4", nombre: "INGRESOS", nivel: 1, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: false },

  { codigo: "41", nombre: "Ingresos fiscales", nivel: 2, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "4" },
  { codigo: "4105", nombre: "Impuestos", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "41" },
  { codigo: "410507", nombre: "Impuesto predial unificado", nivel: 4, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "4105" },
  { codigo: "410508", nombre: "Impuesto de industria y comercio", nivel: 4, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "4105" },
  { codigo: "410523", nombre: "Sobretasa ambiental", nivel: 4, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "4105" },
  { codigo: "410590", nombre: "Otros impuestos", nivel: 4, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "4105" },
  { codigo: "4110", nombre: "Contribuciones, tasas e ingresos no tributarios", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "41" },
  { codigo: "4115", nombre: "Multas, intereses, sanciones y otros", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "41" },
  { codigo: "4195", nombre: "Devoluciones y descuentos (db)", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "41" },

  { codigo: "43", nombre: "Venta de bienes", nivel: 2, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "4" },
  { codigo: "4308", nombre: "Productos de actividades agropecuarias y pesqueras", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "43" },
  { codigo: "4395", nombre: "Devoluciones, rebajas y descuentos en venta de bienes (db)", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "43" },

  { codigo: "44", nombre: "Transferencias y subvenciones", nivel: 2, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "4" },
  { codigo: "4402", nombre: "Sistema general de participaciones", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "44" },
  { codigo: "440201", nombre: "SGP - Educación", nivel: 4, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "4402" },
  { codigo: "440202", nombre: "SGP - Salud", nivel: 4, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "4402" },
  { codigo: "440203", nombre: "SGP - Agua potable y saneamiento básico", nivel: 4, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "4402" },
  { codigo: "440204", nombre: "SGP - Propósito general", nivel: 4, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "4402" },
  { codigo: "4407", nombre: "Sistema general de regalías", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "44" },
  { codigo: "4413", nombre: "Sistema general de seguridad social en salud", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "44" },
  { codigo: "4428", nombre: "Otras transferencias", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "44" },

  { codigo: "47", nombre: "Operaciones interinstitucionales", nivel: 2, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "4" },
  { codigo: "4705", nombre: "Fondos recibidos", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "47" },
  { codigo: "4720", nombre: "Operaciones de enlace", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "47" },
  { codigo: "4722", nombre: "Operaciones sin flujo de efectivo", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "47" },

  { codigo: "48", nombre: "Otros ingresos", nivel: 2, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "4" },
  { codigo: "4802", nombre: "Financieros", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "48" },
  { codigo: "4805", nombre: "Financieros - intereses sobre depósitos", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "48" },
  { codigo: "4808", nombre: "Ingresos diversos", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "48" },
  { codigo: "4815", nombre: "Ajuste por diferencia en cambio", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "48" },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASE 5 — GASTOS
  // ═══════════════════════════════════════════════════════════════════════════
  { codigo: "5", nombre: "GASTOS", nivel: 1, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false },

  { codigo: "51", nombre: "De administración y operación", nivel: 2, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "5" },
  { codigo: "5101", nombre: "Sueldos y salarios", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "51" },
  { codigo: "510101", nombre: "Sueldos", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5101" },
  { codigo: "510102", nombre: "Horas extras y festivos", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5101" },
  { codigo: "510103", nombre: "Indemnizaciones", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5101" },
  { codigo: "510105", nombre: "Prima de servicios", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5101" },
  { codigo: "510106", nombre: "Prima de vacaciones", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5101" },
  { codigo: "510112", nombre: "Honorarios", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5101" },
  { codigo: "510113", nombre: "Bonificaciones", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5101" },
  { codigo: "510119", nombre: "Cesantías", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5101" },
  { codigo: "510123", nombre: "Auxilio de transporte", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5101" },
  { codigo: "510124", nombre: "Vacaciones", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5101" },
  { codigo: "5103", nombre: "Contribuciones efectivas", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "51" },
  { codigo: "510302", nombre: "Aportes a cajas de compensación familiar", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5103" },
  { codigo: "510303", nombre: "Cotizaciones a seguridad social en salud", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5103" },
  { codigo: "510306", nombre: "Cotizaciones a riesgos laborales", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5103" },
  { codigo: "510307", nombre: "Cotizaciones a entidades administradoras del régimen de prima media", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5103" },
  { codigo: "510308", nombre: "Cotizaciones a entidades administradoras del régimen de ahorro individual", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5103" },
  { codigo: "5104", nombre: "Aportes sobre la nómina", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "51" },
  { codigo: "510401", nombre: "Aporte al ICBF", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5104" },
  { codigo: "510402", nombre: "Aporte al SENA", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5104" },
  { codigo: "510403", nombre: "Aporte ESAP", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5104" },
  { codigo: "510404", nombre: "Aporte escuelas industriales e institutos técnicos", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5104" },
  { codigo: "5111", nombre: "Generales", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "51" },
  { codigo: "511113", nombre: "Servicios públicos", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511114", nombre: "Materiales y suministros", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511115", nombre: "Mantenimiento", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511117", nombre: "Servicios de aseo, cafetería, restaurante y lavandería", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511118", nombre: "Publicidad y propaganda", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511119", nombre: "Impresos, publicaciones, suscripciones y afiliaciones", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511120", nombre: "Fotocopias", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511121", nombre: "Honorarios", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511122", nombre: "Servicios", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511123", nombre: "Comunicaciones y transporte", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511125", nombre: "Seguros generales", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511127", nombre: "Combustibles y lubricantes", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511130", nombre: "Viáticos y gastos de viaje", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511138", nombre: "Comisiones, honorarios y servicios", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511146", nombre: "Combustibles, lubricantes y llantas", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511179", nombre: "Software", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "511190", nombre: "Otros gastos generales", nivel: 4, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "5111" },
  { codigo: "5120", nombre: "Impuestos, contribuciones y tasas", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "51" },

  { codigo: "53", nombre: "Deterioro, depreciaciones, amortizaciones y provisiones", nivel: 2, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "5" },
  { codigo: "5302", nombre: "Deterioro de inversiones e instrumentos derivados", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "53" },
  { codigo: "5314", nombre: "Deterioro de cuentas por cobrar", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "53" },
  { codigo: "5330", nombre: "Depreciación de propiedades, planta y equipo", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "53" },
  { codigo: "5331", nombre: "Depreciación de bienes de uso público", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "53" },
  { codigo: "5345", nombre: "Amortización de activos intangibles", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "53" },
  { codigo: "5360", nombre: "Provisión litigios y demandas", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "53" },

  { codigo: "54", nombre: "Transferencias y subvenciones", nivel: 2, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "5" },
  { codigo: "5402", nombre: "Sistema general de participaciones", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "54" },
  { codigo: "5408", nombre: "Subvenciones", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "54" },
  { codigo: "5423", nombre: "Otras transferencias", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "54" },

  { codigo: "55", nombre: "Gasto público social", nivel: 2, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "5" },
  { codigo: "5501", nombre: "Educación", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "55" },
  { codigo: "5502", nombre: "Salud", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "55" },
  { codigo: "5503", nombre: "Agua potable y saneamiento básico", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "55" },
  { codigo: "5504", nombre: "Vivienda", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "55" },
  { codigo: "5505", nombre: "Recreación y deporte", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "55" },
  { codigo: "5506", nombre: "Cultura", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "55" },
  { codigo: "5507", nombre: "Medio ambiente", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "55" },
  { codigo: "5508", nombre: "Desarrollo comunitario y bienestar social", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "55" },
  { codigo: "5509", nombre: "Asistencia social", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "55" },

  { codigo: "57", nombre: "Operaciones interinstitucionales", nivel: 2, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "5" },
  { codigo: "5705", nombre: "Fondos entregados", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "57" },
  { codigo: "5720", nombre: "Operaciones de enlace", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "57" },
  { codigo: "5722", nombre: "Operaciones sin flujo de efectivo", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "57" },

  { codigo: "58", nombre: "Otros gastos", nivel: 2, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "5" },
  { codigo: "5802", nombre: "Comisiones", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "58" },
  { codigo: "5803", nombre: "Ajuste por diferencia en cambio", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "58" },
  { codigo: "5804", nombre: "Financieros - intereses", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "58" },
  { codigo: "5890", nombre: "Gastos diversos", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "58" },

  { codigo: "59", nombre: "Cierre de ingresos, gastos y costos", nivel: 2, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "5" },
  { codigo: "5905", nombre: "Cierre de ingresos", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "59" },
  { codigo: "5910", nombre: "Cierre de gastos", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "59" },
  { codigo: "5915", nombre: "Cierre de costos", nivel: 3, naturaleza: "CREDITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "59" },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASE 7 — COSTOS DE PRODUCCIÓN DE BIENES Y SERVICIOS
  // ═══════════════════════════════════════════════════════════════════════════
  { codigo: "7", nombre: "COSTOS DE PRODUCCIÓN DE BIENES Y SERVICIOS", nivel: 1, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false },
  { codigo: "71", nombre: "Costos de producción de bienes", nivel: 2, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "7" },
  { codigo: "7102", nombre: "Servicios públicos", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "71" },
  { codigo: "75", nombre: "Costo de ventas de servicios", nivel: 2, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: false, parent: "7" },
  { codigo: "7505", nombre: "Servicios educativos", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "75" },
  { codigo: "7510", nombre: "Servicios de salud", nivel: 3, naturaleza: "DEBITO", tipo: "RESULTADO", permiteMovimientos: true, parent: "75" },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASES 8 y 9 — CUENTAS DE ORDEN
  // ═══════════════════════════════════════════════════════════════════════════
  { codigo: "8", nombre: "CUENTAS DE ORDEN DEUDORAS", nivel: 1, naturaleza: "DEBITO", tipo: "ORDEN", permiteMovimientos: false },
  { codigo: "81", nombre: "Activos contingentes", nivel: 2, naturaleza: "DEBITO", tipo: "ORDEN", permiteMovimientos: false, parent: "8" },
  { codigo: "8120", nombre: "Litigios y mecanismos alternativos de solución de conflictos", nivel: 3, naturaleza: "DEBITO", tipo: "ORDEN", permiteMovimientos: true, parent: "81" },
  { codigo: "83", nombre: "Deudoras de control", nivel: 2, naturaleza: "DEBITO", tipo: "ORDEN", permiteMovimientos: false, parent: "8" },
  { codigo: "8347", nombre: "Bienes recibidos en custodia", nivel: 3, naturaleza: "DEBITO", tipo: "ORDEN", permiteMovimientos: true, parent: "83" },
  { codigo: "8361", nombre: "Responsabilidades en proceso", nivel: 3, naturaleza: "DEBITO", tipo: "ORDEN", permiteMovimientos: true, parent: "83" },
  { codigo: "89", nombre: "Deudoras por contra (cr)", nivel: 2, naturaleza: "CREDITO", tipo: "ORDEN", permiteMovimientos: false, parent: "8" },
  { codigo: "8915", nombre: "Activos contingentes por contra (cr)", nivel: 3, naturaleza: "CREDITO", tipo: "ORDEN", permiteMovimientos: true, parent: "89" },
  { codigo: "8920", nombre: "Deudoras de control por contra (cr)", nivel: 3, naturaleza: "CREDITO", tipo: "ORDEN", permiteMovimientos: true, parent: "89" },

  { codigo: "9", nombre: "CUENTAS DE ORDEN ACREEDORAS", nivel: 1, naturaleza: "CREDITO", tipo: "ORDEN", permiteMovimientos: false },
  { codigo: "91", nombre: "Pasivos contingentes", nivel: 2, naturaleza: "CREDITO", tipo: "ORDEN", permiteMovimientos: false, parent: "9" },
  { codigo: "9120", nombre: "Litigios y mecanismos alternativos de solución de conflictos", nivel: 3, naturaleza: "CREDITO", tipo: "ORDEN", permiteMovimientos: true, parent: "91" },
  { codigo: "93", nombre: "Acreedoras de control", nivel: 2, naturaleza: "CREDITO", tipo: "ORDEN", permiteMovimientos: false, parent: "9" },
  { codigo: "9346", nombre: "Bienes entregados en custodia", nivel: 3, naturaleza: "CREDITO", tipo: "ORDEN", permiteMovimientos: true, parent: "93" },
  { codigo: "9390", nombre: "Otras cuentas acreedoras de control", nivel: 3, naturaleza: "CREDITO", tipo: "ORDEN", permiteMovimientos: true, parent: "93" },
  { codigo: "99", nombre: "Acreedoras por contra (db)", nivel: 2, naturaleza: "DEBITO", tipo: "ORDEN", permiteMovimientos: false, parent: "9" },
  { codigo: "9905", nombre: "Pasivos contingentes por contra (db)", nivel: 3, naturaleza: "DEBITO", tipo: "ORDEN", permiteMovimientos: true, parent: "99" },
  { codigo: "9920", nombre: "Acreedoras de control por contra (db)", nivel: 3, naturaleza: "DEBITO", tipo: "ORDEN", permiteMovimientos: true, parent: "99" },
]

/**
 * Siembra el CGC en el cliente Prisma dado (la BD del tenant).
 * Idempotente: upsert por código. Resuelve `parentId` por pasadas hasta
 * cerrar el grafo (mismo algoritmo que el script standalone).
 *
 * @returns { creadas, actualizadas, total }
 */
export async function seedCgc(prisma: any): Promise<{ total: number; pasadas: number }> {
  const idsPorCodigo = new Map<string, string>()
  const pendientes = [...CGC_CUENTAS]
  let pasadas = 0

  while (pendientes.length) {
    pasadas++
    const ahora = pendientes.filter(c => !c.parent || idsPorCodigo.has(c.parent))
    if (!ahora.length) {
      throw new Error(`CGC: cuentas con parent inexistente: ${pendientes.map(p => p.codigo).join(", ")}`)
    }
    for (const c of ahora) {
      const parentId = c.parent ? idsPorCodigo.get(c.parent) ?? null : null
      const data = {
        nombre: c.nombre,
        nivel: c.nivel,
        naturaleza: c.naturaleza,
        tipo: c.tipo,
        permiteMovimientos: c.permiteMovimientos,
        parentId,
      }
      const saved = await prisma.cpPlanCuenta.upsert({
        where: { codigo: c.codigo },
        create: { codigo: c.codigo, ...data },
        update: data,
      })
      idsPorCodigo.set(c.codigo, saved.id)
    }
    for (const c of ahora) {
      const idx = pendientes.indexOf(c)
      if (idx >= 0) pendientes.splice(idx, 1)
    }
  }
  return { total: idsPorCodigo.size, pasadas }
}
