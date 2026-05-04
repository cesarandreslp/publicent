/**
 * 05-chat.spec.ts
 *
 * Flujo del chat bidireccional ciudadano-funcionario:
 *   - La pestaña Chat se carga sin errores
 *   - El área de mensajes es visible
 *   - Se puede escribir y enviar un mensaje (funcionario)
 *   - El mensaje aparece en la lista
 */

import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('Chat bidireccional', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'funcionario')
    await page.goto('/admin/ventanilla')
  })

  test('la pestaña Chat se carga sin error 500', async ({ page }) => {
    const firstRow = page.getByRole('row').nth(1)
    if (!await firstRow.isVisible().catch(() => false)) {
      test.skip(true, 'No hay PQRSD disponibles')
      return
    }
    await firstRow.click()
    await expect(page).toHaveURL(/\/admin\/ventanilla\/[a-z0-9-]+/)

    const chatTab = page.getByRole('tab', { name: /chat/i })
      .or(page.getByText('Chat', { exact: false }).first())
    await chatTab.click()

    await expect(page.getByText(/500|error interno/i)).not.toBeVisible({ timeout: 5_000 })
    // El área de chat debe estar presente
    await expect(
      page.getByRole('textbox', { name: /mensaje|escribe/i })
        .or(page.locator('textarea[placeholder*="mensaje"]'))
        .or(page.locator('[data-chat-input]'))
    ).toBeVisible({ timeout: 6_000 })
  })

  test('el funcionario puede enviar un mensaje de chat', async ({ page }) => {
    const firstRow = page.getByRole('row').nth(1)
    if (!await firstRow.isVisible().catch(() => false)) {
      test.skip(true, 'No hay PQRSD disponibles')
      return
    }
    await firstRow.click()

    const chatTab = page.getByRole('tab', { name: /chat/i })
      .or(page.getByText('Chat', { exact: false }).first())
    await chatTab.click()

    const inputMsg = page.getByRole('textbox', { name: /mensaje|escribe/i })
      .or(page.locator('textarea[placeholder*="mensaje"]'))
      .or(page.locator('[data-chat-input]'))

    if (!await inputMsg.isVisible().catch(() => false)) {
      test.skip(true, 'No se encontró el input de chat')
      return
    }

    const testMsg = `Mensaje de prueba E2E — ${Date.now()}`
    await inputMsg.fill(testMsg)
    await page.getByRole('button', { name: /enviar|send/i }).click()

    // El mensaje debe aparecer en el hilo
    await expect(page.getByText(testMsg)).toBeVisible({ timeout: 8_000 })
  })
})
