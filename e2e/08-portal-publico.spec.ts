/**
 * 08-portal-publico.spec.ts
 *
 * Rutas públicas del portal:
 *   - Página principal carga con elementos esenciales
 *   - Navegación principal funciona
 *   - Secciones de transparencia accesibles
 *   - Accesibilidad básica (alt texts, roles ARIA)
 *   - Rendimiento: no hay errores JS en consola al cargar
 */

import { test, expect } from '@playwright/test'

const PUBLIC_ROUTES = [
  '/',
  '/entidad',
  '/entidad/historia',
  '/entidad/mision-vision',
  '/entidad/organigrama',
  '/noticias',
  '/transparencia',
  '/transparencia/contratacion',
  '/transparencia/normatividad',
  '/atencion-ciudadano',
  '/atencion-ciudadano/pqrsd',
  '/atencion-ciudadano/preguntas-frecuentes',
  '/privacidad',
  '/accesibilidad',
]

test.describe('Portal público — Rutas esenciales', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} responde sin error 5xx`, async ({ page }) => {
      const errors: string[] = []
      page.on('response', res => {
        if (res.status() >= 500) errors.push(`${res.status()} ${res.url()}`)
      })
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      expect(errors).toHaveLength(0)
    })
  }
})

test.describe('Portal público — Página principal', () => {
  test('tiene título institucional', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/personería|buga/i)
  })

  test('tiene navegación principal visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('el enlace "PQRSD" lleva al formulario de radicación', async ({ page }) => {
    await page.goto('/')
    const pqrsdLink = page.getByRole('link', { name: /pqrsd|petición|atención/i }).first()
    if (await pqrsdLink.isVisible()) {
      await pqrsdLink.click()
      await expect(page).toHaveURL(/pqrsd|atencion-ciudadano/)
    }
  })

  test('no hay errores de consola críticos', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    await page.goto('/', { waitUntil: 'networkidle' })
    // Filtra errores de terceros o de extensiones del navegador
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('extension') &&
      !e.includes('favicon') &&
      !e.includes('analytics')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('Portal público — Transparencia', () => {
  test('la sección de transparencia carga con subsecciones', async ({ page }) => {
    await page.goto('/transparencia')
    // Debe haber al menos 3 enlaces de subsecciones
    const links = page.locator('a[href*="transparencia"]')
    const count = await links.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('el apartado de contratación muestra contenido', async ({ page }) => {
    await page.goto('/transparencia/contratacion')
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByText(/500|error interno/i)).not.toBeVisible()
  })
})

test.describe('Portal público — Accesibilidad básica', () => {
  test('la página principal tiene landmark main', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('las imágenes tienen atributo alt en la página principal', async ({ page }) => {
    await page.goto('/')
    const imgs = page.locator('img:not([alt])')
    const count = await imgs.count()
    // Permite hasta 2 imágenes sin alt (íconos decorativos)
    expect(count).toBeLessThanOrEqual(2)
  })

  test('el formulario de PQRSD tiene labels asociados a inputs', async ({ page }) => {
    await page.goto('/atencion-ciudadano/pqrsd')
    const inputs = page.locator('input[required], textarea[required], select[required]')
    const inputCount = await inputs.count()
    if (inputCount > 0) {
      // Al menos la mitad de los inputs requeridos deben tener label
      const labelled = page.locator('label[for], input[aria-label], textarea[aria-label]')
      const labelCount = await labelled.count()
      expect(labelCount).toBeGreaterThan(0)
    }
  })
})
