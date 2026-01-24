import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import './iframe-grid.js';
import type { IframeGrid } from './iframe-grid.js';
import type { IframeConfig, GridConfig } from '../types/index.js';

describe('IframeGrid', () => {
  it('renders with default 2x2 grid configuration', async () => {
    const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

    expect(el.grid.columns).to.equal(2);
    expect(el.grid.rows).to.equal(2);
    expect(el.grid.columnRatios).to.deep.equal([1, 1]);
    expect(el.grid.rowRatios).to.deep.equal([1, 1]);
  });

  it('renders with empty iframes array by default', async () => {
    const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

    expect(el.iframes).to.deep.equal([]);
  });

  it('contains a grid container element', async () => {
    const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

    const container = el.shadowRoot!.querySelector('.grid-container');
    expect(container).to.exist;
  });

  it('renders grid container with CSS Grid display', async () => {
    const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

    const container = el.shadowRoot!.querySelector('.grid-container')!;
    const styles = window.getComputedStyle(container);
    expect(styles.display).to.equal('grid');
  });

  it('renders correct number of iframe-panel elements for 2x2 grid', async () => {
    const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

    const panels = el.shadowRoot!.querySelectorAll('iframe-panel');
    expect(panels.length).to.equal(4);
  });

  it('renders correct number of iframe-panel elements for custom grid', async () => {
    const customGrid: GridConfig = {
      columns: 3,
      rows: 2,
      columnRatios: [1, 1, 1],
      rowRatios: [1, 1],
    };
    const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

    const panels = el.shadowRoot!.querySelectorAll('iframe-panel');
    expect(panels.length).to.equal(6);
  });

  it('passes url to iframe-panel at correct position', async () => {
    const testIframes: IframeConfig[] = [
      { id: '1', url: 'https://example.com/1', position: { row: 0, col: 0 } },
      { id: '2', url: 'https://example.com/2', position: { row: 0, col: 1 } },
    ];
    const el = await fixture<IframeGrid>(html`<iframe-grid .iframes=${testIframes}></iframe-grid>`);

    const panels = el.shadowRoot!.querySelectorAll('iframe-panel');
    expect((panels[0] as any).url).to.equal('https://example.com/1');
    expect((panels[1] as any).url).to.equal('https://example.com/2');
  });

  it('sets grid-template-columns based on columnRatios with divider tracks', async () => {
    const customGrid: GridConfig = {
      columns: 3,
      rows: 1,
      columnRatios: [1, 2, 1],
      rowRatios: [1],
    };
    const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

    const container = el.shadowRoot!.querySelector('.grid-container') as HTMLElement;
    // Divider tracks (4px) are interleaved between column ratios
    expect(container.style.gridTemplateColumns).to.equal('1fr 4px 2fr 4px 1fr');
  });

  it('sets grid-template-rows based on rowRatios with divider tracks', async () => {
    const customGrid: GridConfig = {
      columns: 1,
      rows: 3,
      columnRatios: [1],
      rowRatios: [1, 3, 1],
    };
    const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

    const container = el.shadowRoot!.querySelector('.grid-container') as HTMLElement;
    // Divider tracks (4px) are interleaved between row ratios
    expect(container.style.gridTemplateRows).to.equal('1fr 4px 3fr 4px 1fr');
  });

  it('renders empty iframe-panel for positions without iframe config', async () => {
    const testIframes: IframeConfig[] = [
      { id: '1', url: 'https://example.com/1', position: { row: 0, col: 0 } },
    ];
    const el = await fixture<IframeGrid>(html`<iframe-grid .iframes=${testIframes}></iframe-grid>`);

    const panels = el.shadowRoot!.querySelectorAll('iframe-panel');
    expect(panels.length).to.equal(4);
    expect((panels[0] as any).url).to.equal('https://example.com/1');
    expect((panels[1] as any).url).to.equal('');
  });

  it('renders vertical dividers between columns', async () => {
    const customGrid: GridConfig = {
      columns: 3,
      rows: 2,
      columnRatios: [1, 1, 1],
      rowRatios: [1, 1],
    };
    const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

    const verticalDividers = el.shadowRoot!.querySelectorAll('grid-divider[orientation="vertical"]');
    // 3 columns = 2 vertical dividers
    expect(verticalDividers.length).to.equal(2);
  });

  it('renders horizontal dividers between rows', async () => {
    const customGrid: GridConfig = {
      columns: 2,
      rows: 3,
      columnRatios: [1, 1],
      rowRatios: [1, 1, 1],
    };
    const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

    const horizontalDividers = el.shadowRoot!.querySelectorAll('grid-divider[orientation="horizontal"]');
    // 3 rows = 2 horizontal dividers
    expect(horizontalDividers.length).to.equal(2);
  });

  it('renders no dividers for 1x1 grid', async () => {
    const customGrid: GridConfig = {
      columns: 1,
      rows: 1,
      columnRatios: [1],
      rowRatios: [1],
    };
    const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

    const dividers = el.shadowRoot!.querySelectorAll('grid-divider');
    expect(dividers.length).to.equal(0);
  });

  it('sets correct index on dividers', async () => {
    const customGrid: GridConfig = {
      columns: 3,
      rows: 1,
      columnRatios: [1, 1, 1],
      rowRatios: [1],
    };
    const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

    const verticalDividers = el.shadowRoot!.querySelectorAll('grid-divider[orientation="vertical"]');
    expect((verticalDividers[0] as any).index).to.equal(0);
    expect((verticalDividers[1] as any).index).to.equal(1);
  });

  describe('drag start handling', () => {
    it('stores drag state on divider-drag-start event', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 2,
        columnRatios: [1, 2],
        rowRatios: [1, 1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      const dragState = el.getDragState();
      expect(dragState).to.not.be.null;
      expect(dragState!.active).to.be.true;
      expect(dragState!.orientation).to.equal('vertical');
      expect(dragState!.index).to.equal(0);
      expect(dragState!.startX).to.equal(100);
      expect(dragState!.startY).to.equal(200);
    });

    it('captures initial column ratios at drag start', async () => {
      const customGrid: GridConfig = {
        columns: 3,
        rows: 1,
        columnRatios: [1, 2, 3],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50 }));

      const dragState = el.getDragState();
      expect(dragState!.initialColumnRatios).to.deep.equal([1, 2, 3]);
    });

    it('captures initial row ratios at drag start', async () => {
      const customGrid: GridConfig = {
        columns: 1,
        rows: 3,
        columnRatios: [1],
        rowRatios: [2, 1, 3],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="horizontal"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50 }));

      const dragState = el.getDragState();
      expect(dragState!.initialRowRatios).to.deep.equal([2, 1, 3]);
    });

    it('dispatches grid-drag-start event to parent', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      let eventDetail: unknown = null;
      el.addEventListener('grid-drag-start', ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      expect(eventDetail).to.not.be.null;
      expect((eventDetail as any).orientation).to.equal('vertical');
      expect((eventDetail as any).index).to.equal(0);
      expect((eventDetail as any).initialColumnRatios).to.deep.equal([1, 1]);
    });

    it('clears drag state via clearDragState method', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      expect(el.getDragState()).to.not.be.null;

      el.clearDragState();

      expect(el.getDragState()).to.be.null;
    });

    it('removes divider dragging class on clearDragState', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      expect(dividerInner.classList.contains('dragging')).to.be.true;

      el.clearDragState();

      expect(dividerInner.classList.contains('dragging')).to.be.false;
    });

    it('stores independent copy of ratios (not reference)', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50 }));

      const dragState = el.getDragState();

      // Modify the original grid ratios
      el.grid = { ...el.grid, columnRatios: [3, 3] };

      // The initial ratios in dragState should remain unchanged
      expect(dragState!.initialColumnRatios).to.deep.equal([1, 1]);
    });
  });
});
