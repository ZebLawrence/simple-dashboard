import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import './refresh-all-button.js';
import type { RefreshAllButton } from './refresh-all-button.js';

describe('RefreshAllButton', () => {
  it('renders a button element', async () => {
    const el = await fixture<RefreshAllButton>(html`<refresh-all-button></refresh-all-button>`);

    const button = el.shadowRoot!.querySelector('button');
    expect(button).to.exist;
  });

  it('displays a refresh icon', async () => {
    const el = await fixture<RefreshAllButton>(html`<refresh-all-button></refresh-all-button>`);

    const icon = el.shadowRoot!.querySelector('.refresh-icon');
    expect(icon).to.exist;
    expect(icon!.textContent).to.equal('↻');
  });

  it('has circular button styling', async () => {
    const el = await fixture<RefreshAllButton>(html`<refresh-all-button></refresh-all-button>`);

    const button = el.shadowRoot!.querySelector('button')!;
    const styles = getComputedStyle(button);
    expect(styles.borderRadius).to.equal('50%');
  });

  it('is positioned fixed at bottom-right, left of add button', async () => {
    const el = await fixture<RefreshAllButton>(html`<refresh-all-button></refresh-all-button>`);

    const styles = getComputedStyle(el);
    expect(styles.position).to.equal('fixed');
    expect(styles.bottom).to.equal('24px');
    expect(styles.right).to.equal('92px');
  });

  it('has accessible aria-label', async () => {
    const el = await fixture<RefreshAllButton>(html`<refresh-all-button></refresh-all-button>`);

    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.getAttribute('aria-label')).to.equal('Refresh all iframes');
  });

  it('dispatches refresh-all-click event on click', async () => {
    const el = await fixture<RefreshAllButton>(html`<refresh-all-button></refresh-all-button>`);

    let eventFired = false;
    el.addEventListener('refresh-all-click', () => {
      eventFired = true;
    });

    const button = el.shadowRoot!.querySelector('button')!;
    button.click();

    expect(eventFired).to.be.true;
  });

  it('event bubbles and is composed', async () => {
    const el = await fixture<RefreshAllButton>(html`<refresh-all-button></refresh-all-button>`);

    let eventDetails: { bubbles: boolean; composed: boolean } | null = null;
    el.addEventListener('refresh-all-click', (e: Event) => {
      eventDetails = { bubbles: e.bubbles, composed: e.composed };
    });

    const button = el.shadowRoot!.querySelector('button')!;
    button.click();

    expect(eventDetails).to.not.be.null;
    expect(eventDetails!.bubbles).to.be.true;
    expect(eventDetails!.composed).to.be.true;
  });

  it('has button type attribute', async () => {
    const el = await fixture<RefreshAllButton>(html`<refresh-all-button></refresh-all-button>`);

    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.getAttribute('type')).to.equal('button');
  });
});
