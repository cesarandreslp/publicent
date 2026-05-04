#!/usr/bin/env node
/**
 * import-redirects.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Importa un CSV exportado del CMS anterior y genera entradas de redirect
 * para agregar a src/lib/redirects.ts
 *
 * Uso:
 *   node scripts/import-redirects.mjs urls-antiguas.csv [--output redirects-extra.ts]
 *
 * Formato esperado del CSV (puede ser export de Screaming Frog / Yoast):
 *   url_antigua,url_nueva,codigo
 *   /quienes-somos/historia-de-la-entidad,/entidad/historia,301
 *   /noticias/noticia-1,/noticias/noticia-1,200      ← se omiten los 200
 *   ...
 *
 * También acepta CSVs con solo una columna (URLs del sitio antiguo):
 *   url_antigua
 *   /quienes-somos/historia-de-la-entidad
 *   ...
 *   En este caso el script genera reglas con destino '/' por defecto
 *   y las marca con un TODO para que las completes manualmente.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const [,, csvPath, ...args] = process.argv

if (!csvPath) {
  console.error('Uso: node scripts/import-redirects.mjs <archivo.csv> [--output <salida.ts>]')
  process.exit(1)
}

const outputFlag = args.indexOf('--output')
const outputPath = outputFlag !== -1 ? args[outputFlag + 1] : 'src/lib/redirects-extra.ts'

// ─── Leer y parsear CSV ───────────────────────────────────────────────────────
const raw = readFileSync(resolve(csvPath), 'utf-8')
const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)

// Detectar si tiene encabezado (primera línea tiene letras, no empieza con /)
const hasHeader = !lines[0].startsWith('/')
const dataLines = hasHeader ? lines.slice(1) : lines

const STATIC_ROUTES = new Set([
  '/', '/entidad', '/entidad/historia', '/entidad/mision-vision',
  '/entidad/organigrama', '/entidad/directorio', '/entidad/funciones',
  '/noticias', '/transparencia', '/atencion-ciudadano',
  '/atencion-ciudadano/pqrsd', '/atencion-ciudadano/pqrsd/consulta',
  '/atencion-ciudadano/canales-atencion', '/atencion-ciudadano/preguntas-frecuentes',
  '/atencion-ciudadano/defensoria', '/servicios', '/participa',
  '/privacidad', '/terminos', '/tratamiento-datos', '/accesibilidad', '/mapa-sitio',
])

// Patrones heurísticos para asignar destino automático cuando solo hay source
function inferDestination(src) {
  const s = src.toLowerCase()
  if (s.includes('historia')) return '/entidad/historia'
  if (s.includes('mision') || s.includes('vision')) return '/entidad/mision-vision'
  if (s.includes('organigrama') || s.includes('estructura')) return '/entidad/organigrama'
  if (s.includes('directorio') || s.includes('funcionario')) return '/entidad/directorio'
  if (s.includes('funcion') || s.includes('competen')) return '/entidad/funciones'
  if (s.includes('entidad') || s.includes('quienes') || s.includes('nosotros') || s.includes('institucion')) return '/entidad'
  if (s.includes('pqrsd') || s.includes('pqrs') || s.includes('pqr') || s.includes('peticion') || s.includes('queja') || s.includes('reclamo') || s.includes('radicad')) return '/atencion-ciudadano/pqrsd'
  if (s.includes('consulta-radicado') || s.includes('seguimiento') || s.includes('estado-solicitud')) return '/atencion-ciudadano/pqrsd/consulta'
  if (s.includes('contacto') || s.includes('canal')) return '/atencion-ciudadano/canales-atencion'
  if (s.includes('pregunta') || s.includes('faq')) return '/atencion-ciudadano/preguntas-frecuentes'
  if (s.includes('defensor')) return '/atencion-ciudadano/defensoria'
  if (s.includes('atencion')) return '/atencion-ciudadano'
  if (s.includes('noticia') || s.includes('novedad') || s.includes('prensa') || s.includes('comunicado') || s.includes('blog')) return '/noticias'
  if (s.includes('contratacion') || s.includes('contrato') || s.includes('licitacion')) return '/transparencia/contratacion'
  if (s.includes('normativ') || s.includes('decreto') || s.includes('resolucion') || s.includes('ley')) return '/transparencia/normatividad'
  if (s.includes('presupuesto') || s.includes('financier') || s.includes('estados-financiero')) return '/transparencia/informacion-financiera'
  if (s.includes('plan') || s.includes('anticorrup') || s.includes('planeacion')) return '/transparencia/planeacion'
  if (s.includes('talento') || s.includes('recurso-humano') || s.includes('empleado')) return '/transparencia/talento-humano'
  if (s.includes('control-interno') || s.includes('auditoria')) return '/transparencia/control-interno'
  if (s.includes('ente') || s.includes('vigilancia') || s.includes('control')) return '/transparencia/entes-vigilancia'
  if (s.includes('transparencia')) return '/transparencia'
  if (s.includes('tramite') || s.includes('servicio')) return '/servicios'
  if (s.includes('participa')) return '/participa'
  if (s.includes('privacidad')) return '/privacidad'
  if (s.includes('terminos')) return '/terminos'
  if (s.includes('datos-personal') || s.includes('tratamiento')) return '/tratamiento-datos'
  if (s.includes('accesibilidad')) return '/accesibilidad'
  if (s.includes('mapa')) return '/mapa-sitio'
  if (s.includes('buscar') || s.includes('search')) return '/buscar'
  if (s.includes('mipg') || s.includes('furag') || s.includes('calidad')) return '/transparencia/mipg'
  if (s.includes('calendario') || s.includes('agenda') || s.includes('evento')) return '/transparencia/calendario'
  return null  // No se pudo inferir → marcamos con TODO
}

// ─── Generar redirects ────────────────────────────────────────────────────────
const generated = []
const todos = []
const skipped = []

for (const line of dataLines) {
  const cols = line.split(',')
  const source = cols[0]?.trim().replace(/["']/g, '')
  const destination = cols[1]?.trim().replace(/["']/g, '') ?? ''
  const code = parseInt(cols[2]?.trim() ?? '301', 10)

  if (!source || !source.startsWith('/')) { skipped.push(source); continue }
  if (code === 200 || code === 404) { skipped.push(source); continue }  // no son redirects

  const dest = destination && destination.startsWith('/') ? destination : inferDestination(source)

  if (!dest) {
    todos.push({ source, destination: '/' })
  } else if (STATIC_ROUTES.has(source)) {
    skipped.push(source + ' (ya cubierta en redirects.ts)')
  } else {
    generated.push({ source, destination: dest })
  }
}

// ─── Escribir output .ts ──────────────────────────────────────────────────────
const tsLines = [
  `// AUTO-GENERADO por scripts/import-redirects.mjs`,
  `// ${new Date().toISOString()}`,
  `// Importado desde: ${csvPath}`,
  `// ${generated.length} redirects inferidos, ${todos.length} con destino TODO, ${skipped.length} omitidos`,
  ``,
  `import type { Redirect } from 'next'`,
  ``,
  `export const importedRedirects: Redirect[] = [`,
  ...generated.map(r =>
    `  { source: '${r.source}', destination: '${r.destination}', permanent: true },`
  ),
  ``,
  `  // ── TODO: verificar destino manualmente ──────────────────────`,
  ...todos.map(r =>
    `  // TODO: { source: '${r.source}', destination: '${r.destination}', permanent: true },`
  ),
  `]`,
  ``,
]

writeFileSync(resolve(outputPath), tsLines.join('\n'), 'utf-8')

console.log(`
✅ Resultado:
   ${generated.length} redirects generados → ${outputPath}
   ${todos.length} URLs sin destino inferido (marcadas como TODO)
   ${skipped.length} URLs omitidas (200s, ya cubiertas o inválidas)

Próximo paso: revisa los TODO en ${outputPath} y luego agrega en next.config.ts:
   import { importedRedirects } from './src/lib/redirects-extra'
   ...
   redirects: async () => [...getAllRedirects(), ...importedRedirects]
`)
