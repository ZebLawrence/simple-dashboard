import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import './iframe-panel.js';
import type { IframePanel } from './iframe-panel.js';

describe('IframePanel', () => {
  it('renders with default empty url', async () => {
    const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

    expect(el.url).to.equal('');
  });

  it('renders with provided url', async () => {
    const testUrl = 'https://example.com';
    const el = await fixture<IframePanel>(html`<iframe-panel url=${testUrl}></iframe-panel>`);

    expect(el.url).to.equal(testUrl);
  });

  it('contains an iframe element', async () => {
    const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

    const iframe = el.shadowRoot!.querySelector('iframe');
    expect(iframe).to.exist;
  });

  it('sets iframe src to url property', async () => {
    const testUrl = 'https://example.com/page';
    const el = await fixture<IframePanel>(html`<iframe-panel url=${testUrl}></iframe-panel>`);

    const iframe = el.shadowRoot!.querySelector('iframe')!;
    expect(iframe.src).to.equal(testUrl);
  });

  it('has sandbox attribute for security', async () => {
    const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

    const iframe = el.shadowRoot!.querySelector('iframe')!;
    expect(iframe.hasAttribute('sandbox')).to.be.true;
    expect(iframe.getAttribute('sandbox')).to.include('allow-scripts');
    expect(iframe.getAttribute('sandbox')).to.include('allow-same-origin');
  });

  it('has allow attribute for features', async () => {
    const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

    const iframe = el.shadowRoot!.querySelector('iframe')!;
    expect(iframe.hasAttribute('allow')).to.be.true;
  });

  it('fills container width and height', async () => {
    const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

    const container = el.shadowRoot!.querySelector('.iframe-container')!;
    const styles = window.getComputedStyle(container);
    expect(styles.width).to.not.equal('0px');
    expect(styles.height).to.not.equal('0px');
  });
});
