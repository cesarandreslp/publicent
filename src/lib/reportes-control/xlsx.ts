/**
 * Exportador XLS de reportes a entes de control.
 *
 * Cada tipo de reporte se mapea a un layout que se aproxima al formato
 * oficial (CHIP/FUT) usable por el contador para subir al portal del ente.
 *
 *  - CHIP_BALANCE   → 1 hoja "Balance" con columnas Cuenta · Nombre · Naturaleza · Débitos · Créditos · Saldo
 *  - CHIP_ACTIVIDAD → 1 hoja "Actividad" con misma estructura sobre clases 4 y 5
 *  - FUT_GASTOS     → 1 hoja "Ejecución de gastos" con columnas FUT estándar
 *  - FUT_INGRESOS   → 1 hoja "Ingresos" con aforado / definitivo
 *  - LEY_617        → 1 hoja "Ley 617" con cabecera + indicador
 *
 * El archivo se entrega como Uint8Array. La ruta API lo devuelve con
 * Content-Type oficial de XLSX.
 *
 * Nota: estos layouts son la primera aproximación. Los formatos oficiales
 * exigen estructuras muy específicas (anexos del CHIP cambian por trimestre,
 * el FUT tiene categorías DNP). El layout aquí sirve para que el contador
 * tenga un archivo navegable y pueda copiar/pegar al template oficial.
 */
import ExcelJS from "exceljs"

type Naturaleza = 'DEBITO' | 'CREDITO'
type FilaCgc = { codigo: string; nombre: string; nivel: number; naturaleza: Naturaleza; debitos: number; creditos: number; saldo: number }
type DatosChip = {
  periodo: { codigo: string; anio: number; mes: number }
  filas: FilaCgc[]
  totales: Record<string, number>
}
type FilaFutGastos = { codigo: string; nombre: string; nivel: number; apropiacionInicial: number; adiciones: number; reducciones: number; apropiado: number; comprometido: number; obligado: number; pagado: number; porEjecutar: number }
type FilaFutIngresos = { codigo: string; nombre: string; nivel: number; aforado: number; adiciones: number; reducciones: number; aforadoDefinitivo: number }

const FMT_COP = '"$"#,##0;[Red]-"$"#,##0'

function aplicarFormatoEncabezado(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } }
  row.alignment = { vertical: 'middle', horizontal: 'center' }
}

function autoAjustarColumnas(ws: ExcelJS.Worksheet) {
  ws.columns.forEach((col) => {
    let max = 10
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const v = cell.value == null ? '' : String(cell.value)
      if (v.length > max) max = v.length
    })
    col.width = Math.min(max + 2, 60)
  })
}

export async function exportarReporteXlsx(tipo: string, datos: any, observacion: string | null): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook()
  wb.creator = "publicent · Reportes de control"
  wb.created = new Date()

  switch (tipo) {
    case 'CHIP_BALANCE':
      construirChipBalance(wb, datos as DatosChip, observacion)
      break
    case 'CHIP_ACTIVIDAD':
      construirChipActividad(wb, datos as DatosChip, observacion)
      break
    case 'FUT_GASTOS':
      construirFutGastos(wb, datos, observacion)
      break
    case 'FUT_INGRESOS':
      construirFutIngresos(wb, datos, observacion)
      break
    case 'LEY_617':
      construirLey617(wb, datos, observacion)
      break
    default:
      throw new Error(`Tipo de reporte no soportado para XLSX: ${tipo}`)
  }

  const buffer = await wb.xlsx.writeBuffer()
  return new Uint8Array(buffer)
}

// ─── CHIP Balance ───────────────────────────────────────────────────────────

