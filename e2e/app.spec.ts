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

test.describe('Grid Resizing', () => {
  // Helper function to add an iframe
  async function addIframe(page: import('@playwright/test').Page, url: string) {
    const dashboardApp = page.locator('dashboard-app');
    const addButton = dashboardApp.locator('add-iframe-button');
    await addButton.locator('button').click();

    const modal = dashboardApp.locator('add-iframe-modal');
    await expect(modal).toHaveAttribute('open', '');
    await modal.locator('#url-input').fill(url);
    await modal.locator('.add-button').click();
    await expect(modal).not.toHaveAttribute('open', '');
  }

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to start with clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('can resize grid by dragging vertical divider', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Step 1: Start with 2x2 grid of iframes (need 4 iframes)
    await addIframe(page, 'https://example.com/1');
    await addIframe(page, 'https://example.com/2');
    await addIframe(page, 'https://example.com/3');
    await addIframe(page, 'https://example.com/4');

    const iframeGrid = dashboardApp.locator('iframe-grid');
    const iframePanels = iframeGrid.locator('iframe-panel');
    await expect(iframePanels).toHaveCount(4);

    // Get initial panel widths
    const firstPanel = iframePanels.first();
    const initialFirstPanelBox = await firstPanel.boundingBox();
    expect(initialFirstPanelBox).not.toBeNull();

    // Step 2: Locate vertical divider between panels
    const verticalDivider = iframeGrid.locator('grid-divider[orientation="vertical"]').first();
    await expect(verticalDivider).toBeVisible();

    // Step 3: Drag divider to new position using dispatchEvent
    // This simulates the drag operation by directly triggering events on the shadow DOM elements
    const dragDistance = 100;

    // Get initial position and trigger drag via events in the page context
    await verticalDivider.evaluate((el, distance) => {
      const hitArea = el.shadowRoot?.querySelector('.divider-hit-area');
      if (!hitArea) throw new Error('Hit area not found');

      const rect = hitArea.getBoundingClientRect();
      const startX = rect.x + rect.width / 2;
      const startY = rect.y + rect.height / 2;

      // Dispatch mousedown on hit area
      hitArea.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: startX,
        clientY: startY,
      }));

      // Dispatch mousemove on document
      document.dispatchEvent(new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: startX + distance,
        clientY: startY,
      }));

      // Dispatch mouseup on document
      document.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        clientX: startX + distance,
        clientY: startY,
      }));
    }, dragDistance);

    // Wait a tick for the component to update
    await page.waitForTimeout(100);

    // Step 4: Verify panel widths changed
    const newFirstPanelBox = await firstPanel.boundingBox();
    expect(newFirstPanelBox).not.toBeNull();

    // The first panel should now be wider (we dragged right)
    expect(newFirstPanelBox!.width).toBeGreaterThan(initialFirstPanelBox!.width);
  });

  test('can resize grid by dragging horizontal divider', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Start with 2x2 grid of iframes
    await addIframe(page, 'https://example.com/1');
    await addIframe(page, 'https://example.com/2');
    await addIframe(page, 'https://example.com/3');
    await addIframe(page, 'https://example.com/4');

    const iframeGrid = dashboardApp.locator('iframe-grid');
    const iframePanels = iframeGrid.locator('iframe-panel');
    await expect(iframePanels).toHaveCount(4);

    // Get initial panel heights
    const firstPanel = iframePanels.first();
    const initialFirstPanelBox = await firstPanel.boundingBox();
    expect(initialFirstPanelBox).not.toBeNull();

    // Locate horizontal divider between rows
    const horizontalDivider = iframeGrid.locator('grid-divider[orientation="horizontal"]').first();
    await expect(horizontalDivider).toBeVisible();

    // Get the divider's bounding box
    const dividerBox = await horizontalDivider.boundingBox();
    expect(dividerBox).not.toBeNull();

    // Drag divider down by 50px
    const startX = dividerBox!.x + dividerBox!.width / 2;
    const startY = dividerBox!.y + dividerBox!.height / 2;
    const dragDistance = 50;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    // Move in small steps
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(startX, startY + (dragDistance * i) / 10);
    }
    await page.mouse.up();

    // Verify panel heights changed - first row should be taller
    const newFirstPanelBox = await firstPanel.boundingBox();
    expect(newFirstPanelBox).not.toBeNull();
    expect(newFirstPanelBox!.height).toBeGreaterThan(initialFirstPanelBox!.height);
  });

  test('grid ratios persist after page reload', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Step 1: Start with 2x2 grid of iframes
    await addIframe(page, 'https://example.com/1');
    await addIframe(page, 'https://example.com/2');
    await addIframe(page, 'https://example.com/3');
    await addIframe(page, 'https://example.com/4');

    const iframeGrid = dashboardApp.locator('iframe-grid');
    const iframePanels = iframeGrid.locator('iframe-panel');
    await expect(iframePanels).toHaveCount(4);

    // Get initial panel widths
    const firstPanel = iframePanels.first();
    const initialFirstPanelBox = await firstPanel.boundingBox();
    expect(initialFirstPanelBox).not.toBeNull();

    // Step 2: Locate and drag vertical divider using dispatchEvent
    const verticalDivider = iframeGrid.locator('grid-divider[orientation="vertical"]').first();
    const dragDistance = 100;

    await verticalDivider.evaluate((el, distance) => {
      const hitArea = el.shadowRoot?.querySelector('.divider-hit-area');
      if (!hitArea) throw new Error('Hit area not found');

      const rect = hitArea.getBoundingClientRect();
      const startX = rect.x + rect.width / 2;
      const startY = rect.y + rect.height / 2;

      // Dispatch mousedown on hit area
      hitArea.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: startX,
        clientY: startY,
      }));

      // Dispatch mousemove on document
      document.dispatchEvent(new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: startX + distance,
        clientY: startY,
      }));

      // Dispatch mouseup on document
      document.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        clientX: startX + distance,
        clientY: startY,
      }));
    }, dragDistance);

    await page.waitForTimeout(100);

    // Get the new panel width after resize
    const resizedFirstPanelBox = await firstPanel.boundingBox();
    expect(resizedFirstPanelBox).not.toBeNull();
    expect(resizedFirstPanelBox!.width).toBeGreaterThan(initialFirstPanelBox!.width);

    // Step 5: Verify ratios persist after reload
    await page.reload();

    // Wait for the page to load and render
    await expect(dashboardApp).toBeVisible();
    const reloadedIframeGrid = dashboardApp.locator('iframe-grid');
    const reloadedPanels = reloadedIframeGrid.locator('iframe-panel');
    await expect(reloadedPanels).toHaveCount(4);

    // Get the first panel's width after reload
    const reloadedFirstPanel = reloadedPanels.first();
    const reloadedFirstPanelBox = await reloadedFirstPanel.boundingBox();
    expect(reloadedFirstPanelBox).not.toBeNull();

    // The width after reload should match the resized width (within a small tolerance for rendering)
    const tolerance = 5; // Allow 5px tolerance for minor rendering differences
    expect(Math.abs(reloadedFirstPanelBox!.width - resizedFirstPanelBox!.width)).toBeLessThan(tolerance);
  });
});

