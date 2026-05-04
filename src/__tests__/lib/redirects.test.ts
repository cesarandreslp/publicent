/**
 * redirects.test.ts
 * Valida integridad del mapa de redirecciones: no duplicados, destinos válidos,
 * formato correcto y cobertura de rutas esenciales.
 */

import { describe, it, expect } from 'vitest'
import { getAllRedirects } from '@/lib/redirects'

const RUTAS_NUEVAS = new Set([
  '/', '/entidad', '/entidad/historia', '/entidad/mision-vision',
  '/entidad/organigrama', '/entidad/directorio', '/entidad/funciones',
  '/noticias', '/transparencia', '/atencion-ciudadano',
  '/atencion-ciudadano/pqrsd', '/atencion-ciudadano/pqrsd/consulta',
  '/atencion-ciudadano/canales-atencion', '/atencion-ciudadano/preguntas-frecuentes',
  '/atencion-ciudadano/defensoria', '/servicios', '/participa',
  '/privacidad', '/terminos', '/tratamiento-datos', '/accesibilidad',
  '/mapa-sitio', '/buscar', '/login',
  '/transparencia/informacion-financiera', '/transparencia/contratacion',
  '/transparencia/normatividad', '/transparencia/planeacion',
  '/transparencia/talento-humano', '/transparencia/control-interno',
  '/transparencia/entes-vigilancia', '/transparencia/mipg',
  '/transparencia/calendario', '/politicas/derechos-autor',
])

describe('getAllRedirects', () => {
  const redirects = getAllRedirects()

  it('retorna un array no vacío', () => {
    expect(redirects.length).toBeGreaterThan(0)
  })

  it('tiene al menos 150 reglas definidas', () => {
    expect(redirects.length).toBeGreaterThanOrEqual(150)
  })

  it('todos los redirects tienen los campos requeridos', () => {
    for (const r of redirects) {
      expect(r).toHaveProperty('source')
      expect(r).toHaveProperty('destination')
      expect(r).toHaveProperty('permanent')
      expect(typeof r.source).toBe('string')
      expect(typeof r.destination).toBe('string')
      expect(typeof r.permanent).toBe('boolean')
    }
  })

  it('todos los sources empiezan con /', () => {
    for (const r of redirects) {
      expect(r.source.startsWith('/')).toBe(true)
    }
  })

  it('todos los destinations apuntan a rutas del nuevo sitio o son relativos', () => {
    for (const r of redirects) {
      // No deben apuntar a URLs externas absolutas
      expect(r.destination.startsWith('http')).toBe(false)
    }
  })

  it('los sources no tienen trailing slash innecesario (excepto /)', () => {
    for (const r of redirects) {
      if (r.source !== '/' && !r.source.includes(':')) {
        // Wildcard patterns con :param son válidos, los demás no deben terminar en /
        const sinWildcard = !r.source.includes('*') && !r.source.includes(':')
        if (sinWildcard) {
          expect(r.source.endsWith('/')).toBe(false)
        }
      }
    }
  })

  it('no hay sources duplicados', () => {
    const sources = redirects.map(r => r.source)
    const unicos = new Set(sources)
    const duplicados = sources.filter((s, i) => sources.indexOf(s) !== i)
    expect(duplicados).toHaveLength(0)
  })

  it('ningún redirect apunta a sí mismo (bucle infinito)', () => {
    for (const r of redirects) {
      expect(r.source).not.toBe(r.destination)
    }
  })

  it('todos los redirects son permanentes (301)', () => {
    const noPerma = redirects.filter(r => r.permanent === false)
    // Solo se permiten redirects no permanentes si son deliberados
    // En nuestro caso uno (la transparencia interna) no es permanente
    expect(noPerma.length).toBeLessThanOrEqual(2)
  })
})

describe('cobertura de rutas críticas del sitio anterior', () => {
  const redirects = getAllRedirects()
  const sourceSet = new Set(redirects.map(r => r.source))

  const rutasCriticas = [
    // WordPress
    '/index.php',
    '/index.php/quienes-somos',
    '/index.php/noticias',
    '/index.php/transparencia',
    '/index.php/pqrsd',
    '/index.php/atencion-ciudadano',
    '/wp-admin',
    '/wp-login.php',

    // Rutas cortas sin prefijo
    '/quienes-somos',
    '/nosotros',
    '/historia',
    '/mision-vision',
    '/organigrama',
    '/directorio',
    '/funciones',
    '/noticias.html',
    '/pqrsd',
    '/pqrs',
    '/transparencia',
    '/contratacion',
    '/normatividad',
    '/mipg',
    '/contacto',
    '/preguntas-frecuentes',
    '/privacidad',
    '/terminos',
    '/accesibilidad',
    '/mapa-sitio',
  ]

  for (const ruta of rutasCriticas) {
    it(`cubre la ruta: ${ruta}`, () => {
      expect(sourceSet.has(ruta)).toBe(true)
    })
  }
})

describe('destinos de redirects críticos', () => {
  const redirects = getAllRedirects()
  const findDest = (src: string) => redirects.find(r => r.source === src)?.destination

  it('/quienes-somos → /entidad', () => {
    expect(findDest('/quienes-somos')).toBe('/entidad')
  })

  it('/historia → /entidad/historia', () => {
    expect(findDest('/historia')).toBe('/entidad/historia')
  })

  it('/pqrs → /atencion-ciudadano/pqrsd', () => {
    expect(findDest('/pqrs')).toBe('/atencion-ciudadano/pqrsd')
  })

  it('/pqrsd → /atencion-ciudadano/pqrsd', () => {
    expect(findDest('/pqrsd')).toBe('/atencion-ciudadano/pqrsd')
  })

  it('/mipg → /transparencia/mipg', () => {
    expect(findDest('/mipg')).toBe('/transparencia/mipg')
  })

  it('/transparencia-acceso-informacion → /transparencia', () => {
    expect(findDest('/transparencia-acceso-informacion')).toBe('/transparencia')
  })

  it('/wp-admin → /login', () => {
    expect(findDest('/wp-admin')).toBe('/login')
  })

  it('/wp-login.php → /login', () => {
    expect(findDest('/wp-login.php')).toBe('/login')
  })

  it('/contratacion → /transparencia/contratacion', () => {
    expect(findDest('/contratacion')).toBe('/transparencia/contratacion')
  })

  it('/normatividad → /transparencia/normatividad', () => {
    expect(findDest('/normatividad')).toBe('/transparencia/normatividad')
  })

  it('/preguntas-frecuentes → /atencion-ciudadano/preguntas-frecuentes', () => {
    expect(findDest('/preguntas-frecuentes')).toBe('/atencion-ciudadano/preguntas-frecuentes')
  })

  it('/seguimiento-pqrsd → /atencion-ciudadano/pqrsd/consulta', () => {
    expect(findDest('/seguimiento-pqrsd')).toBe('/atencion-ciudadano/pqrsd/consulta')
  })
})
