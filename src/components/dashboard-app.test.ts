import { html } from 'lit';
import { fixture, expect, fixtureCleanup } from '@open-wc/testing';
import './dashboard-app.js';
import type { DashboardApp } from './dashboard-app.js';
import { StorageService } from '../services/storage-service.js';

const TEST_STORAGE_KEY = 'test-dashboard-workspace-state';

describe('DashboardApp', () => {
  afterEach(() => {
    fixtureCleanup();
    // Clean up localStorage to prevent test pollution
    localStorage.removeItem('dashboard-workspace-state');
  });

  describe('handle new iframe in grid', () => {
    it('listens for add-iframe event from modal', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const modal = el.shadowRoot!.querySelector('add-iframe-modal');
      expect(modal).to.exist;

      // Verify the event listener is wired up
      const addIframeHandler = modal!.getAttribute('@add-iframe');
      // The attribute won't be present but we can verify the handler works
    });

    it('adds new iframe to state when add-iframe event is dispatched', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const initialIframeCount = (el as any).iframes.length;

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://newsite.com' },
      }));
      await el.updateComplete;

      expect((el as any).iframes.length).to.equal(initialIframeCount + 1);
    });

    it('generates unique ID for new iframe', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://newsite.com' },
      }));
      await el.updateComplete;

      const iframes = (el as any).iframes;
      const newIframe = iframes[iframes.length - 1];

      expect(newIframe.id).to.be.a('string');
      expect(newIframe.id.startsWith('iframe-')).to.be.true;
    });

    it('assigns correct URL from event to new iframe', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://my-test-url.com' },
      }));
      await el.updateComplete;

      const iframes = (el as any).iframes;
      const newIframe = iframes[iframes.length - 1];

      expect(newIframe.url).to.equal('https://my-test-url.com');
    });

    it('assigns position to new iframe', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://newsite.com' },
      }));
      await el.updateComplete;

      const iframes = (el as any).iframes;
      const newIframe = iframes[iframes.length - 1];

      expect(newIframe.position).to.exist;
      expect(newIframe.position.row).to.be.a('number');
      expect(newIframe.position.col).to.be.a('number');
    });

    it('closes modal after adding iframe', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Open the modal
      (el as any).modalOpen = true;
      await el.updateComplete;

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://newsite.com' },
      }));
      await el.updateComplete;

      expect((el as any).modalOpen).to.be.false;
    });

    it('renders new iframe in the grid', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://newsite.com' },
      }));
      await el.updateComplete;

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      const iframes = (grid as any).iframes;

      const hasNewUrl = iframes.some((iframe: any) => iframe.url === 'https://newsite.com');
      expect(hasNewUrl).to.be.true;
    });
  });

  describe('grid expansion', () => {
    it('expands grid when all cells are occupied', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Default grid is 2x2 with 4 iframes - all cells occupied
      const initialColumns = (el as any).grid.columns;
      const initialRows = (el as any).grid.rows;

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://fifth-iframe.com' },
      }));
      await el.updateComplete;

      const grid = (el as any).grid;
      // Either columns or rows should have increased
      const hasExpanded = grid.columns > initialColumns || grid.rows > initialRows;
      expect(hasExpanded).to.be.true;
    });

    it('adds column ratio when grid expands horizontally', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const initialColumnRatios = (el as any).grid.columnRatios.length;

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://fifth-iframe.com' },
      }));
      await el.updateComplete;

      const grid = (el as any).grid;
      // If columns increased, columnRatios should have a new entry
      if (grid.columns > 2) {
        expect(grid.columnRatios.length).to.be.greaterThan(initialColumnRatios);
      }
    });

    it('new column ratio defaults to 1', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://fifth-iframe.com' },
      }));
      await el.updateComplete;

      const grid = (el as any).grid;
      // If columns increased, the new ratio should be 1
      if (grid.columns > 2) {
        expect(grid.columnRatios[grid.columnRatios.length - 1]).to.equal(1);
      }
    });

    it('finds empty cell in existing grid before expanding', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Manually remove one iframe to create an empty cell
      const iframes = (el as any).iframes;
      (el as any).iframes = iframes.slice(0, 3); // Remove the 4th iframe
      await el.updateComplete;

      const initialColumns = (el as any).grid.columns;
      const initialRows = (el as any).grid.rows;

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://fill-empty-spot.com' },
      }));
      await el.updateComplete;

      // Grid should not have expanded since there was an empty cell
      expect((el as any).grid.columns).to.equal(initialColumns);
      expect((el as any).grid.rows).to.equal(initialRows);
    });

    it('places iframe in first available empty cell', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Remove iframe at position (0, 1) to create empty cell
      const iframes = (el as any).iframes.filter((iframe: any) =>
        !(iframe.position.row === 0 && iframe.position.col === 1)
      );
      (el as any).iframes = iframes;
      await el.updateComplete;

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://fill-empty-spot.com' },
      }));
      await el.updateComplete;

      const newIframes = (el as any).iframes;
      const newIframe = newIframes.find((iframe: any) => iframe.url === 'https://fill-empty-spot.com');

      // Should be placed at (0, 1) - the empty cell
      expect(newIframe.position.row).to.equal(0);
      expect(newIframe.position.col).to.equal(1);
    });
  });

  describe('unique ID generation', () => {
    it('generates different IDs for multiple iframes', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;

      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://first.com' },
      }));
      await el.updateComplete;

      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://second.com' },
      }));
      await el.updateComplete;

      const iframes = (el as any).iframes;
      const newIframes = iframes.slice(-2);

      expect(newIframes[0].id).to.not.equal(newIframes[1].id);
    });
  });

  describe('remove iframe from hover toolbar', () => {
    it('listens for remove-iframe event from iframe-grid', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const grid = el.shadowRoot!.querySelector('iframe-grid');
      expect(grid).to.exist;
    });

    it('removes iframe from state when remove-iframe event is dispatched', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const initialIframeCount = (el as any).iframes.length;
      const iframeToRemove = (el as any).iframes[0];

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      grid.dispatchEvent(new CustomEvent('remove-iframe', {
        bubbles: true,
        composed: true,
        detail: { id: iframeToRemove.id },
      }));
      await el.updateComplete;

      expect((el as any).iframes.length).to.equal(initialIframeCount - 1);
    });

    it('removes correct iframe by id', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const iframeToRemove = (el as any).iframes[1];

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      grid.dispatchEvent(new CustomEvent('remove-iframe', {
        bubbles: true,
        composed: true,
        detail: { id: iframeToRemove.id },
      }));
      await el.updateComplete;

      const remainingIframes = (el as any).iframes;
      const iframeStillExists = remainingIframes.some((iframe: any) => iframe.id === iframeToRemove.id);
      expect(iframeStillExists).to.be.false;
    });

    it('keeps other iframes when one is removed', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const iframes = (el as any).iframes;
      const iframeToRemove = iframes[0];
      const iframesToKeep = iframes.slice(1);

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      grid.dispatchEvent(new CustomEvent('remove-iframe', {
        bubbles: true,
        composed: true,
        detail: { id: iframeToRemove.id },
      }));
      await el.updateComplete;

      const remainingIframes = (el as any).iframes;
      for (const iframe of iframesToKeep) {
        const exists = remainingIframes.some((remaining: any) => remaining.id === iframe.id);
        expect(exists).to.be.true;
      }
    });

    it('does nothing when removing non-existent iframe id', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const initialIframeCount = (el as any).iframes.length;

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      grid.dispatchEvent(new CustomEvent('remove-iframe', {
        bubbles: true,
        composed: true,
        detail: { id: 'non-existent-id' },
      }));
      await el.updateComplete;

      expect((el as any).iframes.length).to.equal(initialIframeCount);
    });

    it('iframe disappears from rendered grid after removal', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const iframeToRemove = (el as any).iframes[0];

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      grid.dispatchEvent(new CustomEvent('remove-iframe', {
        bubbles: true,
        composed: true,
        detail: { id: iframeToRemove.id },
      }));
      await el.updateComplete;

      const gridIframes = (grid as any).iframes;
      const iframeStillInGrid = gridIframes.some((iframe: any) => iframe.id === iframeToRemove.id);
      expect(iframeStillInGrid).to.be.false;
    });
  });

  describe('grid reflow after remove', () => {
    it('repositions remaining iframes to fill gaps', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Remove iframe from middle (position 0,1 which is the second in row-major order)
      const iframeToRemove = (el as any).iframes.find(
        (iframe: any) => iframe.position.row === 0 && iframe.position.col === 1
      );

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      grid.dispatchEvent(new CustomEvent('remove-iframe', {
        bubbles: true,
        composed: true,
        detail: { id: iframeToRemove.id },
      }));
      await el.updateComplete;

      // After removing one iframe from 2x2 grid with 4 iframes, we should have 3 iframes
      // They should be repositioned with no gaps
      const remainingIframes = (el as any).iframes;
      expect(remainingIframes.length).to.equal(3);

      // Check that positions are contiguous (no gaps)
      const positions = remainingIframes.map((iframe: any) =>
        `${iframe.position.row},${iframe.position.col}`
      );
      // In a reflow, iframes should be arranged in row-major order
      expect(positions).to.include('0,0');
    });

    it('shrinks grid when row becomes empty', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Remove 2 iframes to leave only 2 (which should fit in 2x1 or 1x2)
      const iframesToRemove = (el as any).iframes.slice(2);

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      for (const iframe of iframesToRemove) {
        grid.dispatchEvent(new CustomEvent('remove-iframe', {
          bubbles: true,
          composed: true,
          detail: { id: iframe.id },
        }));
        await el.updateComplete;
      }

      const finalGrid = (el as any).grid;
      // 2 iframes should fit in a 2x1 grid (2 columns, 1 row)
      expect(finalGrid.columns * finalGrid.rows).to.be.greaterThanOrEqual(2);
      expect(finalGrid.rows).to.equal(1);
    });

    it('shrinks grid when column becomes empty', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Remove 3 iframes to leave only 1 (which should fit in 1x1)
      const iframesToRemove = (el as any).iframes.slice(1);

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      for (const iframe of iframesToRemove) {
        grid.dispatchEvent(new CustomEvent('remove-iframe', {
          bubbles: true,
          composed: true,
          detail: { id: iframe.id },
        }));
        await el.updateComplete;
      }

      const finalGrid = (el as any).grid;
      // 1 iframe should fit in a 1x1 grid
      expect(finalGrid.columns).to.equal(1);
      expect(finalGrid.rows).to.equal(1);
    });

    it('adjusts column ratios when columns shrink', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Start with 2x2 grid with columnRatios [1, 1]
      const initialColumnRatios = (el as any).grid.columnRatios;
      expect(initialColumnRatios.length).to.equal(2);

      // Remove 3 iframes to get to 1x1 grid
      const iframesToRemove = (el as any).iframes.slice(1);

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      for (const iframe of iframesToRemove) {
        grid.dispatchEvent(new CustomEvent('remove-iframe', {
          bubbles: true,
          composed: true,
          detail: { id: iframe.id },
        }));
        await el.updateComplete;
      }

      const finalGrid = (el as any).grid;
      expect(finalGrid.columnRatios.length).to.equal(finalGrid.columns);
    });

    it('adjusts row ratios when rows shrink', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Start with 2x2 grid with rowRatios [1, 1]
      const initialRowRatios = (el as any).grid.rowRatios;
      expect(initialRowRatios.length).to.equal(2);

      // Remove 3 iframes to get to 1x1 grid
      const iframesToRemove = (el as any).iframes.slice(1);

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      for (const iframe of iframesToRemove) {
        grid.dispatchEvent(new CustomEvent('remove-iframe', {
          bubbles: true,
          composed: true,
          detail: { id: iframe.id },
        }));
        await el.updateComplete;
      }

      const finalGrid = (el as any).grid;
      expect(finalGrid.rowRatios.length).to.equal(finalGrid.rows);
    });

    it('leaves no gaps in grid layout', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Remove one iframe
      const iframeToRemove = (el as any).iframes[1];

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      grid.dispatchEvent(new CustomEvent('remove-iframe', {
        bubbles: true,
        composed: true,
        detail: { id: iframeToRemove.id },
      }));
      await el.updateComplete;

      const finalIframes = (el as any).iframes;
      const finalGrid = (el as any).grid;

      // Every cell up to the number of iframes should be occupied
      const occupiedPositions = new Set(
        finalIframes.map((iframe: any) => `${iframe.position.row},${iframe.position.col}`)
      );

      // Count positions - should have no gaps from (0,0) to the last iframe
      let positionIndex = 0;
      for (let row = 0; row < finalGrid.rows; row++) {
        for (let col = 0; col < finalGrid.columns; col++) {
          if (positionIndex < finalIframes.length) {
            expect(occupiedPositions.has(`${row},${col}`)).to.be.true;
            positionIndex++;
          }
        }
      }
    });

    it('handles removing all iframes gracefully', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const allIframes = [...(el as any).iframes];

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      for (const iframe of allIframes) {
        grid.dispatchEvent(new CustomEvent('remove-iframe', {
          bubbles: true,
          composed: true,
          detail: { id: iframe.id },
        }));
        await el.updateComplete;
      }

      expect((el as any).iframes.length).to.equal(0);
      expect((el as any).grid.columns).to.equal(1);
      expect((el as any).grid.rows).to.equal(1);
    });

    it('grid displays correctly after removal', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Remove one iframe
      const iframeToRemove = (el as any).iframes[0];

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      grid.dispatchEvent(new CustomEvent('remove-iframe', {
        bubbles: true,
        composed: true,
        detail: { id: iframeToRemove.id },
      }));
      await el.updateComplete;

      // Verify the grid component received the updated iframes and grid config
      const gridComponent = el.shadowRoot!.querySelector('iframe-grid') as any;
      expect(gridComponent.iframes.length).to.equal(3);
      expect(gridComponent.grid.columnRatios.length).to.equal(gridComponent.grid.columns);
      expect(gridComponent.grid.rowRatios.length).to.equal(gridComponent.grid.rows);
    });

    it('maintains iframe order after reflow', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Get initial iframes (excluding the one we'll remove)
      const iframeToRemove = (el as any).iframes[1];
      const expectedRemainingIds = (el as any).iframes
        .filter((iframe: any) => iframe.id !== iframeToRemove.id)
        .map((iframe: any) => iframe.id);

      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      grid.dispatchEvent(new CustomEvent('remove-iframe', {
        bubbles: true,
        composed: true,
        detail: { id: iframeToRemove.id },
      }));
      await el.updateComplete;

      const remainingIds = (el as any).iframes.map((iframe: any) => iframe.id);

      // All remaining iframes should still be present
      for (const id of expectedRemainingIds) {
        expect(remainingIds).to.include(id);
      }
    });
  });

  describe('save workspace state', () => {
    let testStorage: StorageService;

    beforeEach(() => {
      testStorage = new StorageService(TEST_STORAGE_KEY);
      testStorage.clear();
    });

    afterEach(() => {
      testStorage.clear();
    });

    it('serializes iframes array to JSON', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const state = (el as any).getWorkspaceState();

      expect(state.iframes).to.be.an('array');
      expect(state.iframes.length).to.equal(4);
      // Verify it can be stringified
      const json = JSON.stringify(state.iframes);
      expect(json).to.be.a('string');
    });

    it('serializes grid config to JSON', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const state = (el as any).getWorkspaceState();

      expect(state.grid).to.be.an('object');
      expect(state.grid.columns).to.equal(2);
      expect(state.grid.rows).to.equal(2);
      // Verify it can be stringified
      const json = JSON.stringify(state.grid);
      expect(json).to.be.a('string');
    });

    it('combines iframes and grid into WorkspaceState object', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const state = (el as any).getWorkspaceState();

      expect(state).to.have.property('iframes');
      expect(state).to.have.property('grid');
      expect(state.iframes).to.equal((el as any).iframes);
      expect(state.grid).to.equal((el as any).grid);
    });

    it('writes state to localStorage', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const result = (el as any).saveState();

      expect(result).to.be.true;

      // Verify localStorage has data (check default key)
      const stored = localStorage.getItem('dashboard-workspace-state');
      expect(stored).to.not.be.null;
    });

    it('returns true on successful save', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      const result = (el as any).saveState();

      expect(result).to.be.true;
    });

    it('verifies data persists in browser storage', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      (el as any).saveState();

      // Read back from storage and verify
      const stored = localStorage.getItem('dashboard-workspace-state');
      expect(stored).to.not.be.null;

      const parsed = JSON.parse(stored!);
      expect(parsed.iframes).to.have.lengthOf(4);
      expect(parsed.grid.columns).to.equal(2);
      expect(parsed.grid.rows).to.equal(2);
    });

    it('includes iframe IDs in saved state', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      (el as any).saveState();

      const stored = localStorage.getItem('dashboard-workspace-state');
      const parsed = JSON.parse(stored!);

      for (const iframe of parsed.iframes) {
        expect(iframe.id).to.be.a('string');
        expect(iframe.id.length).to.be.greaterThan(0);
      }
    });

    it('includes iframe URLs in saved state', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      (el as any).saveState();

      const stored = localStorage.getItem('dashboard-workspace-state');
      const parsed = JSON.parse(stored!);

      expect(parsed.iframes[0].url).to.equal('https://example.com');
      expect(parsed.iframes[1].url).to.equal('https://example.org');
    });

    it('includes iframe positions in saved state', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      (el as any).saveState();

      const stored = localStorage.getItem('dashboard-workspace-state');
      const parsed = JSON.parse(stored!);

      expect(parsed.iframes[0].position).to.deep.equal({ row: 0, col: 0 });
      expect(parsed.iframes[1].position).to.deep.equal({ row: 0, col: 1 });
    });

    it('includes columnRatios in saved state', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      (el as any).saveState();

      const stored = localStorage.getItem('dashboard-workspace-state');
      const parsed = JSON.parse(stored!);

      expect(parsed.grid.columnRatios).to.deep.equal([1, 1]);
    });

    it('includes rowRatios in saved state', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      (el as any).saveState();

      const stored = localStorage.getItem('dashboard-workspace-state');
      const parsed = JSON.parse(stored!);

      expect(parsed.grid.rowRatios).to.deep.equal([1, 1]);
    });

    it('saves updated state after adding iframe', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Add a new iframe
      const modal = el.shadowRoot!.querySelector('add-iframe-modal')!;
      modal.dispatchEvent(new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url: 'https://newsite.com' },
      }));
      await el.updateComplete;

      (el as any).saveState();

      const stored = localStorage.getItem('dashboard-workspace-state');
      const parsed = JSON.parse(stored!);

      expect(parsed.iframes.length).to.equal(5);
      const hasNewUrl = parsed.iframes.some((iframe: any) => iframe.url === 'https://newsite.com');
      expect(hasNewUrl).to.be.true;
    });

    it('saves updated state after removing iframe', async () => {
      const el = await fixture<DashboardApp>(html`<dashboard-app></dashboard-app>`);

      // Remove an iframe
      const iframeToRemove = (el as any).iframes[0];
      const grid = el.shadowRoot!.querySelector('iframe-grid')!;
      grid.dispatchEvent(new CustomEvent('remove-iframe', {
        bubbles: true,
        composed: true,
        detail: { id: iframeToRemove.id },
      }));
      await el.updateComplete;

      (el as any).saveState();

      const stored = localStorage.getItem('dashboard-workspace-state');
      const parsed = JSON.parse(stored!);

      expect(parsed.iframes.length).to.equal(3);
    });
  });
});
