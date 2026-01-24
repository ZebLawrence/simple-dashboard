import { test, expect } from '@playwright/test';

test.describe('Simple Dashboard', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Simple Dashboard');
  });

  test('renders dashboard-app component', async ({ page }) => {
    await page.goto('/');
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();
  });

  test('dashboard-app displays header', async ({ page }) => {
    await page.goto('/');
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toContainText('Simple Dashboard');
  });
});
