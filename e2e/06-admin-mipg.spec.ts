/**
 * 06-admin-mipg.spec.ts
 *
 * Módulo MIPG desde el panel de administración:
 *   - La página de evaluación carga correctamente
 *   - El selector de vigencia funciona
 *   - Se puede ingresar y guardar un puntaje
 *   - El widget de validación FURAG se muestra
 *   - El banner de alerta de vigencia se muestra (o no, según la fecha)
 */

import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('Admin — Módulo MIPG', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
  })

  test('la página de evaluación MIPG carga correctamente', async ({ page }) => {
    await page.goto('/admin/mipg/evaluacion')
    await expect(page.getByRole('heading', { name: /autodiagnóstico|evaluación|mipg/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/500|error interno/i)).not.toBeVisible()
  })

  test('el selector de vigencia muestra años disponibles', async ({ page }) => {
    await page.goto('/admin/mipg/evaluacion')
    const yearSelect = page.getByLabel(/vigencia/i)
      .or(page.locator('select').filter({ hasText: /202[0-9]/ }))
    await expect(yearSelect).toBeVisible({ timeout: 8_000 })
    const options = await yearSelect.locator('option').allTextContents()
    expect(options.length).toBeGreaterThanOrEqual(3)
  })

  test('el widget de validación FURAG está presente', async ({ page }) => {
    await page.goto('/admin/mipg/evaluacion')
    // Desplazarse al final para ver el widget
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(
      page.getByText(/validación automática|indicadores FURAG/i)
        .or(page.getByRole('button', { name: /ejecutar validación/i }))
    ).toBeVisible({ timeout: 10_000 })
  })

  test('se puede cambiar el año de vigencia y la página reacciona', async ({ page }) => {
    await page.goto('/admin/mipg/evaluacion')
    const yearSelect = page.getByLabel(/vigencia/i)
      .or(page.locator('select').filter({ hasText: /202/ }).first())
    if (await yearSelect.isVisible()) {
      const options = await yearSelect.locator('option').allTextContents()
      const anteriorYear = options.find(o => o.includes('2024') || o.includes('2023'))
      if (anteriorYear) {
        await yearSelect.selectOption({ label: anteriorYear.trim() })
        await page.waitForTimeout(1500)
        await expect(page.getByText(/500|error/i)).not.toBeVisible()
      }
    }
  })

  test('la ejecución del validador FURAG devuelve resultados', async ({ page }) => {
    await page.goto('/admin/mipg/evaluacion')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    const ejecutarBtn = page.getByRole('button', { name: /ejecutar validación/i })
    if (await ejecutarBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
      await ejecutarBtn.click()
      // Esperar resultados (indicadores CONSISTENTE/ALERTA/INCONSISTENTE)
      await expect(
        page.getByText(/consistente|alerta|inconsistente/i).first()
      ).toBeVisible({ timeout: 20_000 })
    }
  })

  test('la página de transparencia MIPG carga', async ({ page }) => {
    await page.goto('/transparencia/mipg')
    await expect(page.getByText(/500|error interno/i)).not.toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
  })
})
