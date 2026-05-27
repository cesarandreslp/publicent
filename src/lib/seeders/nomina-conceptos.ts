/**
 * nomina-conceptos.ts — Catálogo base de conceptos de nómina pública
 * colombiana. Cubre los devengados, deducciones del empleado y aportes
 * patronales más comunes para entidades del orden territorial.
 *
 * Cada concepto enlaza opcionalmente a:
 *   - Una cuenta del CGC (`cuentaContableCodigo`) para generar el comprobante
 *     contable al liquidar.
 *   - Un rubro CCPET (`rubroCcpetCodigo`) para afectar la ejecución
 *     presupuestal correspondiente.
 *
 * Códigos basados en la práctica común de entidades territoriales:
 *   NC-001..NC-099  → Devengados
 *   NC-100..NC-199  → Deducciones del empleado
 *   NC-200..NC-299  → Aportes patronales
 *   NC-300..NC-399  → Prestaciones sociales (provisiones)
 */

export type ConceptoNomina = {
  codigo: string
  nombre: string
  tipo: "DEVENGADO" | "DEDUCCION_EMPLEADO" | "APORTE_PATRONAL" | "PRESTACION_SOCIAL"
  formula: "FIJO" | "PORCENTAJE_SUELDO" | "PORCENTAJE_DEVENGADO" | "PORCENTAJE_IBC" | "CALCULO_ESPECIAL"
  porcentaje?: number
  valorFijo?: number
  aplicaA?: Array<"PLANTA" | "TRABAJADOR_OFICIAL" | "CONTRATISTA" | "SUPERNUMERARIO" | "APRENDIZ">
  baseRetencion?: boolean
  baseAportes?: boolean
  constitutivoSalario?: boolean
  cuentaContableCodigo?: string
  rubroCcpetCodigo?: string
  orden: number
}

