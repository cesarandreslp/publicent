/**
 * Test de rendimiento: cálculo de vencimientos PQRS
 * 
 * Simula N cálculos concurrentes de fechas de vencimiento
 * midiendo tiempo total, promedio por cálculo y throughput.
 * 
 * Ejecutar: npx tsx scripts/test-carga-pqrs.ts
 */

// Simular festivos algorítmicos (sin BD)
function calcPascua(anio: number): Date {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(anio, mes - 1, dia, 12)
}

function trasladarLunes(fecha: Date): Date {
  const d = new Date(fecha)
  const dia = d.getDay()
  if (dia === 1) return d
  if (dia === 0) { d.setDate(d.getDate() + 1); return d }
  d.setDate(d.getDate() + (8 - dia))
  return d
}

function getFestivos(anio: number): Set<string> {
  const fijos = [
    [1, 1], [5, 1], [7, 20], [8, 7], [12, 8], [12, 25],
  ]
  const traslados = [
    [1, 6], [3, 19], [6, 29], [8, 15], [10, 12], [11, 1], [11, 11],
  ]
  const set = new Set<string>()
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  for (const [m, d] of fijos) set.add(fmt(new Date(anio, m - 1, d)))
  for (const [m, d] of traslados) set.add(fmt(trasladarLunes(new Date(anio, m - 1, d))))

  const pascua = calcPascua(anio)
  const js = new Date(pascua); js.setDate(js.getDate() - 3); set.add(fmt(js))
  const vs = new Date(pascua); vs.setDate(vs.getDate() - 2); set.add(fmt(vs))

  const asc = new Date(pascua); asc.setDate(asc.getDate() + 39)
  while (asc.getDay() !== 1) asc.setDate(asc.getDate() + 1); set.add(fmt(asc))
  const cor = new Date(pascua); cor.setDate(cor.getDate() + 60)
  while (cor.getDay() !== 1) cor.setDate(cor.getDate() + 1); set.add(fmt(cor))
  const sag = new Date(pascua); sag.setDate(sag.getDate() + 68)
  while (sag.getDay() !== 1) sag.setDate(sag.getDate() + 1); set.add(fmt(sag))

  return set
}

const PLAZOS: Record<string, number> = {
  PETICION: 15, QUEJA: 15, RECLAMO: 15,
  CONSULTA: 30, DENUNCIA: 10, SOLICITUD_INFO: 10,
}

function calcularVencimiento(tipo: string, desde: Date): Date {
  const dias = PLAZOS[tipo] ?? 15
  const cursor = new Date(desde)
  let contados = 0
  const anio = cursor.getFullYear()
  const festivos = getFestivos(anio)
  const festivos2 = getFestivos(anio + 1) // por si cruza año

  while (contados < dias) {
    cursor.setDate(cursor.getDate() + 1)
    const dow = cursor.getDay()
    if (dow === 0 || dow === 6) continue // fin de semana
    const key = cursor.toISOString().slice(0, 10)
    if (festivos.has(key) || festivos2.has(key)) continue // festivo
    contados++
  }
  return cursor
}

// ═══════════════════════════════════════════════════════
// TEST DE CARGA
// ═══════════════════════════════════════════════════════

const TOTAL = 10_000
const TIPOS = Object.keys(PLAZOS)

console.log(`\n🔄 Test de carga: ${TOTAL.toLocaleString()} cálculos de vencimiento PQRS\n`)
console.log(`Tipos: ${TIPOS.join(', ')}`)
console.log(`Plazos: ${TIPOS.map(t => `${t}=${PLAZOS[t]}d`).join(', ')}\n`)

const inicio = performance.now()
const resultados: Date[] = []

for (let i = 0; i < TOTAL; i++) {
  const tipo = TIPOS[i % TIPOS.length]
  // Fechas aleatorias en 2026
  const mes = Math.floor(Math.random() * 12)
  const dia = Math.floor(Math.random() * 28) + 1
  const desde = new Date(2026, mes, dia)
  resultados.push(calcularVencimiento(tipo, desde))
}

const fin = performance.now()
const totalMs = fin - inicio
const promedioMs = totalMs / TOTAL
const throughput = Math.round(TOTAL / (totalMs / 1000))

console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`✅ Resultados:`)
console.log(`   Total:      ${totalMs.toFixed(1)} ms`)
console.log(`   Promedio:   ${promedioMs.toFixed(4)} ms/cálculo`)
console.log(`   Throughput: ${throughput.toLocaleString()} cálculos/segundo`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

// Verificación de correctitud
console.log(`\n📋 Verificación de correctitud:`)
for (const tipo of TIPOS) {
  const venc = calcularVencimiento(tipo, new Date(2026, 0, 5)) // 5 enero 2026 (lunes)
  console.log(`   ${tipo.padEnd(14)} → ${venc.toISOString().slice(0, 10)} (${PLAZOS[tipo]} días hábiles desde 2026-01-05)`)
}

// Semáforo de rendimiento
if (promedioMs < 0.1) {
  console.log(`\n🟢 EXCELENTE: <0.1ms por cálculo — rendimiento óptimo para producción`)
} else if (promedioMs < 1) {
  console.log(`\n🟡 BUENO: <1ms por cálculo — aceptable para producción`)
} else {
  console.log(`\n🔴 LENTO: >1ms por cálculo — requiere optimización`)
}
console.log('')
