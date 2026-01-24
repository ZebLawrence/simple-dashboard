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

  describe('mousemove drag tracking', () => {
    it('adds mousemove listener to document on drag start', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      // The boundHandleMouseMove should be set
      expect((el as any).boundHandleMouseMove).to.not.be.null;
    });

    it('dispatches ratio-change event on vertical divider mousemove', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      let ratioChangeEvent: CustomEvent | null = null;
      el.addEventListener('ratio-change', ((e: CustomEvent) => {
        ratioChangeEvent = e;
      }) as EventListener);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate mousemove
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      expect(ratioChangeEvent).to.not.be.null;
      expect(ratioChangeEvent!.detail.orientation).to.equal('vertical');
      expect(ratioChangeEvent!.detail.index).to.equal(0);
      expect(ratioChangeEvent!.detail.columnRatios).to.be.an('array');

      el.clearDragState();
    });

    it('dispatches ratio-change event on horizontal divider mousemove', async () => {
      const customGrid: GridConfig = {
        columns: 1,
        rows: 2,
        columnRatios: [1],
        rowRatios: [1, 1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      let ratioChangeEvent: CustomEvent | null = null;
      el.addEventListener('ratio-change', ((e: CustomEvent) => {
        ratioChangeEvent = e;
      }) as EventListener);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="horizontal"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 100 }));

      // Simulate mousemove
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 150 }));

      expect(ratioChangeEvent).to.not.be.null;
      expect(ratioChangeEvent!.detail.orientation).to.equal('horizontal');
      expect(ratioChangeEvent!.detail.index).to.equal(0);
      expect(ratioChangeEvent!.detail.rowRatios).to.be.an('array');

      el.clearDragState();
    });

    it('adjusts adjacent column ratios based on delta for vertical drag', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      let ratioChangeEvent: CustomEvent | null = null;
      el.addEventListener('ratio-change', ((e: CustomEvent) => {
        ratioChangeEvent = e;
      }) as EventListener);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate mousemove to the right (positive delta)
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      // First column should increase, second should decrease
      const newColumnRatios = ratioChangeEvent!.detail.columnRatios;
      expect(newColumnRatios[0]).to.be.greaterThan(1);
      expect(newColumnRatios[1]).to.be.lessThan(1);

      el.clearDragState();
    });

    it('adjusts adjacent row ratios based on delta for horizontal drag', async () => {
      const customGrid: GridConfig = {
        columns: 1,
        rows: 2,
        columnRatios: [1],
        rowRatios: [1, 1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      let ratioChangeEvent: CustomEvent | null = null;
      el.addEventListener('ratio-change', ((e: CustomEvent) => {
        ratioChangeEvent = e;
      }) as EventListener);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="horizontal"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 100 }));

      // Simulate mousemove downward (positive delta)
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 150 }));

      // First row should increase, second should decrease
      const newRowRatios = ratioChangeEvent!.detail.rowRatios;
      expect(newRowRatios[0]).to.be.greaterThan(1);
      expect(newRowRatios[1]).to.be.lessThan(1);

      el.clearDragState();
    });

    it('enforces minimum ratio of 0.1 to prevent panels from disappearing', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      let ratioChangeEvent: CustomEvent | null = null;
      el.addEventListener('ratio-change', ((e: CustomEvent) => {
        ratioChangeEvent = e;
      }) as EventListener);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate extreme mousemove that would make second column negative
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10000, clientY: 50 }));

      const newColumnRatios = ratioChangeEvent!.detail.columnRatios;
      // Second column should be clamped to minimum 0.1
      expect(newColumnRatios[1]).to.be.at.least(0.1);

      el.clearDragState();
    });

    it('removes mousemove listener on clearDragState', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      expect((el as any).boundHandleMouseMove).to.not.be.null;

      el.clearDragState();

      expect((el as any).boundHandleMouseMove).to.be.null;
    });

    it('does not dispatch ratio-change when no drag is active', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      let ratioChangeEvent: CustomEvent | null = null;
      el.addEventListener('ratio-change', ((e: CustomEvent) => {
        ratioChangeEvent = e;
      }) as EventListener);

      // Call handleMouseMove directly without starting drag
      (el as any).handleMouseMove(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      expect(ratioChangeEvent).to.be.null;
    });

    it('tracks movement smoothly without jitter on multiple mousemove events', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      const events: CustomEvent[] = [];
      el.addEventListener('ratio-change', ((e: CustomEvent) => {
        events.push(e);
      }) as EventListener);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate multiple mousemove events
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 50 }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 50 }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 130, clientY: 50 }));

      // Should receive multiple events, each building on the same initial ratios
      expect(events.length).to.equal(3);

      // Values should be increasing consistently
      const ratio0_1 = events[0].detail.columnRatios[0];
      const ratio0_2 = events[1].detail.columnRatios[0];
      const ratio0_3 = events[2].detail.columnRatios[0];

      expect(ratio0_2).to.be.greaterThan(ratio0_1);
      expect(ratio0_3).to.be.greaterThan(ratio0_2);

      el.clearDragState();
    });
  });

  describe('CSS grid template update on drag', () => {
    it('updates columnRatios in grid property on vertical divider drag', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate mousemove
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      // Grid property should be updated
      expect(el.grid.columnRatios[0]).to.be.greaterThan(1);
      expect(el.grid.columnRatios[1]).to.be.lessThan(1);

      el.clearDragState();
    });

    it('updates rowRatios in grid property on horizontal divider drag', async () => {
      const customGrid: GridConfig = {
        columns: 1,
        rows: 2,
        columnRatios: [1],
        rowRatios: [1, 1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="horizontal"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 100 }));

      // Simulate mousemove
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 150 }));

      // Grid property should be updated
      expect(el.grid.rowRatios[0]).to.be.greaterThan(1);
      expect(el.grid.rowRatios[1]).to.be.lessThan(1);

      el.clearDragState();
    });

    it('updates CSS grid-template-columns in real-time during drag', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      const container = el.shadowRoot!.querySelector('.grid-container') as HTMLElement;
      const initialTemplate = container.style.gridTemplateColumns;
      expect(initialTemplate).to.equal('1fr 4px 1fr');

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate mousemove
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      // Wait for Lit to update
      await el.updateComplete;

      // CSS should be updated
      const newTemplate = container.style.gridTemplateColumns;
      expect(newTemplate).to.not.equal(initialTemplate);
      // First column should be larger than 1fr
      expect(newTemplate).to.match(/^[\d.]+fr 4px [\d.]+fr$/);

      el.clearDragState();
    });

    it('updates CSS grid-template-rows in real-time during drag', async () => {
      const customGrid: GridConfig = {
        columns: 1,
        rows: 2,
        columnRatios: [1],
        rowRatios: [1, 1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      const container = el.shadowRoot!.querySelector('.grid-container') as HTMLElement;
      const initialTemplate = container.style.gridTemplateRows;
      expect(initialTemplate).to.equal('1fr 4px 1fr');

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="horizontal"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 100 }));

      // Simulate mousemove
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 150 }));

      // Wait for Lit to update
      await el.updateComplete;

      // CSS should be updated
      const newTemplate = container.style.gridTemplateRows;
      expect(newTemplate).to.not.equal(initialTemplate);
      // First row should be larger than 1fr
      expect(newTemplate).to.match(/^[\d.]+fr 4px [\d.]+fr$/);

      el.clearDragState();
    });

    it('iframe panels resize visually during drag', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate mousemove to increase first column
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 50 }));

      // Wait for Lit to update
      await el.updateComplete;

      // Verify iframe panels exist and grid template was updated
      const panels = el.shadowRoot!.querySelectorAll('iframe-panel');
      expect(panels.length).to.equal(2);

      // Verify grid ratios were updated (first should be larger)
      expect(el.grid.columnRatios[0]).to.be.greaterThan(el.grid.columnRatios[1]);

      el.clearDragState();
    });
  });

  describe('mouseup drag end', () => {
    it('adds mouseup listener to document on drag start', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      // The boundHandleMouseUp should be set
      expect((el as any).boundHandleMouseUp).to.not.be.null;

      el.clearDragState();
    });

    it('removes mousemove listener on mouseup', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      expect((el as any).boundHandleMouseMove).to.not.be.null;

      // Simulate mouseup
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 200 }));

      expect((el as any).boundHandleMouseMove).to.be.null;
    });

    it('removes mouseup listener on mouseup', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      expect((el as any).boundHandleMouseUp).to.not.be.null;

      // Simulate mouseup
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 200 }));

      expect((el as any).boundHandleMouseUp).to.be.null;
    });

    it('clears drag state on mouseup', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      expect(el.getDragState()).to.not.be.null;

      // Simulate mouseup
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 200 }));

      expect(el.getDragState()).to.be.null;
    });

    it('removes divider dragging class on mouseup', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      expect(dividerInner.classList.contains('dragging')).to.be.true;

      // Simulate mouseup
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 200 }));

      expect(dividerInner.classList.contains('dragging')).to.be.false;
    });

    it('dispatches grid-drag-complete event on mouseup', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      let dragCompleteEvent: CustomEvent | null = null;
      el.addEventListener('grid-drag-complete', ((e: CustomEvent) => {
        dragCompleteEvent = e;
      }) as EventListener);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Move to change ratios
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      // End drag
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 50 }));

      expect(dragCompleteEvent).to.not.be.null;
      expect(dragCompleteEvent!.detail.orientation).to.equal('vertical');
      expect(dragCompleteEvent!.detail.index).to.equal(0);
      expect(dragCompleteEvent!.detail.columnRatios).to.be.an('array');
      expect(dragCompleteEvent!.detail.rowRatios).to.be.an('array');
    });

    it('finalizes ratio values in grid-drag-complete event', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      let dragCompleteEvent: CustomEvent | null = null;
      el.addEventListener('grid-drag-complete', ((e: CustomEvent) => {
        dragCompleteEvent = e;
      }) as EventListener);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Move to change ratios
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      // End drag
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 50 }));

      // The final ratios should match the current grid ratios
      expect(dragCompleteEvent!.detail.columnRatios).to.deep.equal(el.grid.columnRatios);
      expect(dragCompleteEvent!.detail.rowRatios).to.deep.equal(el.grid.rowRatios);
    });

    it('ratios persist after drag ends', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Move to change ratios
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      // Capture ratios before mouseup
      const ratiosBefore = [...el.grid.columnRatios];

      // End drag
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 50 }));

      // Ratios should persist after drag ends
      expect(el.grid.columnRatios).to.deep.equal(ratiosBefore);
    });

    it('does not dispatch grid-drag-complete when no drag is active', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      let dragCompleteEvent: CustomEvent | null = null;
      el.addEventListener('grid-drag-complete', ((e: CustomEvent) => {
        dragCompleteEvent = e;
      }) as EventListener);

      // Simulate mouseup without starting drag
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 200 }));

      expect(dragCompleteEvent).to.be.null;
    });

    it('drag ends cleanly with full cycle', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      const events: string[] = [];
      el.addEventListener('grid-drag-start', () => events.push('start'));
      el.addEventListener('ratio-change', () => events.push('change'));
      el.addEventListener('grid-drag-complete', () => events.push('complete'));

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Move
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      // End drag
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 50 }));

      // Verify event sequence
      expect(events).to.deep.equal(['start', 'change', 'complete']);

      // Verify all state is cleaned up
      expect(el.getDragState()).to.be.null;
      expect((el as any).boundHandleMouseMove).to.be.null;
      expect((el as any).boundHandleMouseUp).to.be.null;
    });
  });

  describe('edge cases for grid resizing', () => {
    it('enforces minimum panel size of 100px for columns', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate extreme drag that would make second column very small
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50000, clientY: 50 }));

      // Get the container to calculate expected minimum
      const container = el.shadowRoot!.querySelector('.grid-container') as HTMLElement;
      const rect = container.getBoundingClientRect();
      const contentWidth = rect.width - 4; // minus divider
      const totalRatios = el.grid.columnRatios.reduce((sum, r) => sum + r, 0);
      const minRatio = (100 / contentWidth) * totalRatios;

      // Second column should be at least the minimum ratio
      expect(el.grid.columnRatios[1]).to.be.at.least(minRatio * 0.99); // small tolerance for floating point

      el.clearDragState();
    });

    it('enforces minimum panel size of 100px for rows', async () => {
      const customGrid: GridConfig = {
        columns: 1,
        rows: 2,
        columnRatios: [1],
        rowRatios: [1, 1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="horizontal"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 100 }));

      // Simulate extreme drag that would make second row very small
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50000 }));

      // Get the container to calculate expected minimum
      const container = el.shadowRoot!.querySelector('.grid-container') as HTMLElement;
      const rect = container.getBoundingClientRect();
      const contentHeight = rect.height - 4; // minus divider
      const totalRatios = el.grid.rowRatios.reduce((sum, r) => sum + r, 0);
      const minRatio = (100 / contentHeight) * totalRatios;

      // Second row should be at least the minimum ratio
      expect(el.grid.rowRatios[1]).to.be.at.least(minRatio * 0.99); // small tolerance for floating point

      el.clearDragState();
    });

    it('prevents ratios from going negative when dragging left', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate extreme drag to the left that would make first column negative
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: -50000, clientY: 50 }));

      // Both ratios should be positive
      expect(el.grid.columnRatios[0]).to.be.greaterThan(0);
      expect(el.grid.columnRatios[1]).to.be.greaterThan(0);

      el.clearDragState();
    });

    it('prevents ratios from going negative when dragging up', async () => {
      const customGrid: GridConfig = {
        columns: 1,
        rows: 2,
        columnRatios: [1],
        rowRatios: [1, 1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="horizontal"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 100 }));

      // Simulate extreme drag upward that would make first row negative
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: -50000 }));

      // Both ratios should be positive
      expect(el.grid.rowRatios[0]).to.be.greaterThan(0);
      expect(el.grid.rowRatios[1]).to.be.greaterThan(0);

      el.clearDragState();
    });

    it('handles mouse leaving viewport during drag by ending drag', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      let dragCompleteEvent: CustomEvent | null = null;
      el.addEventListener('grid-drag-complete', ((e: CustomEvent) => {
        dragCompleteEvent = e;
      }) as EventListener);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Move to change ratios
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      // Capture ratios before mouseleave
      const ratiosBefore = [...el.grid.columnRatios];

      // Simulate mouse leaving viewport
      document.documentElement.dispatchEvent(new MouseEvent('mouseleave', { clientX: -10, clientY: 50 }));

      // Drag should be ended
      expect(el.getDragState()).to.be.null;
      expect(dragCompleteEvent).to.not.be.null;

      // Ratios should persist
      expect(el.grid.columnRatios).to.deep.equal(ratiosBefore);
    });

    it('removes mouseleave listener on clearDragState', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

      expect((el as any).boundHandleMouseLeave).to.not.be.null;

      el.clearDragState();

      expect((el as any).boundHandleMouseLeave).to.be.null;
    });

    it('ensures ratios always sum to the same total after drag', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      const initialSum = customGrid.columnRatios.reduce((sum, r) => sum + r, 0);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate mousemove
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      const newSum = el.grid.columnRatios.reduce((sum, r) => sum + r, 0);

      // Sum should be preserved
      expect(newSum).to.be.closeTo(initialSum, 0.001);

      el.clearDragState();
    });

    it('ensures ratios sum correctly even with extreme drag', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      const initialSum = customGrid.columnRatios.reduce((sum, r) => sum + r, 0);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate extreme mousemove
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50000, clientY: 50 }));

      const newSum = el.grid.columnRatios.reduce((sum, r) => sum + r, 0);

      // Sum should be preserved even with clamping
      expect(newSum).to.be.closeTo(initialSum, 0.001);

      el.clearDragState();
    });

    it('works correctly with various grid configurations (3 columns)', async () => {
      const customGrid: GridConfig = {
        columns: 3,
        rows: 1,
        columnRatios: [1, 2, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      const initialSum = customGrid.columnRatios.reduce((sum, r) => sum + r, 0);

      // Start drag on the first divider (between column 0 and 1)
      const dividers = el.shadowRoot!.querySelectorAll('grid-divider[orientation="vertical"]');
      const divider = dividers[0] as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate mousemove
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 50 }));

      const newSum = el.grid.columnRatios.reduce((sum, r) => sum + r, 0);

      // Sum should be preserved
      expect(newSum).to.be.closeTo(initialSum, 0.001);

      // Third column should be unchanged
      expect(el.grid.columnRatios[2]).to.equal(1);

      el.clearDragState();
    });

    it('ensures no panel can be resized to invisible (always visible)', async () => {
      const customGrid: GridConfig = {
        columns: 2,
        rows: 1,
        columnRatios: [1, 1],
        rowRatios: [1],
      };
      const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

      // Start drag
      const divider = el.shadowRoot!.querySelector('grid-divider[orientation="vertical"]') as HTMLElement;
      const dividerInner = divider.shadowRoot!.querySelector('.divider') as HTMLElement;
      dividerInner.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 50 }));

      // Simulate extreme drag in both directions
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 1000000, clientY: 50 }));

      // Both columns should have positive, non-zero ratios
      expect(el.grid.columnRatios[0]).to.be.greaterThan(0);
      expect(el.grid.columnRatios[1]).to.be.greaterThan(0);

      // Now drag the other direction
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: -1000000, clientY: 50 }));

      expect(el.grid.columnRatios[0]).to.be.greaterThan(0);
      expect(el.grid.columnRatios[1]).to.be.greaterThan(0);

      el.clearDragState();
    });

    it('does not fire grid-drag-complete on mouseleave when no drag is active', async () => {
      const el = await fixture<IframeGrid>(html`<iframe-grid></iframe-grid>`);

      let dragCompleteEvent: CustomEvent | null = null;
      el.addEventListener('grid-drag-complete', ((e: CustomEvent) => {
        dragCompleteEvent = e;
      }) as EventListener);

      // Simulate mouseleave without starting drag
      document.documentElement.dispatchEvent(new MouseEvent('mouseleave', { clientX: -10, clientY: 50 }));

      expect(dragCompleteEvent).to.be.null;
    });
  });
});
