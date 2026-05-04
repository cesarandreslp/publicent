/**
 * 01-portal-ciudadano.spec.ts
 *
 * Flujo completo del ciudadano:
 *   - Navegar al portal de atención
 *   - Radicar una PQRSD (todos los campos)
 *   - Recibir número de radicado
 *   - Consultar el estado de la radicación
 *   - Radicar de forma anónima
 *   - Validaciones de formulario
 */

import { test, expect } from '@playwright/test'
import { randomEmail, randomPhone, parseRadicado } from './helpers'

const BASE_PQRSD = '/atencion-ciudadano/pqrsd'

// ─── Radicación estándar ──────────────────────────────────────────────────────

test.describe('Portal ciudadano — Radicación de PQRSD', () => {
  test('carga la página de radicación correctamente', async ({ page }) => {
    await page.goto(BASE_PQRSD)
    await expect(page).toHaveTitle(/PQRSD|Petición|Atención/i)
    await expect(page.getByRole('heading', { name: /radicar|petición|pqrsd/i })).toBeVisible()
  })

  test('muestra todos los tipos de PQRSD disponibles', async ({ page }) => {
    await page.goto(BASE_PQRSD)
    const tipos = ['Petición', 'Queja', 'Reclamo', 'Solicitud', 'Denuncia']
    for (const tipo of tipos) {
      await expect(page.getByText(tipo, { exact: false })).toBeVisible()
    }
  })

  test('muestra error de validación si se envía el formulario vacío', async ({ page }) => {
    await page.goto(BASE_PQRSD)
    // Intenta enviar sin completar campos requeridos
    const submitBtn = page.getByRole('button', { name: /radicar|enviar/i })
    await submitBtn.click()
    // Debe haber al menos un mensaje de error de validación HTML5
    const invalid = page.locator(':invalid')
    await expect(invalid.first()).toBeVisible()
  })

  test('radica una Petición correctamente y muestra número de radicado', async ({ page }) => {
    await page.goto(BASE_PQRSD)

    // Seleccionar tipo
    await page.getByLabel(/tipo/i).selectOption({ label: 'Petición' })

    // Datos personales
    await page.getByLabel(/nombre/i).fill('Juan Ciudadano Test')
    await page.getByLabel(/documento|identificación|cédula/i).fill('1234567890')
    await page.getByLabel(/correo|email/i).fill(randomEmail())
    await page.getByLabel(/teléfono|celular/i).fill(randomPhone())

    // Descripción
    await page.getByLabel(/asunto|descripción|motivo/i).fill(
      'Solicito información sobre los procesos disciplinarios activos en la vigencia 2026.'
    )

    // Enviar
    await page.getByRole('button', { name: /radicar|enviar/i }).click()

    // Debe aparecer el número de radicado
    await expect(page.getByText(/PGB-\d{4}-\d{5}/)).toBeVisible({ timeout: 15_000 })
  })

  test('radica una Denuncia anónima correctamente', async ({ page }) => {
    await page.goto(BASE_PQRSD)

    await page.getByLabel(/tipo/i).selectOption({ label: 'Denuncia' })

    // Marcar como anónimo
    const anonCheck = page.getByLabel(/anónimo|anonymous/i)
    await anonCheck.check()

    await page.getByLabel(/asunto|descripción|motivo/i).fill(
      'Denuncia anónima sobre posible conducta irregular en la entidad.'
    )

    await page.getByRole('button', { name: /radicar|enviar/i }).click()

    await expect(page.getByText(/PGB-\d{4}-\d{5}/)).toBeVisible({ timeout: 15_000 })
  })

  test('el campo de descripción requiere mínimo de caracteres', async ({ page }) => {
    await page.goto(BASE_PQRSD)
    await page.getByLabel(/tipo/i).selectOption({ label: 'Petición' })
    await page.getByLabel(/nombre/i).fill('Test Usuario')
    await page.getByLabel(/documento/i).fill('9999999')
    await page.getByLabel(/asunto|descripción/i).fill('Corto')
    await page.getByRole('button', { name: /radicar|enviar/i }).click()
    // Espera mensaje de validación
    await expect(page.locator(':invalid, [data-error]').first()).toBeVisible({ timeout: 5_000 })
  })
})

// ─── Consulta de radicación ───────────────────────────────────────────────────

test.describe('Portal ciudadano — Consulta de estado', () => {
  test('carga la página de consulta correctamente', async ({ page }) => {
    await page.goto('/atencion-ciudadano/pqrsd/consulta')
    await expect(page.getByRole('heading', { name: /consultar|estado|seguimiento/i })).toBeVisible()
  })

  test('muestra error cuando el radicado no existe', async ({ page }) => {
    await page.goto('/atencion-ciudadano/pqrsd/consulta')
    await page.getByLabel(/radicado|número/i).fill('PGB-1900-00001')
    await page.getByRole('button', { name: /buscar|consultar/i }).click()
    await expect(page.getByText(/no encontrado|no existe|sin resultados/i)).toBeVisible({ timeout: 8_000 })
  })

  test('acepta búsqueda por número de documento', async ({ page }) => {
    await page.goto('/atencion-ciudadano/pqrsd/consulta')
    const docInput = page.getByLabel(/documento|identificación/i)
    if (await docInput.isVisible()) {
      await docInput.fill('1234567890')
      await page.getByRole('button', { name: /buscar/i }).click()
      // Solo verificamos que no hay error de formulario
      await expect(page.locator(':invalid').first()).not.toBeVisible()
    }
  })
})
