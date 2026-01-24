import { test, expect } from '@playwright/test';

test.describe('Simple Dashboard', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Simple Dashboard');
  });

  test('renders test-element component', async ({ page }) => {
    await page.goto('/');
    const testElement = page.locator('test-element');
    await expect(testElement).toBeVisible();
  });

  test('test-element displays greeting', async ({ page }) => {
    await page.goto('/');
    const testElement = page.locator('test-element');
    await expect(testElement).toContainText('Hello, Vite + Lit!');
  });
});
