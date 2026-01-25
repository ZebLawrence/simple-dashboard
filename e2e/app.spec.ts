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

test.describe('Adding Iframe', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to start with clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('can add an iframe through the modal', async ({ page }) => {
    // Step 1: Navigate to application URL (already done in beforeEach)
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Step 2: Click floating add button
    const addButton = dashboardApp.locator('add-iframe-button');
    await expect(addButton).toBeVisible();

    // Click the button inside the shadow DOM
    await addButton.locator('button').click();

    // Step 3: Verify modal appears
    const modal = dashboardApp.locator('add-iframe-modal');
    await expect(modal).toHaveAttribute('open', '');

    // Verify the modal content is visible
    const modalHeader = modal.locator('.modal-header');
    await expect(modalHeader).toContainText('Add Iframe');

    // Step 4: Enter URL in input field
    const urlInput = modal.locator('#url-input');
    await expect(urlInput).toBeVisible();
    await urlInput.fill('https://example.com');

    // Step 5: Click Add button
    const addButtonInModal = modal.locator('.add-button');
    await addButtonInModal.click();

    // Step 6: Verify new iframe visible in grid
    const iframeGrid = dashboardApp.locator('iframe-grid');
    await expect(iframeGrid).toBeVisible();

    // Verify an iframe-panel was added with the correct URL
    const iframePanel = iframeGrid.locator('iframe-panel');
    await expect(iframePanel).toBeVisible();
    await expect(iframePanel).toHaveAttribute('url', 'https://example.com');

    // Verify the iframe element itself exists within the panel
    const iframe = iframePanel.locator('iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', 'https://example.com');
  });

  test('modal closes after adding iframe', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Open modal
    const addButton = dashboardApp.locator('add-iframe-button');
    await addButton.locator('button').click();

    const modal = dashboardApp.locator('add-iframe-modal');
    await expect(modal).toHaveAttribute('open', '');

    // Add an iframe
    const urlInput = modal.locator('#url-input');
    await urlInput.fill('https://example.com');
    await modal.locator('.add-button').click();

    // Verify modal is closed (no open attribute)
    await expect(modal).not.toHaveAttribute('open', '');
  });

  test('modal can be cancelled', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Open modal
    const addButton = dashboardApp.locator('add-iframe-button');
    await addButton.locator('button').click();

    const modal = dashboardApp.locator('add-iframe-modal');
    await expect(modal).toHaveAttribute('open', '');

    // Click cancel button
    await modal.locator('.cancel-button').click();

    // Verify modal is closed
    await expect(modal).not.toHaveAttribute('open', '');

    // Verify no iframe was added
    const iframeGrid = dashboardApp.locator('iframe-grid');
    const iframePanel = iframeGrid.locator('iframe-panel');
    await expect(iframePanel).toHaveCount(0);
  });

  test('shows error for invalid URL', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Open modal
    const addButton = dashboardApp.locator('add-iframe-button');
    await addButton.locator('button').click();

    const modal = dashboardApp.locator('add-iframe-modal');
    await expect(modal).toHaveAttribute('open', '');

    // Enter invalid URL
    const urlInput = modal.locator('#url-input');
    await urlInput.fill('not-a-valid-url');

    // Click Add button
    await modal.locator('.add-button').click();

    // Verify error is shown
    const errorMessage = modal.locator('.error-message.visible');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Please enter a valid URL');

    // Verify modal is still open
    await expect(modal).toHaveAttribute('open', '');

    // Verify input has error class
    await expect(urlInput).toHaveClass(/error/);
  });
});

test.describe('Removing Iframe', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to start with clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('can remove an iframe by clicking close button', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Step 1: Start with existing iframe in grid - add one first
    const addButton = dashboardApp.locator('add-iframe-button');
    await addButton.locator('button').click();

    const modal = dashboardApp.locator('add-iframe-modal');
    await expect(modal).toHaveAttribute('open', '');

    const urlInput = modal.locator('#url-input');
    await urlInput.fill('https://example.com');
    await modal.locator('.add-button').click();

    // Verify iframe was added
    const iframeGrid = dashboardApp.locator('iframe-grid');
    const iframePanel = iframeGrid.locator('iframe-panel');
    await expect(iframePanel).toBeVisible();
    await expect(iframePanel).toHaveCount(1);

    // Step 2: Hover over iframe panel to reveal toolbar
    await iframePanel.hover();

    // Step 3: Click close button in toolbar
    const closeButton = iframePanel.locator('.close-button');
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Step 4: Verify iframe removed from grid
    await expect(iframePanel).toHaveCount(0);
  });

  test('grid layout adjusts after removing iframe', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Add two iframes
    const addButton = dashboardApp.locator('add-iframe-button');
    const modal = dashboardApp.locator('add-iframe-modal');

    // Add first iframe
    await addButton.locator('button').click();
    await expect(modal).toHaveAttribute('open', '');
    await modal.locator('#url-input').fill('https://example.com');
    await modal.locator('.add-button').click();
    await expect(modal).not.toHaveAttribute('open', '');

    // Add second iframe
    await addButton.locator('button').click();
    await expect(modal).toHaveAttribute('open', '');
    await modal.locator('#url-input').fill('https://example.org');
    await modal.locator('.add-button').click();
    await expect(modal).not.toHaveAttribute('open', '');

    // Verify we have two iframes
    const iframeGrid = dashboardApp.locator('iframe-grid');
    const iframePanels = iframeGrid.locator('iframe-panel');
    await expect(iframePanels).toHaveCount(2);

    // Remove the first iframe
    const firstPanel = iframePanels.first();
    await firstPanel.hover();
    const closeButton = firstPanel.locator('.close-button');
    await closeButton.click();

    // Step 5: Verify grid layout adjusts - now only one iframe
    await expect(iframePanels).toHaveCount(1);

    // Verify the remaining iframe is the second one we added
    const remainingPanel = iframePanels.first();
    await expect(remainingPanel).toHaveAttribute('url', 'https://example.org');
  });

  test('can remove all iframes from grid', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Add an iframe
    const addButton = dashboardApp.locator('add-iframe-button');
    await addButton.locator('button').click();

    const modal = dashboardApp.locator('add-iframe-modal');
    await modal.locator('#url-input').fill('https://example.com');
    await modal.locator('.add-button').click();

    const iframeGrid = dashboardApp.locator('iframe-grid');
    const iframePanel = iframeGrid.locator('iframe-panel');
    await expect(iframePanel).toHaveCount(1);

    // Remove the iframe
    await iframePanel.hover();
    await iframePanel.locator('.close-button').click();

    // Verify grid is empty
    await expect(iframePanel).toHaveCount(0);

    // Verify we can still add a new iframe after removing all
    await addButton.locator('button').click();
    await expect(modal).toHaveAttribute('open', '');
  });
});
