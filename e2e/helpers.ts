/**
 * e2e/helpers.ts — Utilidades compartidas para todos los tests E2E.
 */

import { Page, expect } from '@playwright/test'

// ─── Credenciales de prueba ────────────────────────────────────────────────────
// Estas cuentas deben existir en la base de datos de staging/test.

export const USERS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin@personeriabuga.gov.co',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'Test1234!',
  },
  funcionario: {
    email: process.env.E2E_FUNCIONARIO_EMAIL ?? 'funcionario@personeriabuga.gov.co',
    password: process.env.E2E_FUNCIONARIO_PASSWORD ?? 'Test1234!',
  },
}

// ─── Acciones reutilizables ────────────────────────────────────────────────────

/** Inicia sesión y espera la redirección al panel de administración */
export async function loginAs(page: Page, role: keyof typeof USERS) {
  const { email, password } = USERS[role]
  await page.goto('/login')
  await page.getByLabel(/correo|email/i).fill(email)
  await page.getByLabel(/contraseña|password/i).fill(password)
  await page.getByRole('button', { name: /ingresar|iniciar sesión/i }).click()
  await expect(page).toHaveURL(/\/admin/, { timeout: 10_000 })
}

/** Genera un número de teléfono colombiano aleatorio para tests */
export function randomPhone(): string {
  return `31${Math.floor(10_000_000 + Math.random() * 89_999_999)}`
}

/** Genera un correo único para cada ejecución de test */
export function randomEmail(): string {
  return `test_${Date.now()}@correo.test`
}

/**
 * Extrae un número de radicado del texto.
 * Formato real generado por la app: `<PREFIJO>-AAAAMMDD-######`
 * (prefijo de 3 letras: PET/QUE/REC/SUG/DEN/FEL/CON/PQR — ver
 * `generarRadicado` en src/app/api/pqrsd/route.ts).
 */
export function parseRadicado(text: string): string | null {
  const match = text.match(/[A-Z]{3}-\d{8}-\d{6}/)
  return match ? match[0] : null
}

/** Espera a que el toast de éxito aparezca y desaparezca */
export async function waitForSuccessToast(page: Page, text?: string | RegExp) {
  const toast = page.locator('[role="alert"], .toast, [data-toast]').filter({
    hasText: text ?? /.+/,
  }).first()
  await expect(toast).toBeVisible({ timeout: 8_000 })
}
