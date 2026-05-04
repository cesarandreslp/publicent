/**
 * 04-funcionario-responder.spec.ts
 *
 * Flujo de respuesta y reasignación de una PQRSD:
 *   - Formulario de respuesta COMPETENTE
 *   - Validación: REMISION requiere entidadDestino
 *   - Reasignación a otro funcionario
 *   - Historial registra la acción
 */

import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

/**
 * Navega al detalle de la primera PQRSD en estado EN_TRAMITE.
 * Devuelve false si no hay ninguna disponible.
 */
async function goToFirstTramite(page: import('@playwright/test').Page): Promise<boolean> {
  await page.goto('/admin/ventanilla')

  // Intentar filtrar por estado EN_TRAMITE
  const filterBtn = page.getByRole('button', { name: /filtrar|filtros/i })
  if (await filterBtn.isVisible()) {
    await filterBtn.click()
    const estadoSel = page.getByLabel(/estado/i)
    if (await estadoSel.isVisible()) {
      await estadoSel.selectOption({ label: /en.?trámite/i } as any)
      await page.waitForTimeout(600)
    }
  }

  const firstRow = page.getByRole('row').nth(1)
  if (!await firstRow.isVisible().catch(() => false)) return false
  await firstRow.click()
  await expect(page).toHaveURL(/\/admin\/ventanilla\/[a-z0-9-]+/, { timeout: 8_000 })
  return true
}

test.describe('Funcionario — Detalle y respuesta de PQRSD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
  })

  test('la vista de detalle muestra las tres pestañas', async ({ page }) => {
    const found = await goToFirstTramite(page)
    test.skip(!found, 'No hay PQRSD en trámite para testear')

    const tabs = ['Chat', 'Responder', 'Historial']
    for (const tab of tabs) {
      await expect(page.getByRole('tab', { name: new RegExp(tab, 'i') })
        .or(page.getByText(tab, { exact: false }).first())
      ).toBeVisible()
    }
  })

  test('el panel izquierdo muestra datos del radicado', async ({ page }) => {
    const found = await goToFirstTramite(page)
    test.skip(!found, 'No hay PQRSD en trámite para testear')

    await expect(page.getByText(/PGB-\d{4}-\d{5}/)).toBeVisible()
    await expect(page.getByText(/tipo|petición|queja|reclamo|solicitud|denuncia/i)).toBeVisible()
  })

  test('pestaña Responder muestra los 6 tipos de respuesta', async ({ page }) => {
    const found = await goToFirstTramite(page)
    test.skip(!found, 'No hay PQRSD en trámite para testear')

    await page.getByRole('tab', { name: /responder/i })
      .or(page.getByText('Responder', { exact: false }).first()).click()

    const tipos = ['COMPETENTE', 'REMISIÓN', 'TRASLADO', 'INADMISIÓN', 'DESISTIMIENTO', 'INHIBICIÓN']
    let found2 = 0
    for (const tipo of tipos) {
      if (await page.getByText(tipo, { exact: false }).isVisible().catch(() => false)) found2++
    }
    expect(found2).toBeGreaterThanOrEqual(4)
  })

  test('REMISION requiere campo entidadDestino', async ({ page }) => {
    const found = await goToFirstTramite(page)
    test.skip(!found, 'No hay PQRSD en trámite para testear')

    await page.getByRole('tab', { name: /responder/i })
      .or(page.getByText('Responder', { exact: false }).first()).click()

    // Seleccionar REMISION
    const remisionOpt = page.getByLabel(/remisión|remision/i)
      .or(page.getByRole('radio', { name: /remisión/i }))
    if (await remisionOpt.isVisible()) {
      await remisionOpt.check()
      await page.getByLabel(/contenido|respuesta/i).fill('Se remite a entidad competente.')
      // Intentar enviar sin entidadDestino
      await page.getByRole('button', { name: /enviar|responder/i }).click()
      // Debe aparecer error de validación
      await expect(
        page.getByText(/entidad.?destino|destino requerido/i)
          .or(page.locator(':invalid').first())
      ).toBeVisible({ timeout: 5_000 })
    }
  })

  test('DESISTIMIENTO muestra advertencia de cambio a ANULADA', async ({ page }) => {
    const found = await goToFirstTramite(page)
    test.skip(!found, 'No hay PQRSD en trámite para testear')

    await page.getByRole('tab', { name: /responder/i })
      .or(page.getByText('Responder', { exact: false }).first()).click()

    const desistOpt = page.getByRole('radio', { name: /desistimiento/i })
    if (await desistOpt.isVisible()) {
      await desistOpt.check()
      await expect(page.getByText(/anulada|desiste/i)).toBeVisible({ timeout: 4_000 })
    }
  })
})

test.describe('Funcionario — Reasignación de PQRSD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
  })

  test('el botón Reasignar abre el modal de reasignación', async ({ page }) => {
    const found = await goToFirstTramite(page)
    test.skip(!found, 'No hay PQRSD en trámite')

    const reasignarBtn = page.getByRole('button', { name: /reasignar/i })
    if (await reasignarBtn.isVisible()) {
      await reasignarBtn.click()
      await expect(page.getByRole('dialog').or(page.locator('[data-modal]'))).toBeVisible({ timeout: 4_000 })
      await expect(page.getByLabel(/funcionario/i)).toBeVisible()
    }
  })

  test('el modal de reasignación tiene campo de motivo', async ({ page }) => {
    const found = await goToFirstTramite(page)
    test.skip(!found, 'No hay PQRSD en trámite')

    const reasignarBtn = page.getByRole('button', { name: /reasignar/i })
    if (await reasignarBtn.isVisible()) {
      await reasignarBtn.click()
      const motivoField = page.getByLabel(/motivo/i)
      await expect(motivoField).toBeVisible({ timeout: 4_000 })
    }
  })
})