export const NOMINA_CONCEPTOS: ConceptoNomina[] = [
  // ── DEVENGADOS ─────────────────────────────────────────────────────────────
  {
    codigo: "NC-001", nombre: "Sueldo básico mensual",
    tipo: "DEVENGADO", formula: "PORCENTAJE_SUELDO", porcentaje: 1.0,
    baseAportes: true, baseRetencion: true, constitutivoSalario: true,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"],
    cuentaContableCodigo: "510101", rubroCcpetCodigo: "2.1.1.01.01.01.01",
    orden: 10,
  },
  {
    codigo: "NC-002", nombre: "Horas extras y festivos",
    tipo: "DEVENGADO", formula: "FIJO",
    baseAportes: true, baseRetencion: true, constitutivoSalario: true,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"],
    cuentaContableCodigo: "510102", rubroCcpetCodigo: "2.1.1.01.01.01.06",
    orden: 20,
  },
  {
    codigo: "NC-003", nombre: "Auxilio de transporte",
    tipo: "DEVENGADO", formula: "FIJO", valorFijo: 200000,
    baseAportes: false, baseRetencion: false, constitutivoSalario: false,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"],
    cuentaContableCodigo: "510123", rubroCcpetCodigo: "2.1.1.01.01.01.07",
    orden: 30,
  },
  {
    codigo: "NC-004", nombre: "Bonificación por servicios prestados",
    tipo: "DEVENGADO", formula: "PORCENTAJE_SUELDO", porcentaje: 0.50,
    baseAportes: true, baseRetencion: true, constitutivoSalario: true,
    aplicaA: ["PLANTA"],
    cuentaContableCodigo: "510113", rubroCcpetCodigo: "2.1.1.01.01.01.05",
    orden: 40,
  },
  {
    codigo: "NC-005", nombre: "Prima de servicios",
    tipo: "DEVENGADO", formula: "CALCULO_ESPECIAL",
    baseAportes: true, baseRetencion: true, constitutivoSalario: true,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL"],
    cuentaContableCodigo: "510105", rubroCcpetCodigo: "2.1.1.01.01.01.02",
    orden: 50,
  },
  {
    codigo: "NC-006", nombre: "Prima de navidad",
    tipo: "DEVENGADO", formula: "CALCULO_ESPECIAL",
    baseAportes: true, baseRetencion: true, constitutivoSalario: true,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL"],
    cuentaContableCodigo: "510106", rubroCcpetCodigo: "2.1.1.01.01.01.04",
    orden: 60,
  },
  {
    codigo: "NC-007", nombre: "Prima de vacaciones",
    tipo: "DEVENGADO", formula: "CALCULO_ESPECIAL",
    baseAportes: true, baseRetencion: true, constitutivoSalario: true,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL"],
    cuentaContableCodigo: "510106", rubroCcpetCodigo: "2.1.1.01.01.01.03",
    orden: 70,
  },
  {
    codigo: "NC-008", nombre: "Vacaciones",
    tipo: "DEVENGADO", formula: "CALCULO_ESPECIAL",
    baseAportes: true, baseRetencion: true, constitutivoSalario: false,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL"],
    cuentaContableCodigo: "510124",
    orden: 80,
  },
  {
    codigo: "NC-009", nombre: "Honorarios (contratistas)",
    tipo: "DEVENGADO", formula: "FIJO",
    baseAportes: false, baseRetencion: true, constitutivoSalario: false,
    aplicaA: ["CONTRATISTA"],
    cuentaContableCodigo: "511121", rubroCcpetCodigo: "2.1.2.02.02.01",
    orden: 90,
  },

  // ── DEDUCCIONES DEL EMPLEADO ───────────────────────────────────────────────
  {
    codigo: "NC-101", nombre: "Aporte salud — empleado (4%)",
    tipo: "DEDUCCION_EMPLEADO", formula: "PORCENTAJE_IBC", porcentaje: 0.04,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"],
    cuentaContableCodigo: "242510",
    orden: 110,
  },
  {
    codigo: "NC-102", nombre: "Aporte pensión — empleado (4%)",
    tipo: "DEDUCCION_EMPLEADO", formula: "PORCENTAJE_IBC", porcentaje: 0.04,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"],
    cuentaContableCodigo: "242505",
    orden: 120,
  },
  {
    codigo: "NC-103", nombre: "Fondo de Solidaridad Pensional (>4 SMMLV)",
    tipo: "DEDUCCION_EMPLEADO", formula: "PORCENTAJE_IBC", porcentaje: 0.01,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL"],
    cuentaContableCodigo: "242505",
    orden: 130,
  },
  {
    codigo: "NC-110", nombre: "Retención en la fuente — salarios",
    tipo: "DEDUCCION_EMPLEADO", formula: "CALCULO_ESPECIAL",
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "CONTRATISTA"],
    cuentaContableCodigo: "243627",
    orden: 140,
  },
  {
    codigo: "NC-111", nombre: "Retefuente honorarios (10/11%)",
    tipo: "DEDUCCION_EMPLEADO", formula: "PORCENTAJE_DEVENGADO", porcentaje: 0.10,
    aplicaA: ["CONTRATISTA"],
    cuentaContableCodigo: "243603",
    orden: 145,
  },
  {
    codigo: "NC-120", nombre: "Embargo judicial",
    tipo: "DEDUCCION_EMPLEADO", formula: "FIJO",
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "CONTRATISTA"],
    cuentaContableCodigo: "242490",
    orden: 150,
  },
  {
    codigo: "NC-121", nombre: "Crédito de libranza",
    tipo: "DEDUCCION_EMPLEADO", formula: "FIJO",
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL"],
    cuentaContableCodigo: "242490",
    orden: 160,
  },
  {
    codigo: "NC-122", nombre: "Cuota voluntaria fondo de empleados",
    tipo: "DEDUCCION_EMPLEADO", formula: "FIJO",
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL"],
    cuentaContableCodigo: "242490",
    orden: 170,
  },

  // ── APORTES PATRONALES (carga prestacional del empleador) ──────────────────
  {
    codigo: "NC-201", nombre: "Aporte salud — empleador (8.5%)",
    tipo: "APORTE_PATRONAL", formula: "PORCENTAJE_IBC", porcentaje: 0.085,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"],
    cuentaContableCodigo: "510303", rubroCcpetCodigo: "2.1.1.02.02",
    orden: 210,
  },
  {
    codigo: "NC-202", nombre: "Aporte pensión — empleador (12%)",
    tipo: "APORTE_PATRONAL", formula: "PORCENTAJE_IBC", porcentaje: 0.12,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"],
    cuentaContableCodigo: "510307", rubroCcpetCodigo: "2.1.1.02.01",
    orden: 220,
  },
  {
    codigo: "NC-203", nombre: "Aporte ARL (0.522% — riesgo I)",
    tipo: "APORTE_PATRONAL", formula: "PORCENTAJE_IBC", porcentaje: 0.00522,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"],
    cuentaContableCodigo: "510306", rubroCcpetCodigo: "2.1.1.02.03",
    orden: 230,
  },
  {
    codigo: "NC-204", nombre: "Aporte caja de compensación familiar (4%)",
    tipo: "APORTE_PATRONAL", formula: "PORCENTAJE_DEVENGADO", porcentaje: 0.04,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"],
    cuentaContableCodigo: "510302", rubroCcpetCodigo: "2.1.1.02.04",
    orden: 240,
  },
  {
    codigo: "NC-205", nombre: "Aporte ICBF (3%)",
    tipo: "APORTE_PATRONAL", formula: "PORCENTAJE_DEVENGADO", porcentaje: 0.03,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"],
    cuentaContableCodigo: "510401", rubroCcpetCodigo: "2.1.1.02.05",
    orden: 250,
  },
  {
    codigo: "NC-206", nombre: "Aporte SENA (2%)",
    tipo: "APORTE_PATRONAL", formula: "PORCENTAJE_DEVENGADO", porcentaje: 0.02,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL", "SUPERNUMERARIO"],
    cuentaContableCodigo: "510402", rubroCcpetCodigo: "2.1.1.02.06",
    orden: 260,
  },
  {
    codigo: "NC-207", nombre: "Aporte ESAP (0.5%)",
    tipo: "APORTE_PATRONAL", formula: "PORCENTAJE_DEVENGADO", porcentaje: 0.005,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL"],
    cuentaContableCodigo: "510403", rubroCcpetCodigo: "2.1.1.02.07",
    orden: 270,
  },
  {
    codigo: "NC-208", nombre: "Aporte escuelas industriales e institutos técnicos (0.5%)",
    tipo: "APORTE_PATRONAL", formula: "PORCENTAJE_DEVENGADO", porcentaje: 0.005,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL"],
    cuentaContableCodigo: "510404", rubroCcpetCodigo: "2.1.1.02.07",
    orden: 280,
  },

  // ── PRESTACIONES SOCIALES (provisiones mensuales) ──────────────────────────
  {
    codigo: "NC-301", nombre: "Provisión cesantías (8.33%)",
    tipo: "PRESTACION_SOCIAL", formula: "PORCENTAJE_DEVENGADO", porcentaje: 0.0833,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL"],
    cuentaContableCodigo: "510119", rubroCcpetCodigo: "2.1.1.03.01",
    orden: 310,
  },
  {
    codigo: "NC-302", nombre: "Provisión intereses sobre cesantías (1%)",
    tipo: "PRESTACION_SOCIAL", formula: "PORCENTAJE_DEVENGADO", porcentaje: 0.01,
    aplicaA: ["PLANTA", "TRABAJADOR_OFICIAL"],
    cuentaContableCodigo: "510119", rubroCcpetCodigo: "2.1.1.03.01",
    orden: 320,
  },
]

