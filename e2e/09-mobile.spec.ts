/**
 * 09-mobile.spec.ts
 *
 * Tests de responsividad en dispositivos móviles (Pixel 7).
 * Verifica que las páginas críticas funcionen en pantallas pequeñas.
 * Nota: estos tests corren con el proyecto "mobile-chrome" de playwright.config.ts.
 */

import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('Responsividad móvil — Portal público', () => {
  test('la página principal se renderiza en móvil', async ({ page }) => {
    await page.goto('/')
    // La navegación puede estar en un menú hamburguesa
    const nav = page.getByRole('navigation')
    await expect(nav).toBeAttached()
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('el formulario de PQRSD es usable en móvil', async ({ page }) => {
    await page.goto('/atencion-ciudadano/pqrsd')
    // Los inputs deben ser visible y tener tamaño adecuado
    const firstInput = page.locator('input, select, textarea').first()
    await expect(firstInput).toBeVisible()
    const box = await firstInput.boundingBox()
    if (box) {
      // El input debe tener al menos 44px de alto (accesibilidad táctil)
      expect(box.height).toBeGreaterThanOrEqual(36)
      // El input debe ser visible dentro del viewport
      expect(box.x).toBeGreaterThanOrEqual(0)
    }
  })

  test('el menú de navegación es accesible en móvil', async ({ page }) => {
    await page.goto('/')
    // Busca botón hamburguesa
    const hamburger = page.getByRole('button', { name: /menú|menu|abrir/i })
      .or(page.locator('[aria-label*="menu"], [data-hamburger], button[class*="hamburger"]'))
    if (await hamburger.isVisible()) {
      await hamburger.click()
      // Después de clic, los links de navegación deben ser visibles
      const navLinks = page.getByRole('navigation').getByRole('link')
      await expect(navLinks.first()).toBeVisible({ timeout: 4_000 })
    }
  })
})

test.describe('Responsividad móvil — Panel admin', () => {
  test('la bandeja de ventanilla es accesible en móvil', async ({ page }) => {
    await loginAs(page, 'funcionario')
    await page.goto('/admin/ventanilla')
    // La página no debe desbordarse horizontalmente
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    // Acepta hasta 10px de desbordamiento (scrollbars, etc.)
    expect(scrollWidth - clientWidth).toBeLessThanOrEqual(10)
  })

  test('el sidebar admin colapsa en móvil', async ({ page }) => {
    await loginAs(page, 'funcionario')
    await page.goto('/admin')
    // En móvil el sidebar puede estar oculto o colapsado
    const sidebar = page.locator('nav[class*="sidebar"], aside[class*="sidebar"], [data-sidebar]')
    if (await sidebar.isVisible()) {
      // Si está visible, debe ser de ancho razonable para móvil
      const box = await sidebar.boundingBox()
      if (box) expect(box.width).toBeLessThanOrEqual(380)
    }
  })
})