function construirChipBalance(wb: ExcelJS.Workbook, d: DatosChip, observacion: string | null) {
  const ws = wb.addWorksheet('Balance')
  ws.mergeCells('A1:F1')
  const h = ws.getCell('A1')
  h.value = `BALANCE GENERAL — Periodo ${d.periodo.codigo}`
  h.font = { bold: true, size: 14 }
  h.alignment = { horizontal: 'center' }

  if (observacion) {
    ws.mergeCells('A2:F2')
    const o = ws.getCell('A2')
    o.value = observacion
    o.font = { italic: true, color: { argb: 'FF6B7280' } }
    o.alignment = { horizontal: 'center' }
  }

  const headerRow = ws.addRow(['Cuenta', 'Nombre', 'Nat.', 'Débitos', 'Créditos', 'Saldo'])
  aplicarFormatoEncabezado(headerRow)

  for (const f of d.filas) {
    const row = ws.addRow([f.codigo, f.nombre, f.naturaleza === 'DEBITO' ? 'D' : 'C', f.debitos, f.creditos, f.saldo])
    row.getCell(4).numFmt = FMT_COP
    row.getCell(5).numFmt = FMT_COP
    row.getCell(6).numFmt = FMT_COP
  }

  ws.addRow([])
  for (const [k, v] of Object.entries(d.totales)) {
    const r = ws.addRow(['', '', k.toUpperCase(), '', '', v as number])
    r.font = { bold: true }
    r.getCell(6).numFmt = FMT_COP
  }

  autoAjustarColumnas(ws)
}

// ─── CHIP Actividad ──────────────────────────────────────────────────────────

function construirChipActividad(wb: ExcelJS.Workbook, d: DatosChip, observacion: string | null) {
  const ws = wb.addWorksheet('Actividad')
  ws.mergeCells('A1:F1')
  const h = ws.getCell('A1')
  h.value = `ESTADO DE ACTIVIDAD ECONÓMICA, SOCIAL Y AMBIENTAL — ${d.periodo.codigo}`
  h.font = { bold: true, size: 14 }
  h.alignment = { horizontal: 'center' }
  if (observacion) {
    ws.mergeCells('A2:F2')
    ws.getCell('A2').value = observacion
    ws.getCell('A2').font = { italic: true }
  }
  const headerRow = ws.addRow(['Cuenta', 'Nombre', 'Nat.', 'Débitos', 'Créditos', 'Saldo'])
  aplicarFormatoEncabezado(headerRow)
  for (const f of d.filas) {
    const row = ws.addRow([f.codigo, f.nombre, f.naturaleza === 'DEBITO' ? 'D' : 'C', f.debitos, f.creditos, f.saldo])
    row.getCell(4).numFmt = FMT_COP
    row.getCell(5).numFmt = FMT_COP
    row.getCell(6).numFmt = FMT_COP
  }
  ws.addRow([])
  for (const [k, v] of Object.entries(d.totales)) {
    const r = ws.addRow(['', '', k.toUpperCase(), '', '', v as number])
    r.font = { bold: true }
    r.getCell(6).numFmt = FMT_COP
  }
  autoAjustarColumnas(ws)
}

// ─── FUT Gastos ──────────────────────────────────────────────────────────────

function construirFutGastos(wb: ExcelJS.Workbook, d: { vigencia: number; filas: FilaFutGastos[]; totales: any }, observacion: string | null) {
  const ws = wb.addWorksheet('Ejecución gastos')
  ws.mergeCells('A1:J1')
  const h = ws.getCell('A1')
  h.value = `EJECUCIÓN PRESUPUESTAL DE GASTOS — Vigencia ${d.vigencia}`
  h.font = { bold: true, size: 14 }
  h.alignment = { horizontal: 'center' }
  if (observacion) {
    ws.mergeCells('A2:J2')
    ws.getCell('A2').value = observacion
    ws.getCell('A2').font = { italic: true }
  }
  const headerRow = ws.addRow([
    'Código CCPET', 'Nombre', 'Nivel',
    'Apropiación inicial', 'Adiciones', 'Reducciones',
    'Apropiación definitiva', 'Comprometido', 'Obligado', 'Pagado',
  ])
  aplicarFormatoEncabezado(headerRow)
  for (const f of d.filas) {
    const row = ws.addRow([
      f.codigo, f.nombre, f.nivel,
      f.apropiacionInicial, f.adiciones, f.reducciones,
      f.apropiado, f.comprometido, f.obligado, f.pagado,
    ])
    for (let c = 4; c <= 10; c++) row.getCell(c).numFmt = FMT_COP
  }
  ws.addRow([])
  const totRow = ws.addRow(['', 'TOTAL', '', '', '', '', d.totales.apropiado, d.totales.comprometido, d.totales.obligado, d.totales.pagado])
  totRow.font = { bold: true }
  for (let c = 4; c <= 10; c++) totRow.getCell(c).numFmt = FMT_COP
  autoAjustarColumnas(ws)
}

