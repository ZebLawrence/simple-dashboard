import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import './grid-divider.js';
import type { GridDivider } from './grid-divider.js';

describe('GridDivider', () => {
  it('renders with default vertical orientation', async () => {
    const el = await fixture<GridDivider>(html`<grid-divider></grid-divider>`);

    expect(el.orientation).to.equal('vertical');
  });

  it('renders with horizontal orientation', async () => {
    const el = await fixture<GridDivider>(
      html`<grid-divider orientation="horizontal"></grid-divider>`
    );

    expect(el.orientation).to.equal('horizontal');
  });

  it('renders with provided index', async () => {
    const el = await fixture<GridDivider>(html`<grid-divider index=${2}></grid-divider>`);

    expect(el.index).to.equal(2);
  });

  it('contains a divider element', async () => {
    const el = await fixture<GridDivider>(html`<grid-divider></grid-divider>`);

    const divider = el.shadowRoot!.querySelector('.divider');
    expect(divider).to.exist;
  });

  it('has col-resize cursor for vertical orientation', async () => {
    const el = await fixture<GridDivider>(
      html`<grid-divider orientation="vertical"></grid-divider>`
    );

    const divider = el.shadowRoot!.querySelector('.divider')! as HTMLElement;
    const styles = window.getComputedStyle(divider);
    expect(styles.cursor).to.equal('col-resize');
  });

  it('has row-resize cursor for horizontal orientation', async () => {
    const el = await fixture<GridDivider>(
      html`<grid-divider orientation="horizontal"></grid-divider>`
    );

    const divider = el.shadowRoot!.querySelector('.divider')! as HTMLElement;
    const styles = window.getComputedStyle(divider);
    expect(styles.cursor).to.equal('row-resize');
  });

  it('dispatches divider-drag-start event on mousedown', async () => {
    const el = await fixture<GridDivider>(
      html`<grid-divider orientation="vertical" index=${1}></grid-divider>`
    );

    let eventDetail: unknown = null;
    el.addEventListener('divider-drag-start', ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    const divider = el.shadowRoot!.querySelector('.divider')! as HTMLElement;
    divider.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 200 }));

    expect(eventDetail).to.deep.include({
      orientation: 'vertical',
      index: 1,
      startX: 100,
      startY: 200,
    });
  });

  it('adds dragging class on mousedown', async () => {
    const el = await fixture<GridDivider>(html`<grid-divider></grid-divider>`);

    const divider = el.shadowRoot!.querySelector('.divider')! as HTMLElement;
    divider.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }));

    expect(divider.classList.contains('dragging')).to.be.true;
  });

  it('can set dragging state via setDragging method', async () => {
    const el = await fixture<GridDivider>(html`<grid-divider></grid-divider>`);

    const divider = el.shadowRoot!.querySelector('.divider')! as HTMLElement;

    el.setDragging(true);
    expect(divider.classList.contains('dragging')).to.be.true;

    el.setDragging(false);
    expect(divider.classList.contains('dragging')).to.be.false;
  });
});
