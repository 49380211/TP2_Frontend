 import { test, expect } from '@playwright/test';

test('un usuario nuevo se registra, agrega una película y la ve en su catálogo', async ({ page }) => {
  const timestamp = Date.now();
  const email = `e2e-test-${timestamp}@cinevault-test.com`;
  const password = 'PasswordSegura123';
  const tituloPelicula = `Película de prueba ${timestamp}`;

  // 1. Registro — el usuario nuevo queda logueado automáticamente
  await page.goto('/register');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#confirm', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/catalog/);

  // 2. Agregar una película
  await page.click('text=+ Agregar película');
  await expect(page).toHaveURL(/\/add/);
  await page.fill('#titulo', tituloPelicula);
  await page.click('button[type="submit"]');
  
  // Un solo click, luego esperá la URL
await page.click('button[type="submit"]');
await expect(page).toHaveURL(/\/catalog/);

  // 3. Verificar que vuelve al catálogo y la película aparece
  await expect(page).toHaveURL(/\/catalog/);
  await expect(page.locator('.movie-title', { hasText: tituloPelicula })).toBeVisible();
});

test('un usuario no logueado es redirigido al login al intentar ver el catálogo', async ({ page }) => {
  await page.goto('/catalog');
  await expect(page).toHaveURL(/\/login/);
});