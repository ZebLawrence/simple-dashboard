import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import './test-element.js';
import type { TestElement } from './test-element.js';

describe('TestElement', () => {
  it('renders with default values', async () => {
    const el = await fixture<TestElement>(html`<test-element></test-element>`);

    expect(el.name).to.equal('World');
    expect(el.count).to.equal(0);
  });

  it('renders the name in the heading', async () => {
    const el = await fixture<TestElement>(html`<test-element name="Test"></test-element>`);

    const h1 = el.shadowRoot!.querySelector('h1');
    expect(h1).to.exist;
    expect(h1!.textContent).to.equal('Hello, Test!');
  });

  it('increments count when button is clicked', async () => {
    const el = await fixture<TestElement>(html`<test-element></test-element>`);

    const button = el.shadowRoot!.querySelector('button')!;
    expect(el.count).to.equal(0);

    button.click();
    expect(el.count).to.equal(1);

    button.click();
    expect(el.count).to.equal(2);
  });

  it('displays the count in the button', async () => {
    const el = await fixture<TestElement>(html`<test-element></test-element>`);

    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.textContent).to.include('Count: 0');

    button.click();
    await el.updateComplete;
    expect(button.textContent).to.include('Count: 1');
  });
});
