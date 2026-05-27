/**
 * ccp-rubros.ts — Catálogo de Clasificación Presupuestal (CCP) según
 * la Dirección General del Presupuesto Público Nacional (DGPPN) del
 * Ministerio de Hacienda, Resoluciones 4015/2021 (Catálogo Integrado de
 * Clasificación Presupuestal CICP) y normas concordantes para entidades
 * territoriales (Estatuto Orgánico de Presupuesto, Decreto 111/96).
 *
 * Estructura de GASTOS (lo que ejecuta la cadena CDP/RP/Obligación/Pago):
 *   A. FUNCIONAMIENTO
 *      A.1 Gastos de personal
 *      A.2 Adquisición de bienes y servicios
 *      A.3 Transferencias corrientes
 *      A.4 Gastos por tributos, multas, sanciones e intereses de mora
 *      A.5 Adquisición de activos financieros (Funcionamiento)
 *      A.6 Disminución de pasivos
 *      A.7 Gastos por reservas técnicas
 *      A.8 Gastos comerciales
 *   B. SERVICIO DE LA DEUDA PÚBLICA
 *      B.1 Interna
 *      B.2 Externa
 *   C. INVERSIÓN
 *      C.1..Cn — proyectos según Plan de Desarrollo del tenant
 *
 * Estructura de INGRESOS (a futuro, opcional):
 *   1. INGRESOS CORRIENTES (1.1 Tributarios, 1.2 No tributarios)
 *   2. INGRESOS DE CAPITAL
 *   3. CONTRIBUCIONES PARAFISCALES
 *   4. FONDOS ESPECIALES
 *
 * Niveles: 1=Agregado (A/B/C/1/2…), 2=Grupo (A.1), 3=Subgrupo (A.1.1),
 *          4=Concepto (A.1.1.01), 5=Item (A.1.1.01.01).
 * `permiteMovimientos=true` SOLO en hojas (último nivel).
 */

export type RubroCcp = {
  codigo: string
  nombre: string
  tipo: "GASTO" | "INGRESO"
  nivel: 1 | 2 | 3 | 4 | 5
  permiteMovimientos: boolean
  parent?: string
}

