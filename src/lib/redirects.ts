/**
 * redirects.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Mapa completo de redirecciones 301 para el sitio nuevo de Personería Buga.
 *
 * Origen: URLs del CMS anterior (WordPress / Joomla) con sus variantes
 * Destino: rutas de la nueva aplicación Next.js
 *
 * Organización:
 *  A. WordPress index.php patterns
 *  B. Joomla ?option= patterns
 *  C. Sección /entidad y sus sub-rutas
 *  D. Sección /atencion-ciudadano
 *  E. Sección /transparencia
 *  F. Noticias y novedades
 *  G. Servicios
 *  H. Participa y normativa
 *  I. Políticas y términos legales
 *  J. PQRSD / PQR / PQRS (variantes de nombre)
 *  K. URLs con número de página o query strings comunes
 *  L. Typos y variantes frecuentes
 *
 * Para agregar más redirecciones desde un CSV exportado del sitio anterior,
 * usa el script: scripts/import-redirects.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { NextConfig } from "next"
type Redirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number]

// ─── A. WordPress /index.php/... ─────────────────────────────────────────────
const wpRedirects: Redirect[] = [
  { source: '/index.php',                                     destination: '/',                           permanent: true },

  // Entidad / Institución
  { source: '/index.php/quienes-somos',                       destination: '/entidad',                    permanent: true },
  { source: '/index.php/nosotros',                            destination: '/entidad',                    permanent: true },
  { source: '/index.php/la-entidad',                          destination: '/entidad',                    permanent: true },
  { source: '/index.php/institucion',                         destination: '/entidad',                    permanent: true },
  { source: '/index.php/quienes-somos/historia',              destination: '/entidad/historia',           permanent: true },
  { source: '/index.php/historia',                            destination: '/entidad/historia',           permanent: true },
  { source: '/index.php/quienes-somos/mision-vision',         destination: '/entidad/mision-vision',      permanent: true },
  { source: '/index.php/mision-vision',                       destination: '/entidad/mision-vision',      permanent: true },
  { source: '/index.php/mision',                              destination: '/entidad/mision-vision',      permanent: true },
  { source: '/index.php/quienes-somos/organigrama',           destination: '/entidad/organigrama',        permanent: true },
  { source: '/index.php/organigrama',                         destination: '/entidad/organigrama',        permanent: true },
  { source: '/index.php/quienes-somos/directorio',            destination: '/entidad/directorio',         permanent: true },
  { source: '/index.php/directorio',                          destination: '/entidad/directorio',         permanent: true },
  { source: '/index.php/directorio-funcionarios',             destination: '/entidad/directorio',         permanent: true },
  { source: '/index.php/quienes-somos/funciones',             destination: '/entidad/funciones',          permanent: true },
  { source: '/index.php/funciones',                           destination: '/entidad/funciones',          permanent: true },
  { source: '/index.php/funciones-competencias',              destination: '/entidad/funciones',          permanent: true },

  // Noticias
  { source: '/index.php/noticias',                            destination: '/noticias',                   permanent: true },
  { source: '/index.php/novedades',                           destination: '/noticias',                   permanent: true },
  { source: '/index.php/prensa',                              destination: '/noticias',                   permanent: true },
  { source: '/index.php/comunicados',                         destination: '/noticias',                   permanent: true },
  { source: '/index.php/blog',                                destination: '/noticias',                   permanent: true },

  // Transparencia
  { source: '/index.php/transparencia',                       destination: '/transparencia',              permanent: true },
  { source: '/index.php/transparencia-acceso-informacion',    destination: '/transparencia',              permanent: true },
  { source: '/index.php/transparencia/informacion-financiera',destination: '/transparencia/informacion-financiera', permanent: true },
  { source: '/index.php/transparencia/presupuesto',           destination: '/transparencia/informacion-financiera', permanent: true },
  { source: '/index.php/transparencia/contratacion',          destination: '/transparencia/contratacion', permanent: true },
  { source: '/index.php/transparencia/normatividad',          destination: '/transparencia/normatividad', permanent: true },
  { source: '/index.php/transparencia/planeacion',            destination: '/transparencia/planeacion',   permanent: true },
  { source: '/index.php/transparencia/talento-humano',        destination: '/transparencia/talento-humano', permanent: true },
  { source: '/index.php/transparencia/control-interno',       destination: '/transparencia/control-interno', permanent: true },
  { source: '/index.php/transparencia/entes-vigilancia',      destination: '/transparencia/entes-vigilancia', permanent: true },
  { source: '/index.php/mipg',                                destination: '/transparencia/mipg',         permanent: true },
  { source: '/index.php/plan-anticorrupcion',                 destination: '/transparencia/planeacion',   permanent: true },
  { source: '/index.php/transparencia/mipg',                  destination: '/transparencia/mipg',         permanent: true },
  { source: '/index.php/plan-desarrollo',                     destination: '/transparencia/planeacion',   permanent: true },

  // PQRSD
  { source: '/index.php/pqrs',                                destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/index.php/pqrsd',                               destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/index.php/peticiones',                          destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/index.php/quejas-reclamos',                     destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/index.php/radicacion',                          destination: '/atencion-ciudadano/pqrsd',   permanent: true },

  // Atención ciudadana
  { source: '/index.php/atencion-ciudadana',                  destination: '/atencion-ciudadano',         permanent: true },
  { source: '/index.php/atencion-ciudadano',                  destination: '/atencion-ciudadano',         permanent: true },
  { source: '/index.php/contacto',                            destination: '/atencion-ciudadano/canales-atencion', permanent: true },
  { source: '/index.php/canales-atencion',                    destination: '/atencion-ciudadano/canales-atencion', permanent: true },
  { source: '/index.php/preguntas-frecuentes',                destination: '/atencion-ciudadano/preguntas-frecuentes', permanent: true },
  { source: '/index.php/faq',                                 destination: '/atencion-ciudadano/preguntas-frecuentes', permanent: true },
  { source: '/index.php/defensoria',                          destination: '/atencion-ciudadano/defensoria', permanent: true },

  // Servicios
  { source: '/index.php/servicios',                           destination: '/servicios',                  permanent: true },
  { source: '/index.php/tramites',                            destination: '/servicios',                  permanent: true },
  { source: '/index.php/tramites-servicios',                  destination: '/servicios',                  permanent: true },

  // Participa
  { source: '/index.php/participa',                           destination: '/participa',                  permanent: true },
  { source: '/index.php/participacion-ciudadana',             destination: '/participa',                  permanent: true },

  // Políticas y términos
  { source: '/index.php/privacidad',                          destination: '/privacidad',                 permanent: true },
  { source: '/index.php/politica-privacidad',                 destination: '/privacidad',                 permanent: true },
  { source: '/index.php/terminos',                            destination: '/terminos',                   permanent: true },
  { source: '/index.php/terminos-condiciones',                destination: '/terminos',                   permanent: true },
  { source: '/index.php/derechos-autor',                      destination: '/politicas/derechos-autor',   permanent: true },
  { source: '/index.php/tratamiento-datos',                   destination: '/tratamiento-datos',          permanent: true },
  { source: '/index.php/accesibilidad',                       destination: '/accesibilidad',              permanent: true },
  { source: '/index.php/mapa-sitio',                          destination: '/mapa-sitio',                 permanent: true },
  { source: '/index.php/buscar',                              destination: '/buscar',                     permanent: true },
]

// ─── B. Joomla ?option=com_content&view=... ──────────────────────────────────
// Next.js no permite querystrings en `source`; los query params se declaran en `has`.
const joomlaRedirects: Redirect[] = [
  {
    source: '/',
    has: [
      { type: 'query', key: 'option', value: 'com_content' },
      { type: 'query', key: 'view',   value: 'article' },
    ],
    destination: '/',
    permanent: true,
  },
  { source: '/component/content/article/:id', destination: '/', permanent: true },
  {
    source: '/',
    has: [
      { type: 'query', key: 'option', value: 'com_contact' },
      { type: 'query', key: 'view',   value: 'contact' },
    ],
    destination: '/atencion-ciudadano/canales-atencion',
    permanent: true,
  },
]

// ─── C. URLs cortas sin /index.php (WordPress permalinks) ────────────────────
const shortRedirects: Redirect[] = [
  // Entidad
  { source: '/quienes-somos',                                 destination: '/entidad',                    permanent: true },
  { source: '/nosotros',                                       destination: '/entidad',                    permanent: true },
  { source: '/la-entidad',                                     destination: '/entidad',                    permanent: true },
  { source: '/institucion',                                    destination: '/entidad',                    permanent: true },
  { source: '/sobre-nosotros',                                 destination: '/entidad',                    permanent: true },
  { source: '/historia',                                       destination: '/entidad/historia',           permanent: true },
  { source: '/historia-institucional',                         destination: '/entidad/historia',           permanent: true },
  { source: '/resena-historica',                               destination: '/entidad/historia',           permanent: true },
  { source: '/mision-vision',                                  destination: '/entidad/mision-vision',      permanent: true },
  { source: '/mision',                                         destination: '/entidad/mision-vision',      permanent: true },
  { source: '/vision',                                         destination: '/entidad/mision-vision',      permanent: true },
  { source: '/mision-y-vision',                                destination: '/entidad/mision-vision',      permanent: true },
  { source: '/organigrama',                                    destination: '/entidad/organigrama',        permanent: true },
  { source: '/estructura-organizacional',                      destination: '/entidad/organigrama',        permanent: true },
  { source: '/directorio',                                     destination: '/entidad/directorio',         permanent: true },
  { source: '/directorio-funcionarios',                        destination: '/entidad/directorio',         permanent: true },
  { source: '/funcionarios',                                   destination: '/entidad/directorio',         permanent: true },
  { source: '/personal',                                       destination: '/entidad/directorio',         permanent: true },
  { source: '/funciones',                                      destination: '/entidad/funciones',          permanent: true },
  { source: '/funciones-competencias',                         destination: '/entidad/funciones',          permanent: true },
  { source: '/competencias',                                   destination: '/entidad/funciones',          permanent: true },
  { source: '/marco-legal',                                    destination: '/entidad/funciones',          permanent: true },

  // Noticias y comunicados
  { source: '/novedades',                                      destination: '/noticias',                   permanent: true },
  { source: '/prensa',                                         destination: '/noticias',                   permanent: true },
  { source: '/comunicados',                                    destination: '/noticias',                   permanent: true },
  { source: '/comunicados-prensa',                             destination: '/noticias',                   permanent: true },
  { source: '/blog',                                           destination: '/noticias',                   permanent: true },
  { source: '/sala-prensa',                                    destination: '/noticias',                   permanent: true },
  { source: '/sala-de-prensa',                                 destination: '/noticias',                   permanent: true },

  // Transparencia y sus sub-categorías
  { source: '/transparencia-acceso-informacion',               destination: '/transparencia',              permanent: true },
  { source: '/transparencia-y-acceso',                         destination: '/transparencia',              permanent: true },
  { source: '/acceso-informacion',                             destination: '/transparencia',              permanent: true },
  { source: '/informacion-publica',                            destination: '/transparencia',              permanent: true },
  { source: '/presupuesto',                                    destination: '/transparencia/informacion-financiera', permanent: true },
  { source: '/informacion-financiera',                         destination: '/transparencia/informacion-financiera', permanent: true },
  { source: '/estados-financieros',                            destination: '/transparencia/informacion-financiera', permanent: true },
  { source: '/contratacion',                                   destination: '/transparencia/contratacion', permanent: true },
  { source: '/contrataciones',                                 destination: '/transparencia/contratacion', permanent: true },
  { source: '/contratos',                                      destination: '/transparencia/contratacion', permanent: true },
  { source: '/normatividad',                                   destination: '/transparencia/normatividad', permanent: true },
  { source: '/normativa',                                      destination: '/transparencia/normatividad', permanent: true },
  { source: '/leyes',                                          destination: '/transparencia/normatividad', permanent: true },
  { source: '/decretos',                                       destination: '/transparencia/normatividad', permanent: true },
  { source: '/planeacion',                                     destination: '/transparencia/planeacion',   permanent: true },
  { source: '/plan-accion',                                    destination: '/transparencia/planeacion',   permanent: true },
  { source: '/plan-de-accion',                                 destination: '/transparencia/planeacion',   permanent: true },
  { source: '/plan-anticorrupcion',                            destination: '/transparencia/planeacion',   permanent: true },
  { source: '/plan-desarrollo',                                destination: '/transparencia/planeacion',   permanent: true },
  { source: '/talento-humano',                                 destination: '/transparencia/talento-humano', permanent: true },
  { source: '/recurso-humano',                                 destination: '/transparencia/talento-humano', permanent: true },
  { source: '/control-interno',                                destination: '/transparencia/control-interno', permanent: true },
  { source: '/entes-vigilancia',                               destination: '/transparencia/entes-vigilancia', permanent: true },
  { source: '/organos-control',                                destination: '/transparencia/entes-vigilancia', permanent: true },
  { source: '/mipg',                                           destination: '/transparencia/mipg',         permanent: true },
  { source: '/gestion-calidad',                                destination: '/transparencia/mipg',         permanent: true },
  { source: '/gobierno-digital',                               destination: '/transparencia/mipg',         permanent: true },
  { source: '/calendario',                                     destination: '/transparencia/calendario',   permanent: true },
  { source: '/agenda',                                         destination: '/transparencia/calendario',   permanent: true },
  { source: '/eventos',                                        destination: '/transparencia/calendario',   permanent: true },

  // PQRSD / variantes
  { source: '/pqrs',                                           destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/pqrsd',                                          destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/pqr',                                            destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/peticiones',                                     destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/quejas',                                         destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/quejas-reclamos',                                destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/reclamos',                                       destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/denuncias',                                      destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/sugerencias',                                    destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/radicacion',                                     destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/ventanilla',                                     destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/ventanilla-unica',                               destination: '/atencion-ciudadano/pqrsd',   permanent: true },

  // Consulta estado PQRSD
  { source: '/consultar-pqrs',                                 destination: '/atencion-ciudadano/pqrsd/consulta', permanent: true },
  { source: '/consultar-pqrsd',                                destination: '/atencion-ciudadano/pqrsd/consulta', permanent: true },
  { source: '/estado-solicitud',                               destination: '/atencion-ciudadano/pqrsd/consulta', permanent: true },
  { source: '/seguimiento',                                     destination: '/atencion-ciudadano/pqrsd/consulta', permanent: true },
  { source: '/seguimiento-pqrsd',                              destination: '/atencion-ciudadano/pqrsd/consulta', permanent: true },
  { source: '/consultar-radicado',                             destination: '/atencion-ciudadano/pqrsd/consulta', permanent: true },

  // Atención ciudadana
  { source: '/atencion-ciudadana',                             destination: '/atencion-ciudadano',         permanent: true },
  { source: '/atencion-al-ciudadano',                          destination: '/atencion-ciudadano',         permanent: true },
  { source: '/contacto',                                       destination: '/atencion-ciudadano/canales-atencion', permanent: true },
  { source: '/contactenos',                                    destination: '/atencion-ciudadano/canales-atencion', permanent: true },
  { source: '/canales-atencion',                               destination: '/atencion-ciudadano/canales-atencion', permanent: true },
  { source: '/canales-de-atencion',                            destination: '/atencion-ciudadano/canales-atencion', permanent: true },
  { source: '/puntos-atencion',                                destination: '/atencion-ciudadano/canales-atencion', permanent: true },
  { source: '/preguntas-frecuentes',                           destination: '/atencion-ciudadano/preguntas-frecuentes', permanent: true },
  { source: '/faq',                                            destination: '/atencion-ciudadano/preguntas-frecuentes', permanent: true },
  { source: '/faqs',                                           destination: '/atencion-ciudadano/preguntas-frecuentes', permanent: true },
  { source: '/defensoria',                                     destination: '/atencion-ciudadano/defensoria', permanent: true },
  { source: '/defensor',                                       destination: '/atencion-ciudadano/defensoria', permanent: true },
  { source: '/defensor-ciudadano',                             destination: '/atencion-ciudadano/defensoria', permanent: true },

  // Servicios / Trámites
  { source: '/tramites',                                       destination: '/servicios',                  permanent: true },
  { source: '/tramites-servicios',                             destination: '/servicios',                  permanent: true },
  { source: '/servicios-ciudadano',                            destination: '/servicios',                  permanent: true },
  { source: '/oferta-servicios',                               destination: '/servicios',                  permanent: true },

  // Participa
  { source: '/participacion',                                  destination: '/participa',                  permanent: true },
  { source: '/participacion-ciudadana',                        destination: '/participa',                  permanent: true },
  { source: '/veedurias',                                      destination: '/participa',                  permanent: true },
  { source: '/espacios-participacion',                         destination: '/participa',                  permanent: true },

  // Políticas legales
  { source: '/privacidad',                                     destination: '/privacidad',                 permanent: true },
  { source: '/politica-privacidad',                            destination: '/privacidad',                 permanent: true },
  { source: '/politica-de-privacidad',                         destination: '/privacidad',                 permanent: true },
  { source: '/terminos-condiciones',                           destination: '/terminos',                   permanent: true },
  { source: '/terminos-y-condiciones',                         destination: '/terminos',                   permanent: true },
  { source: '/derechos-autor',                                 destination: '/politicas/derechos-autor',   permanent: true },
  { source: '/propiedad-intelectual',                          destination: '/politicas/derechos-autor',   permanent: true },
  { source: '/tratamiento-datos',                              destination: '/tratamiento-datos',          permanent: true },
  { source: '/datos-personales',                               destination: '/tratamiento-datos',          permanent: true },
  { source: '/proteccion-datos',                               destination: '/tratamiento-datos',          permanent: true },
  { source: '/accesibilidad',                                  destination: '/accesibilidad',              permanent: true },
  { source: '/mapa-del-sitio',                                 destination: '/mapa-sitio',                 permanent: true },
  { source: '/mapa-web',                                       destination: '/mapa-sitio',                 permanent: true },
  { source: '/busqueda',                                       destination: '/buscar',                     permanent: true },
  { source: '/search',                                         destination: '/buscar',                     permanent: true },
]

// ─── D. Rutas con /categoria/ o /category/ (WordPress taxonomy) ──────────────
const categoryRedirects: Redirect[] = [
  { source: '/categoria/noticias',                             destination: '/noticias',                   permanent: true },
  { source: '/categoria/novedades',                            destination: '/noticias',                   permanent: true },
  { source: '/category/news',                                  destination: '/noticias',                   permanent: true },
  { source: '/category/noticias',                              destination: '/noticias',                   permanent: true },
  { source: '/tag/:tag',                                       destination: '/noticias',                   permanent: true },
  { source: '/etiqueta/:tag',                                  destination: '/noticias',                   permanent: true },
  { source: '/author/:author',                                 destination: '/',                           permanent: true },
  { source: '/autor/:author',                                  destination: '/',                           permanent: true },
]

// ─── E. WordPress paginación (/page/N) ────────────────────────────────────────
const paginationRedirects: Redirect[] = [
  { source: '/noticias/page/:num',                             destination: '/noticias',                   permanent: true },
  { source: '/noticias/pagina/:num',                           destination: '/noticias',                   permanent: true },
  { source: '/noticias/p/:num',                                destination: '/noticias',                   permanent: true },
  { source: '/index.php/noticias/page/:num',                   destination: '/noticias',                   permanent: true },
  { source: '/page/:num',                                      destination: '/',                           permanent: true },
]

// ─── F. Archivos WordPress de administración (no deben ser accesibles) ───────
const wpAdminRedirects: Redirect[] = [
  { source: '/wp-admin',                                       destination: '/login',                      permanent: true },
  { source: '/wp-admin/:path*',                               destination: '/login',                      permanent: true },
  { source: '/wp-login.php',                                   destination: '/login',                      permanent: true },
  { source: '/wp-content/:path*',                             destination: '/',                           permanent: true },
  { source: '/wp-includes/:path*',                            destination: '/',                           permanent: true },
  { source: '/administrator',                                  destination: '/login',                      permanent: true },  // Joomla
  { source: '/admin',                                          destination: '/admin',                      permanent: false }, // No redirigir admin interno
]

// ─── G. Variantes con extensión de archivo ────────────────────────────────────
const extensionRedirects: Redirect[] = [
  { source: '/index.html',                                     destination: '/',                           permanent: true },
  { source: '/index.php',                                      destination: '/',                           permanent: true },
  { source: '/home.html',                                      destination: '/',                           permanent: true },
  { source: '/inicio.html',                                    destination: '/',                           permanent: true },
  { source: '/noticias.html',                                  destination: '/noticias',                   permanent: true },
  { source: '/contacto.html',                                  destination: '/atencion-ciudadano/canales-atencion', permanent: true },
  { source: '/pqrs.html',                                      destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/pqrsd.html',                                     destination: '/atencion-ciudadano/pqrsd',   permanent: true },
  { source: '/transparencia.html',                             destination: '/transparencia',              permanent: true },
]

// ─── H. Secciones internas de transparencia (variantes adicionales) ───────────
const transparenciaRedirects: Redirect[] = [
  { source: '/transparencia/informacion-financiera',           destination: '/transparencia/informacion-financiera', permanent: false },
  { source: '/transparencia/financiera',                       destination: '/transparencia/informacion-financiera', permanent: true },
  { source: '/transparencia/presupuesto',                      destination: '/transparencia/informacion-financiera', permanent: true },
  { source: '/transparencia/contratos',                        destination: '/transparencia/contratacion', permanent: true },
  { source: '/transparencia/convenios',                        destination: '/transparencia/contratacion', permanent: true },
  { source: '/transparencia/normas',                           destination: '/transparencia/normatividad', permanent: true },
  { source: '/transparencia/decretos',                         destination: '/transparencia/normatividad', permanent: true },
  { source: '/transparencia/resoluciones',                     destination: '/transparencia/normatividad', permanent: true },
  { source: '/transparencia/planes',                           destination: '/transparencia/planeacion',   permanent: true },
  { source: '/transparencia/plan-accion',                      destination: '/transparencia/planeacion',   permanent: true },
  { source: '/transparencia/recurso-humano',                   destination: '/transparencia/talento-humano', permanent: true },
  { source: '/transparencia/empleados',                        destination: '/transparencia/talento-humano', permanent: true },
  { source: '/transparencia/audit',                            destination: '/transparencia/control-interno', permanent: true },
  { source: '/transparencia/informes',                         destination: '/transparencia/planeacion',   permanent: true },
  { source: '/transparencia/gestion',                          destination: '/transparencia/mipg',         permanent: true },
]

// ─── I. Typos y variantes de ortografía frecuentes ────────────────────────────
const typoRedirects: Redirect[] = [
  { source: '/atencion-ciudadana',                             destination: '/atencion-ciudadano',         permanent: true },
  { source: '/atencion_ciudadano',                             destination: '/atencion-ciudadano',         permanent: true },
  { source: '/atencion%20ciudadano',                           destination: '/atencion-ciudadano',         permanent: true },
  { source: '/mision_vision',                                  destination: '/entidad/mision-vision',      permanent: true },
  { source: '/transparencia-y-acceso-a-la-informacion',        destination: '/transparencia',              permanent: true },
  { source: '/transparencia-acceso-a-la-informacion',          destination: '/transparencia',              permanent: true },
  { source: '/preguntas_frecuentes',                           destination: '/atencion-ciudadano/preguntas-frecuentes', permanent: true },
  { source: '/preguntasfrecuentes',                            destination: '/atencion-ciudadano/preguntas-frecuentes', permanent: true },
]

// ─── Exportar conjunto completo ───────────────────────────────────────────────

export function getAllRedirects(): Redirect[] {
  // wp-admin tiene una entrada sin wildcard que no debe duplicarse
  const wpAdminFiltered = wpAdminRedirects.filter(r => r.source !== '/admin')

  return [
    ...wpRedirects,
    ...joomlaRedirects,
    ...shortRedirects,
    ...categoryRedirects,
    ...paginationRedirects,
    ...wpAdminFiltered,
    ...extensionRedirects,
    ...transparenciaRedirects,
    ...typoRedirects,
  ]
}
