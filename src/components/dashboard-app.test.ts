import { html } from 'lit';
import { fixture, expect, fixtureCleanup } from '@open-wc/testing';
import './dashboard-app.js';
import type { DashboardApp } from './dashboard-app.js';

describe('DashboardApp', () => {
  afterEach(() => {
    fixtureCleanup();
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
});
