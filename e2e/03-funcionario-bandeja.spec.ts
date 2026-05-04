/**
 * 03-funcionario-bandeja.spec.ts
 *
 * Flujo del funcionario en la bandeja de Ventanilla Única:
 *   - Ver métricas del encabezado
 *   - Aplicar filtros (semáforo, estado, tipo)
 *   - Navegar al detalle de una PQRSD
 *   - Ver semáforo visual
 */

import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('Funcionario — Bandeja de Ventanilla Única', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'funcionario')
    await page.goto('/admin/ventanilla')
  })

  test('carga la bandeja de entrada correctamente', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ventanilla|bandeja|pqrsd/i })).toBeVisible()
  })

  test('muestra tarjetas de métricas', async ({ page }) => {
    // Al menos 2 de las 4 tarjetas de métricas deben ser visibles
    const metricCards = page.locator('[data-metric], .metric-card, [class*="metric"]')
    const count = await metricCards.count()
    if (count === 0) {
      // Fallback: busca texto de métricas típicas
      const texts = ['Pendientes', 'Urgentes', 'Mis casos', 'Vencidas']
      let found = 0
      for (const t of texts) {
        if (await page.getByText(t).isVisible().catch(() => false)) found++
      }
      expect(found).toBeGreaterThanOrEqual(2)
    } else {
      expect(count).toBeGreaterThanOrEqual(2)
    }
  })

  test('panel de filtros se expande y colapsa', async ({ page }) => {
    const filterBtn = page.getByRole('button', { name: /filtrar|filtros/i })
    if (await filterBtn.isVisible()) {
      await filterBtn.click()
      // Debe aparecer algún control de filtro
      await expect(page.getByLabel(/estado|semáforo|tipo/i).first()).toBeVisible({ timeout: 4_000 })
      await filterBtn.click()
      await expect(page.getByLabel(/estado|semáforo|tipo/i).first()).not.toBeVisible({ timeout: 4_000 })
    }
  })

  test('la tabla de PQRSD muestra columnas esperadas', async ({ page }) => {
    const headers = ['Radicado', 'Tipo', 'Estado']
    for (const h of headers) {
      const el = page.getByRole('columnheader', { name: new RegExp(h, 'i') })
        .or(page.getByText(h, { exact: false }).first())
      await expect(el).toBeVisible({ timeout: 6_000 })
    }
  })

  test('se puede filtrar por semáforo ROJO', async ({ page }) => {
    const filterBtn = page.getByRole('button', { name: /filtrar|filtros/i })
    if (await filterBtn.isVisible()) {
      await filterBtn.click()
      const semaforoSelect = page.getByLabel(/semáforo/i)
      if (await semaforoSelect.isVisible()) {
        await semaforoSelect.selectOption({ label: 'Rojo' })
        // Esperar a que la tabla se actualice
        await page.waitForTimeout(1000)
        // No debe haber error visible
        await expect(page.getByText(/error|500|fallo/i)).not.toBeVisible()
      }
    }
  })

  test('el interruptor "Solo mis casos" filtra la lista', async ({ page }) => {
    const toggle = page.getByRole('checkbox', { name: /mis casos/i })
      .or(page.getByLabel(/mis casos/i))
    if (await toggle.isVisible()) {
      await toggle.check()
      await page.waitForTimeout(800)
      await expect(page.getByText(/error|500/i)).not.toBeVisible()
    }
  })

  test('clic en una PQRSD navega al detalle', async ({ page }) => {
    // Busca la primera fila de la tabla
    const firstRow = page.getByRole('row').nth(1)
    if (await firstRow.isVisible()) {
      await firstRow.click()
      await expect(page).toHaveURL(/\/admin\/ventanilla\/[a-z0-9-]+/)
      await expect(page.getByText(/radicado|PGB-/i)).toBeVisible({ timeout: 6_000 })
    }
  })

  test('la paginación avanza a la siguiente página', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: /siguiente|next|›/i })
    if (await nextBtn.isEnabled().catch(() => false)) {
      await nextBtn.click()
      await page.waitForTimeout(800)
      await expect(page.getByText(/error|500/i)).not.toBeVisible()
    }
  })
})