export const CCP_RUBROS: RubroCcp[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // A — FUNCIONAMIENTO
  // ═══════════════════════════════════════════════════════════════════════════
  { codigo: "A", nombre: "FUNCIONAMIENTO", tipo: "GASTO", nivel: 1, permiteMovimientos: false },

  // A.1 Gastos de personal
  { codigo: "A.1", nombre: "Gastos de personal", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "A" },
  { codigo: "A.1.1", nombre: "Planta de personal permanente", tipo: "GASTO", nivel: 3, permiteMovimientos: false, parent: "A.1" },
  { codigo: "A.1.1.01", nombre: "Factores constitutivos de salario", tipo: "GASTO", nivel: 4, permiteMovimientos: false, parent: "A.1.1" },
  { codigo: "A.1.1.01.01", nombre: "Factores salariales comunes — Sueldo básico", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.01" },
  { codigo: "A.1.1.01.02", nombre: "Prima de servicios", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.01" },
  { codigo: "A.1.1.01.03", nombre: "Prima de vacaciones", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.01" },
  { codigo: "A.1.1.01.04", nombre: "Prima de navidad", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.01" },
  { codigo: "A.1.1.01.05", nombre: "Bonificación por servicios prestados", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.01" },
  { codigo: "A.1.1.01.06", nombre: "Horas extras, días festivos e indemnización por vacaciones", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.01" },
  { codigo: "A.1.1.01.07", nombre: "Auxilio de transporte", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.01" },
  { codigo: "A.1.1.01.08", nombre: "Subsidio de alimentación", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.01" },
  { codigo: "A.1.1.02", nombre: "Contribuciones inherentes a la nómina", tipo: "GASTO", nivel: 4, permiteMovimientos: false, parent: "A.1.1" },
  { codigo: "A.1.1.02.01", nombre: "Aportes a la seguridad social en pensiones", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.02" },
  { codigo: "A.1.1.02.02", nombre: "Aportes a la seguridad social en salud", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.02" },
  { codigo: "A.1.1.02.03", nombre: "Aportes a riesgos laborales (ARL)", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.02" },
  { codigo: "A.1.1.02.04", nombre: "Aporte a cajas de compensación familiar", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.02" },
  { codigo: "A.1.1.02.05", nombre: "Aporte ICBF", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.02" },
  { codigo: "A.1.1.02.06", nombre: "Aporte SENA", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.02" },
  { codigo: "A.1.1.02.07", nombre: "Aporte ESAP / institutos técnicos", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.02" },
  { codigo: "A.1.1.03", nombre: "Remuneraciones no constitutivas de factor salarial", tipo: "GASTO", nivel: 4, permiteMovimientos: false, parent: "A.1.1" },
  { codigo: "A.1.1.03.01", nombre: "Cesantías e intereses sobre cesantías", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.03" },
  { codigo: "A.1.1.03.02", nombre: "Indemnización por vacaciones", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.1.1.03" },
  { codigo: "A.1.2", nombre: "Servicios personales indirectos", tipo: "GASTO", nivel: 3, permiteMovimientos: false, parent: "A.1" },
  { codigo: "A.1.2.01", nombre: "Honorarios profesionales y servicios técnicos", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.1.2" },
  { codigo: "A.1.2.02", nombre: "Personal supernumerario y contratos por prestación de servicios", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.1.2" },

  // A.2 Adquisición de bienes y servicios
  { codigo: "A.2", nombre: "Adquisición de bienes y servicios", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "A" },
  { codigo: "A.2.1", nombre: "Adquisición de activos no financieros", tipo: "GASTO", nivel: 3, permiteMovimientos: false, parent: "A.2" },
  { codigo: "A.2.1.01", nombre: "Maquinaria y equipo", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.1" },
  { codigo: "A.2.1.02", nombre: "Muebles, enseres y equipo de oficina", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.1" },
  { codigo: "A.2.1.03", nombre: "Equipos de comunicación y computación", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.1" },
  { codigo: "A.2.1.04", nombre: "Equipos de transporte", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.1" },
  { codigo: "A.2.2", nombre: "Adquisiciones diferentes de activos", tipo: "GASTO", nivel: 3, permiteMovimientos: false, parent: "A.2" },
  { codigo: "A.2.2.01", nombre: "Materiales y suministros", tipo: "GASTO", nivel: 4, permiteMovimientos: false, parent: "A.2.2" },
  { codigo: "A.2.2.01.01", nombre: "Papelería, útiles de oficina y fotocopias", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.2.2.01" },
  { codigo: "A.2.2.01.02", nombre: "Combustibles, lubricantes y llantas", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.2.2.01" },
  { codigo: "A.2.2.01.03", nombre: "Productos de aseo y cafetería", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.2.2.01" },
  { codigo: "A.2.2.02", nombre: "Servicios públicos domiciliarios", tipo: "GASTO", nivel: 4, permiteMovimientos: false, parent: "A.2.2" },
  { codigo: "A.2.2.02.01", nombre: "Acueducto, alcantarillado y aseo", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.2.2.02" },
  { codigo: "A.2.2.02.02", nombre: "Energía eléctrica", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.2.2.02" },
  { codigo: "A.2.2.02.03", nombre: "Gas combustible", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.2.2.02" },
  { codigo: "A.2.2.02.04", nombre: "Telefonía, internet y datos", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.2.2.02" },
  { codigo: "A.2.2.03", nombre: "Mantenimiento", tipo: "GASTO", nivel: 4, permiteMovimientos: false, parent: "A.2.2" },
  { codigo: "A.2.2.03.01", nombre: "Mantenimiento de bienes inmuebles", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.2.2.03" },
  { codigo: "A.2.2.03.02", nombre: "Mantenimiento de bienes muebles, equipo y vehículos", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.2.2.03" },
  { codigo: "A.2.2.03.03", nombre: "Mantenimiento de software y licenciamientos", tipo: "GASTO", nivel: 5, permiteMovimientos: true, parent: "A.2.2.03" },
  { codigo: "A.2.2.04", nombre: "Arrendamientos", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.2" },
  { codigo: "A.2.2.05", nombre: "Viáticos y gastos de viaje", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.2" },
  { codigo: "A.2.2.06", nombre: "Impresos, publicaciones, suscripciones y afiliaciones", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.2" },
  { codigo: "A.2.2.07", nombre: "Seguros", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.2" },
  { codigo: "A.2.2.08", nombre: "Servicios de aseo, cafetería y vigilancia", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.2" },
  { codigo: "A.2.2.09", nombre: "Comunicaciones y transporte", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.2" },
  { codigo: "A.2.2.10", nombre: "Capacitación, bienestar social y estímulos", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.2" },
  { codigo: "A.2.2.90", nombre: "Otros gastos de adquisición de servicios", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.2.2" },

  // A.3 Transferencias corrientes
  { codigo: "A.3", nombre: "Transferencias corrientes", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "A" },
  { codigo: "A.3.1", nombre: "Sistema general de participaciones", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "A.3" },
  { codigo: "A.3.2", nombre: "Transferencias para el funcionamiento de órganos de control y vigilancia", tipo: "GASTO", nivel: 3, permiteMovimientos: false, parent: "A.3" },
  { codigo: "A.3.2.01", nombre: "Personería municipal", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.3.2" },
  { codigo: "A.3.2.02", nombre: "Contraloría municipal", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.3.2" },
  { codigo: "A.3.2.03", nombre: "Concejo municipal", tipo: "GASTO", nivel: 4, permiteMovimientos: true, parent: "A.3.2" },
  { codigo: "A.3.3", nombre: "Transferencias a organismos internacionales", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "A.3" },
  { codigo: "A.3.4", nombre: "Sentencias y conciliaciones", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "A.3" },
  { codigo: "A.3.5", nombre: "Mesadas pensionales", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "A.3" },
  { codigo: "A.3.9", nombre: "Otras transferencias corrientes", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "A.3" },

  // A.4 Gastos por tributos, multas, sanciones e intereses de mora
  { codigo: "A.4", nombre: "Gastos por tributos, multas, sanciones e intereses de mora", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "A" },
  { codigo: "A.4.1", nombre: "Impuestos", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "A.4" },
  { codigo: "A.4.2", nombre: "Tasas y derechos administrativos", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "A.4" },
  { codigo: "A.4.3", nombre: "Multas y sanciones", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "A.4" },
  { codigo: "A.4.4", nombre: "Intereses de mora", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "A.4" },

  // A.6 Disminución de pasivos
  { codigo: "A.6", nombre: "Disminución de pasivos", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "A" },
  { codigo: "A.6.1", nombre: "Pago de cesantías definitivas", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "A.6" },
  { codigo: "A.6.2", nombre: "Pago de pasivos pensionales", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "A.6" },

  // ═══════════════════════════════════════════════════════════════════════════
  // B — SERVICIO DE LA DEUDA PÚBLICA
  // ═══════════════════════════════════════════════════════════════════════════
  { codigo: "B", nombre: "SERVICIO DE LA DEUDA PÚBLICA", tipo: "GASTO", nivel: 1, permiteMovimientos: false },
  { codigo: "B.1", nombre: "Servicio de la deuda pública interna", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "B" },
  { codigo: "B.1.1", nombre: "Amortización deuda pública interna", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "B.1" },
  { codigo: "B.1.2", nombre: "Intereses deuda pública interna", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "B.1" },
  { codigo: "B.1.3", nombre: "Comisiones y otros gastos deuda interna", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "B.1" },
  { codigo: "B.2", nombre: "Servicio de la deuda pública externa", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "B" },
  { codigo: "B.2.1", nombre: "Amortización deuda pública externa", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "B.2" },
  { codigo: "B.2.2", nombre: "Intereses deuda pública externa", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "B.2" },
  { codigo: "B.2.3", nombre: "Comisiones y otros gastos deuda externa", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "B.2" },

  // ═══════════════════════════════════════════════════════════════════════════
  // C — INVERSIÓN (sectores DNP / Plan Nacional / Plan de Desarrollo)
  // ═══════════════════════════════════════════════════════════════════════════
  { codigo: "C", nombre: "INVERSIÓN", tipo: "GASTO", nivel: 1, permiteMovimientos: false },
  { codigo: "C.01", nombre: "Educación", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "C" },
  { codigo: "C.01.01", nombre: "Calidad educativa", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.01" },
  { codigo: "C.01.02", nombre: "Cobertura educativa y permanencia", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.01" },
  { codigo: "C.02", nombre: "Salud y protección social", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "C" },
  { codigo: "C.02.01", nombre: "Aseguramiento en salud", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.02" },
  { codigo: "C.02.02", nombre: "Salud pública", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.02" },
  { codigo: "C.03", nombre: "Vivienda y desarrollo urbano", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "C" },
  { codigo: "C.03.01", nombre: "Vivienda de interés social", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.03" },
  { codigo: "C.04", nombre: "Agua potable y saneamiento básico", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "C" },
  { codigo: "C.04.01", nombre: "Acceso al agua potable", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.04" },
  { codigo: "C.04.02", nombre: "Saneamiento básico", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.04" },
  { codigo: "C.05", nombre: "Transporte", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "C" },
  { codigo: "C.05.01", nombre: "Infraestructura vial", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.05" },
  { codigo: "C.05.02", nombre: "Movilidad", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.05" },
  { codigo: "C.06", nombre: "Cultura, recreación y deporte", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "C" },
  { codigo: "C.06.01", nombre: "Promoción cultural", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.06" },
  { codigo: "C.06.02", nombre: "Deporte y recreación", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.06" },
  { codigo: "C.07", nombre: "Ambiente y desarrollo sostenible", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "C" },
  { codigo: "C.07.01", nombre: "Gestión del cambio climático", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.07" },
  { codigo: "C.07.02", nombre: "Conservación de biodiversidad y ecosistemas", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.07" },
  { codigo: "C.08", nombre: "Gobierno, justicia y seguridad", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "C" },
  { codigo: "C.08.01", nombre: "Fortalecimiento institucional", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.08" },
  { codigo: "C.08.02", nombre: "Justicia y seguridad ciudadana", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.08" },
  { codigo: "C.09", nombre: "Desarrollo social, equidad y género", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "C" },
  { codigo: "C.09.01", nombre: "Inclusión social y reconciliación", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.09" },
  { codigo: "C.09.02", nombre: "Equidad de género e igualdad", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.09" },
  { codigo: "C.10", nombre: "Agricultura y desarrollo rural", tipo: "GASTO", nivel: 2, permiteMovimientos: false, parent: "C" },
  { codigo: "C.10.01", nombre: "Productividad agropecuaria", tipo: "GASTO", nivel: 3, permiteMovimientos: true, parent: "C.10" },

  // ═══════════════════════════════════════════════════════════════════════════
  // INGRESOS — corrientes, de capital, parafiscales y fondos especiales
  // ═══════════════════════════════════════════════════════════════════════════
  { codigo: "1", nombre: "INGRESOS CORRIENTES", tipo: "INGRESO", nivel: 1, permiteMovimientos: false },
  { codigo: "1.1", nombre: "Ingresos tributarios", tipo: "INGRESO", nivel: 2, permiteMovimientos: false, parent: "1" },
  { codigo: "1.1.01", nombre: "Directos", tipo: "INGRESO", nivel: 3, permiteMovimientos: false, parent: "1.1" },
  { codigo: "1.1.01.01", nombre: "Impuesto predial unificado", tipo: "INGRESO", nivel: 4, permiteMovimientos: true, parent: "1.1.01" },
  { codigo: "1.1.01.02", nombre: "Impuesto de circulación y tránsito", tipo: "INGRESO", nivel: 4, permiteMovimientos: true, parent: "1.1.01" },
  { codigo: "1.1.02", nombre: "Indirectos", tipo: "INGRESO", nivel: 3, permiteMovimientos: false, parent: "1.1" },
  { codigo: "1.1.02.01", nombre: "Impuesto de industria y comercio", tipo: "INGRESO", nivel: 4, permiteMovimientos: true, parent: "1.1.02" },
  { codigo: "1.1.02.02", nombre: "Avisos y tableros", tipo: "INGRESO", nivel: 4, permiteMovimientos: true, parent: "1.1.02" },
  { codigo: "1.1.02.03", nombre: "Sobretasa a la gasolina", tipo: "INGRESO", nivel: 4, permiteMovimientos: true, parent: "1.1.02" },
  { codigo: "1.1.02.04", nombre: "Estampillas", tipo: "INGRESO", nivel: 4, permiteMovimientos: true, parent: "1.1.02" },
  { codigo: "1.2", nombre: "Ingresos no tributarios", tipo: "INGRESO", nivel: 2, permiteMovimientos: false, parent: "1" },
  { codigo: "1.2.01", nombre: "Tasas y derechos administrativos", tipo: "INGRESO", nivel: 3, permiteMovimientos: true, parent: "1.2" },
  { codigo: "1.2.02", nombre: "Multas y sanciones", tipo: "INGRESO", nivel: 3, permiteMovimientos: true, parent: "1.2" },
  { codigo: "1.2.03", nombre: "Rentas contractuales", tipo: "INGRESO", nivel: 3, permiteMovimientos: true, parent: "1.2" },
  { codigo: "1.2.04", nombre: "Transferencias del SGP", tipo: "INGRESO", nivel: 3, permiteMovimientos: false, parent: "1.2" },
  { codigo: "1.2.04.01", nombre: "SGP — Educación", tipo: "INGRESO", nivel: 4, permiteMovimientos: true, parent: "1.2.04" },
  { codigo: "1.2.04.02", nombre: "SGP — Salud", tipo: "INGRESO", nivel: 4, permiteMovimientos: true, parent: "1.2.04" },
  { codigo: "1.2.04.03", nombre: "SGP — Agua potable y saneamiento básico", tipo: "INGRESO", nivel: 4, permiteMovimientos: true, parent: "1.2.04" },
  { codigo: "1.2.04.04", nombre: "SGP — Propósito general", tipo: "INGRESO", nivel: 4, permiteMovimientos: true, parent: "1.2.04" },
  { codigo: "1.2.05", nombre: "Sistema general de regalías", tipo: "INGRESO", nivel: 3, permiteMovimientos: true, parent: "1.2" },

  { codigo: "2", nombre: "INGRESOS DE CAPITAL", tipo: "INGRESO", nivel: 1, permiteMovimientos: false },
  { codigo: "2.1", nombre: "Recursos del crédito", tipo: "INGRESO", nivel: 2, permiteMovimientos: false, parent: "2" },
  { codigo: "2.1.01", nombre: "Crédito interno", tipo: "INGRESO", nivel: 3, permiteMovimientos: true, parent: "2.1" },
  { codigo: "2.1.02", nombre: "Crédito externo", tipo: "INGRESO", nivel: 3, permiteMovimientos: true, parent: "2.1" },
  { codigo: "2.2", nombre: "Recursos del balance", tipo: "INGRESO", nivel: 2, permiteMovimientos: false, parent: "2" },
  { codigo: "2.2.01", nombre: "Superávit fiscal", tipo: "INGRESO", nivel: 3, permiteMovimientos: true, parent: "2.2" },
  { codigo: "2.2.02", nombre: "Cancelación de reservas", tipo: "INGRESO", nivel: 3, permiteMovimientos: true, parent: "2.2" },
  { codigo: "2.3", nombre: "Rendimientos financieros", tipo: "INGRESO", nivel: 2, permiteMovimientos: true, parent: "2" },
  { codigo: "2.4", nombre: "Donaciones", tipo: "INGRESO", nivel: 2, permiteMovimientos: true, parent: "2" },
  { codigo: "2.5", nombre: "Cofinanciación", tipo: "INGRESO", nivel: 2, permiteMovimientos: true, parent: "2" },
]

/**
 * Siembra el CCP en el cliente Prisma dado. Idempotente.
 */
export async function seedCcp(prisma: any): Promise<{ total: number; pasadas: number }> {
  const idsPorCodigo = new Map<string, string>()
  const pendientes = [...CCP_RUBROS]
  let pasadas = 0

  while (pendientes.length) {
    pasadas++
    const ahora = pendientes.filter(c => !c.parent || idsPorCodigo.has(c.parent))
    if (!ahora.length) {
      throw new Error(`CCP: rubros con parent inexistente: ${pendientes.map(p => p.codigo).join(", ")}`)
    }
    for (const c of ahora) {
      const parentId = c.parent ? idsPorCodigo.get(c.parent) ?? null : null
      const data = {
        nombre: c.nombre,
        tipo: c.tipo,
        nivel: c.nivel,
        permiteMovimientos: c.permiteMovimientos,
        parentId,
      }
      const saved = await prisma.psuRubro.upsert({
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
