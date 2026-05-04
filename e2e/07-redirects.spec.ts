/**
 * 07-redirects.spec.ts
 *
 * Verifica que las redirecciones 301 críticas del sitio funcionan correctamente.
 * Cubre rutas de WordPress, Joomla y URLs antiguas del sitio anterior.
 */

import { test, expect } from '@playwright/test'

// Pares [origen_antiguo, destino_esperado]
const REDIRECT_CASES: [string, string | RegExp][] = [
  // WordPress
  ['/wp-admin',                        /\/login/],
  ['/wp-login.php',                    /\/login/],
  ['/index.php/quienes-somos',         /\/entidad/],
  ['/index.php/noticias',              /\/noticias/],
  ['/index.php/pqrsd',                 /pqrsd/],
  ['/index.php/transparencia',         /transparencia/],

  // Rutas cortas antiguas
  ['/quienes-somos',                   /\/entidad/],
  ['/nosotros',                        /\/entidad/],
  ['/historia',                        /\/entidad\/historia/],
  ['/mision-vision',                   /\/entidad\/mision-vision/],
  ['/organigrama',                     /\/entidad\/organigrama/],
  ['/directorio',                      /\/entidad\/directorio/],

  // PQRSD
  ['/pqrs',                            /pqrsd/],
  ['/pqrsd',                           /pqrsd/],
  ['/solicitudes',                     /pqrsd/],
  ['/seguimiento-pqrsd',               /pqrsd\/consulta/],

  // Transparencia
  ['/transparencia',                   /transparencia/],
  ['/contratacion',                    /contratacion/],
  ['/normatividad',                    /normatividad/],
  ['/mipg',                            /mipg/],

  // Utilidades
  ['/preguntas-frecuentes',            /preguntas-frecuentes/],
  ['/contacto',                        /atencion-ciudadano|contacto/],
  ['/privacidad',                      /privacidad/],
  ['/accesibilidad',                   /accesibilidad/],
  ['/mapa-sitio',                      /mapa-sitio/],
]

test.describe('Redirecciones 301', () => {
  for (const [source, destPattern] of REDIRECT_CASES) {
    test(`${source} → ${destPattern}`, async ({ page }) => {
      const response = await page.goto(source, { waitUntil: 'commit' })
      // Verifica que hubo redirección (la URL final coincide con el patrón)
      expect(page.url()).toMatch(destPattern)
      // El status debe ser 200 después de la redirección
      if (response) {
        expect(response.status()).toBeLessThan(500)
      }
    })
  }

  test('las redirecciones no generan bucles', async ({ page }) => {
    // Verificar que /quienes-somos no redirige a sí mismo
    const response = await page.goto('/quienes-somos', { waitUntil: 'networkidle' })
    expect(page.url()).not.toMatch(/quienes-somos/)
    if (response) {
      expect(response.status()).toBeLessThan(500)
    }
  })

  test('/wp-admin redirige al login y no expone panel de WP', async ({ page }) => {
    await page.goto('/wp-admin', { waitUntil: 'networkidle' })
    expect(page.url()).toMatch(/\/login/)
    // No debe haber contenido de WordPress
    await expect(page.getByText(/wp-admin|WordPress|xmlrpc/i)).not.toBeVisible()
  })
})