// ─── FUT Ingresos ────────────────────────────────────────────────────────────

function construirFutIngresos(wb: ExcelJS.Workbook, d: { vigencia: number; filas: FilaFutIngresos[]; totales: any; nota?: string }, observacion: string | null) {
  const ws = wb.addWorksheet('Ingresos')
  ws.mergeCells('A1:G1')
  const h = ws.getCell('A1')
  h.value = `EJECUCIÓN DE INGRESOS — Vigencia ${d.vigencia}`
  h.font = { bold: true, size: 14 }
  h.alignment = { horizontal: 'center' }
  if (observacion || d.nota) {
    ws.mergeCells('A2:G2')
    ws.getCell('A2').value = [observacion, d.nota].filter(Boolean).join(' · ')
    ws.getCell('A2').font = { italic: true }
  }
  const headerRow = ws.addRow(['Código CCPET', 'Nombre', 'Nivel', 'Aforado inicial', 'Adiciones', 'Reducciones', 'Aforado definitivo'])
  aplicarFormatoEncabezado(headerRow)
  for (const f of d.filas) {
    const row = ws.addRow([f.codigo, f.nombre, f.nivel, f.aforado, f.adiciones, f.reducciones, f.aforadoDefinitivo])
    for (let c = 4; c <= 7; c++) row.getCell(c).numFmt = FMT_COP
  }
  ws.addRow([])
  const t = ws.addRow(['', 'TOTAL', '', '', '', '', d.totales.aforadoDefinitivo])
  t.font = { bold: true }
  t.getCell(7).numFmt = FMT_COP
  autoAjustarColumnas(ws)
}

// ─── Ley 617 ─────────────────────────────────────────────────────────────────

function construirLey617(wb: ExcelJS.Workbook, d: any, observacion: string | null) {
  const ws = wb.addWorksheet('Ley 617')
  ws.mergeCells('A1:B1')
  ws.getCell('A1').value = `INDICADOR LEY 617 — Vigencia ${d.vigencia}`
  ws.getCell('A1').font = { bold: true, size: 14 }
  ws.getCell('A1').alignment = { horizontal: 'center' }
  if (observacion) {
    ws.mergeCells('A2:B2')
    ws.getCell('A2').value = observacion
    ws.getCell('A2').font = { italic: true }
  }
  const items: [string, any][] = [
    ['Funcionamiento apropiado', d.funcionamientoApropiado],
    ['Funcionamiento obligado', d.funcionamientoObligado],
    ['ICLD', d.icld],
    ['Fuente ICLD', d.icldFuente],
    ['Tope categoría', `${(d.topeCategoria * 100).toFixed(2)}%`],
    ['Indicador (%)', `${(d.indicador * 100).toFixed(2)}%`],
    ['Cumple', d.cumple ? 'SÍ' : 'NO'],
    ['Holgura ($)', d.holguraPesos],
  ]
  for (const [k, v] of items) {
    const row = ws.addRow([k, v])
    row.getCell(1).font = { bold: true }
    if (typeof v === 'number') row.getCell(2).numFmt = FMT_COP
  }
  if (!d.cumple) {
    const alert = ws.addRow(['⚠ Excede el tope', ''])
    alert.font = { color: { argb: 'FFB91C1C' }, bold: true }
  }
  autoAjustarColumnas(ws)
}