/**
 * Siembra el catálogo en la BD del tenant. Idempotente: upsert por código.
 */
export async function seedNominaConceptos(prisma: any): Promise<{ total: number }> {
  let n = 0
  for (const c of NOMINA_CONCEPTOS) {
    await prisma.nomConcepto.upsert({
      where: { codigo: c.codigo },
      create: {
        codigo: c.codigo,
        nombre: c.nombre,
        tipo: c.tipo,
        formula: c.formula,
        porcentaje: c.porcentaje ?? null,
        valorFijo: c.valorFijo ?? null,
        aplicaA: (c.aplicaA ?? []) as any,
        baseRetencion: c.baseRetencion ?? false,
        baseAportes: c.baseAportes ?? false,
        constitutivoSalario: c.constitutivoSalario ?? true,
        cuentaContableCodigo: c.cuentaContableCodigo ?? null,
        rubroCcpetCodigo: c.rubroCcpetCodigo ?? null,
        orden: c.orden,
      },
      update: {
        nombre: c.nombre,
        tipo: c.tipo,
        formula: c.formula,
        porcentaje: c.porcentaje ?? null,
        valorFijo: c.valorFijo ?? null,
        aplicaA: (c.aplicaA ?? []) as any,
        baseRetencion: c.baseRetencion ?? false,
        baseAportes: c.baseAportes ?? false,
        constitutivoSalario: c.constitutivoSalario ?? true,
        cuentaContableCodigo: c.cuentaContableCodigo ?? null,
        rubroCcpetCodigo: c.rubroCcpetCodigo ?? null,
        orden: c.orden,
      },
    })
    n++
  }
  return { total: n }
}
