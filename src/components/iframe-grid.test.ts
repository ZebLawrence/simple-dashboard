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

  it('sets grid-template-columns based on columnRatios', async () => {
    const customGrid: GridConfig = {
      columns: 3,
      rows: 1,
      columnRatios: [1, 2, 1],
      rowRatios: [1],
    };
    const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

    const container = el.shadowRoot!.querySelector('.grid-container') as HTMLElement;
    expect(container.style.gridTemplateColumns).to.equal('1fr 2fr 1fr');
  });

  it('sets grid-template-rows based on rowRatios', async () => {
    const customGrid: GridConfig = {
      columns: 1,
      rows: 3,
      columnRatios: [1],
      rowRatios: [1, 3, 1],
    };
    const el = await fixture<IframeGrid>(html`<iframe-grid .grid=${customGrid}></iframe-grid>`);

    const container = el.shadowRoot!.querySelector('.grid-container') as HTMLElement;
    expect(container.style.gridTemplateRows).to.equal('1fr 3fr 1fr');
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
});