test.describe('Persistence', () => {
  // Run persistence tests serially to avoid localStorage race conditions
  test.describe.configure({ mode: 'serial' });
  // Helper function to add an iframe
  async function addIframe(page: import('@playwright/test').Page, url: string) {
    const dashboardApp = page.locator('dashboard-app');
    const addButton = dashboardApp.locator('add-iframe-button');
    await addButton.locator('button').click();

    const modal = dashboardApp.locator('add-iframe-modal');
    await expect(modal).toHaveAttribute('open', '');
    await modal.locator('#url-input').fill(url);
    await modal.locator('.add-button').click();
    await expect(modal).not.toHaveAttribute('open', '');
  }

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to start with clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Wait for the app to fully render with empty state
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();
    // Verify we're starting with an empty grid
    const iframePanels = dashboardApp.locator('iframe-grid').locator('iframe-panel');
    await expect(iframePanels).toHaveCount(0);
  });

  test('all iframes restored after page reload', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Ensure we start with zero iframes in this specific test
    const iframeGrid = dashboardApp.locator('iframe-grid');
    const emptyState = iframeGrid.locator('.empty-state');
    await expect(emptyState).toBeVisible();

    // Step 1: Add multiple iframes with distinct URLs
    const urls = [
      'https://example.com/page1',
      'https://example.org/page2',
      'https://example.net/page3',
    ];

    for (const url of urls) {
      await addIframe(page, url);
    }

    // Verify all iframes were added by checking panels with actual URLs
    // Note: Grid may have empty cells (iframe-panel without url), so we filter by url attribute
    for (const url of urls) {
      const panel = iframeGrid.locator(`iframe-panel[url="${url}"]`);
      await expect(panel).toBeVisible();
    }

    // Step 3: Reload the page
    await page.reload();

    // Step 4: Verify all iframes restored
    await expect(dashboardApp).toBeVisible();
    const restoredGrid = dashboardApp.locator('iframe-grid');

    // Step 5 & 6: Verify URLs match original - each URL should still be present
    for (const url of urls) {
      const panel = restoredGrid.locator(`iframe-panel[url="${url}"]`);
      await expect(panel).toBeVisible();
    }
  });

  test('grid ratios restored after page reload', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Add 4 iframes to create a 2x2 grid
    await addIframe(page, 'https://example.com/1');
    await addIframe(page, 'https://example.com/2');
    await addIframe(page, 'https://example.com/3');
    await addIframe(page, 'https://example.com/4');

    const iframeGrid = dashboardApp.locator('iframe-grid');
    const iframePanels = iframeGrid.locator('iframe-panel');
    await expect(iframePanels).toHaveCount(4);

    // Get initial panel dimensions
    const firstPanel = iframePanels.first();
    const initialBox = await firstPanel.boundingBox();
    expect(initialBox).not.toBeNull();

    // Step 2: Resize grid layout - drag vertical divider
    const verticalDivider = iframeGrid.locator('grid-divider[orientation="vertical"]').first();
    const dragDistance = 80;

    await verticalDivider.evaluate((el, distance) => {
      const hitArea = el.shadowRoot?.querySelector('.divider-hit-area');
      if (!hitArea) throw new Error('Hit area not found');

      const rect = hitArea.getBoundingClientRect();
      const startX = rect.x + rect.width / 2;
      const startY = rect.y + rect.height / 2;

      hitArea.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: startX,
        clientY: startY,
      }));

      document.dispatchEvent(new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: startX + distance,
        clientY: startY,
      }));

      document.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        clientX: startX + distance,
        clientY: startY,
      }));
    }, dragDistance);

    await page.waitForTimeout(100);

    // Capture the resized dimensions
    const resizedBox = await firstPanel.boundingBox();
    expect(resizedBox).not.toBeNull();
    expect(resizedBox!.width).toBeGreaterThan(initialBox!.width);

    // Step 3: Reload the page
    await page.reload();

    // Wait for restored state
    await expect(dashboardApp).toBeVisible();
    const restoredPanels = dashboardApp.locator('iframe-grid').locator('iframe-panel');
    await expect(restoredPanels).toHaveCount(4);

    // Step 5: Verify grid ratios restored
    const restoredFirstPanel = restoredPanels.first();
    const restoredBox = await restoredFirstPanel.boundingBox();
    expect(restoredBox).not.toBeNull();

    // Width should match resized width within tolerance
    const tolerance = 5;
    expect(Math.abs(restoredBox!.width - resizedBox!.width)).toBeLessThan(tolerance);
  });

  test('complete state persists across multiple reloads', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Add iframes with distinct URLs
    const urls = [
      'https://example.com/alpha',
      'https://example.org/beta',
    ];

    for (const url of urls) {
      await addIframe(page, url);
    }

    const iframeGrid = dashboardApp.locator('iframe-grid');
    const iframePanels = iframeGrid.locator('iframe-panel');
    await expect(iframePanels).toHaveCount(2);

    // First reload
    await page.reload();
    await expect(dashboardApp).toBeVisible();
    let restoredPanels = dashboardApp.locator('iframe-grid').locator('iframe-panel');
    await expect(restoredPanels).toHaveCount(2);

    // Verify URLs after first reload
    for (let i = 0; i < urls.length; i++) {
      await expect(restoredPanels.nth(i)).toHaveAttribute('url', urls[i]);
    }

    // Second reload
    await page.reload();
    await expect(dashboardApp).toBeVisible();
    restoredPanels = dashboardApp.locator('iframe-grid').locator('iframe-panel');
    await expect(restoredPanels).toHaveCount(2);

    // Verify URLs after second reload
    for (let i = 0; i < urls.length; i++) {
      await expect(restoredPanels.nth(i)).toHaveAttribute('url', urls[i]);
    }
  });

  test('empty state persists correctly', async ({ page }) => {
    const dashboardApp = page.locator('dashboard-app');
    await expect(dashboardApp).toBeVisible();

    // Add an iframe then remove it
    await addIframe(page, 'https://example.com');

    const iframeGrid = dashboardApp.locator('iframe-grid');
    const iframePanel = iframeGrid.locator('iframe-panel');
    await expect(iframePanel).toHaveCount(1);

    // Remove the iframe
    await iframePanel.hover();
    await iframePanel.locator('.close-button').click();
    await expect(iframePanel).toHaveCount(0);

    // Reload and verify empty state persists
    await page.reload();
    await expect(dashboardApp).toBeVisible();
    const restoredPanels = dashboardApp.locator('iframe-grid').locator('iframe-panel');
    await expect(restoredPanels).toHaveCount(0);
  });
});
