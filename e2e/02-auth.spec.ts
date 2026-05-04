/**
 * 02-auth.spec.ts
 *
 * Flujos de autenticación:
 *   - Login correcto redirige al panel
 *   - Login con credenciales incorrectas muestra error
 *   - Rutas admin protegidas redirigen al login si no hay sesión
 *   - Cierre de sesión limpia la cookie y redirige
 */

import { test, expect } from '@playwright/test'
import { loginAs, USERS } from './helpers'

test.describe('Autenticación', () => {
  test('login correcto redirige al panel de administración', async ({ page }) => {
    await loginAs(page, 'admin')
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('login con contraseña incorrecta muestra mensaje de error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill(USERS.admin.email)
    await page.getByLabel(/contraseña|password/i).fill('contraseña_incorrecta_xyz')
    await page.getByRole('button', { name: /ingresar|iniciar/i }).click()
    // Debe permanecer en /login con mensaje de error
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText(/credenciales|inválido|incorrecto|error/i)).toBeVisible({ timeout: 8_000 })
  })

  test('login con email inválido muestra validación', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill('no-es-un-email')
    await page.getByLabel(/contraseña|password/i).fill('cualquiera')
    await page.getByRole('button', { name: /ingresar|iniciar/i }).click()
    await expect(page.locator(':invalid').first()).toBeVisible()
  })

  test('ruta /admin redirige al login si no hay sesión activa', async ({ page }) => {
    // Navegar sin cookies de sesión
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
  })

  test('ruta /admin/ventanilla redirige al login si no hay sesión', async ({ page }) => {
    await page.goto('/admin/ventanilla')
    await expect(page).toHaveURL(/\/login/)
  })

  test('ruta /admin/mipg redirige al login si no hay sesión', async ({ page }) => {
    await page.goto('/admin/mipg')
    await expect(page).toHaveURL(/\/login/)
  })

  test('cerrar sesión limpia la sesión y redirige al login', async ({ page }) => {
    await loginAs(page, 'admin')
    // Buscar botón de cierre de sesión
    const logoutBtn = page.getByRole('button', { name: /cerrar sesión|salir|logout/i })
      .or(page.getByRole('link', { name: /cerrar sesión|salir|logout/i }))
    await expect(logoutBtn).toBeVisible()
    await logoutBtn.click()
    await expect(page).toHaveURL(/\/login|^\/$/)
  })
})
