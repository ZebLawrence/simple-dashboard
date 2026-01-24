import { html } from 'lit';
import { fixture, expect, fixtureCleanup } from '@open-wc/testing';
import './add-iframe-modal.js';
import type { AddIframeModal } from './add-iframe-modal.js';

describe('AddIframeModal', () => {
  afterEach(() => {
    fixtureCleanup();
  });
  it('is hidden by default', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal></add-iframe-modal>`);

    const styles = getComputedStyle(el);
    expect(styles.display).to.equal('none');
  });

  it('is visible when open property is true', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const styles = getComputedStyle(el);
    expect(styles.display).to.equal('block');
  });

  it('has open property that defaults to false', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal></add-iframe-modal>`);

    expect(el.open).to.be.false;
  });

  it('reflects open property to attribute', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal></add-iframe-modal>`);

    el.open = true;
    await el.updateComplete;

    expect(el.hasAttribute('open')).to.be.true;
  });

  it('renders dark backdrop overlay', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const backdrop = el.shadowRoot!.querySelector('.backdrop');
    expect(backdrop).to.exist;

    const styles = getComputedStyle(backdrop as Element);
    expect(styles.position).to.equal('fixed');
  });

  it('renders modal dialog', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const modal = el.shadowRoot!.querySelector('.modal');
    expect(modal).to.exist;
  });

  it('centers modal on screen', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const backdrop = el.shadowRoot!.querySelector('.backdrop')!;
    const styles = getComputedStyle(backdrop);
    expect(styles.display).to.equal('flex');
    expect(styles.alignItems).to.equal('center');
    expect(styles.justifyContent).to.equal('center');
  });

  it('has dark theme styling', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const modal = el.shadowRoot!.querySelector('.modal')!;
    const styles = getComputedStyle(modal);
    expect(styles.backgroundColor).to.equal('rgb(26, 26, 46)'); // #1a1a2e
  });

  it('renders URL input field', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const input = el.shadowRoot!.querySelector('input[type="url"]');
    expect(input).to.exist;
  });

  it('renders label for URL input', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const label = el.shadowRoot!.querySelector('label');
    expect(label).to.exist;
    expect(label!.textContent).to.equal('URL');
  });

  it('label is associated with input', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const label = el.shadowRoot!.querySelector('label')!;
    const input = el.shadowRoot!.querySelector('input')!;
    expect(label.getAttribute('for')).to.equal(input.id);
  });

  it('renders Cancel button', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const cancelButton = el.shadowRoot!.querySelector('.cancel-button');
    expect(cancelButton).to.exist;
    expect(cancelButton!.textContent!.trim()).to.equal('Cancel');
  });

  it('renders Add button', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const addButton = el.shadowRoot!.querySelector('.add-button');
    expect(addButton).to.exist;
    expect(addButton!.textContent!.trim()).to.equal('Add');
  });

  it('has modal header', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const header = el.shadowRoot!.querySelector('.modal-header');
    expect(header).to.exist;
    expect(header!.textContent).to.equal('Add Iframe');
  });

  it('input has placeholder text', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const input = el.shadowRoot!.querySelector('input')!;
    expect(input.placeholder).to.equal('https://example.com');
  });

  it('buttons have type="button" attribute', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const buttons = el.shadowRoot!.querySelectorAll('button');
    buttons.forEach((button) => {
      expect(button.getAttribute('type')).to.equal('button');
    });
  });

  // Modal open/close behavior tests
  describe('open/close behavior', () => {
    it('closes when Cancel button is clicked', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);
      expect(el.open).to.be.true;

      const cancelButton = el.shadowRoot!.querySelector('.cancel-button') as HTMLButtonElement;
      cancelButton.click();
      await el.updateComplete;

      expect(el.open).to.be.false;
    });

    it('dispatches modal-close event when Cancel button is clicked', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      let eventFired = false;
      el.addEventListener('modal-close', () => {
        eventFired = true;
      });

      const cancelButton = el.shadowRoot!.querySelector('.cancel-button') as HTMLButtonElement;
      cancelButton.click();

      expect(eventFired).to.be.true;
    });

    it('closes when backdrop is clicked', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);
      expect(el.open).to.be.true;

      const backdrop = el.shadowRoot!.querySelector('.backdrop') as HTMLElement;
      backdrop.click();
      await el.updateComplete;

      expect(el.open).to.be.false;
    });

    it('dispatches modal-close event when backdrop is clicked', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      let eventFired = false;
      el.addEventListener('modal-close', () => {
        eventFired = true;
      });

      const backdrop = el.shadowRoot!.querySelector('.backdrop') as HTMLElement;
      backdrop.click();

      expect(eventFired).to.be.true;
    });

    it('does not close when modal content is clicked', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);
      expect(el.open).to.be.true;

      const modal = el.shadowRoot!.querySelector('.modal') as HTMLElement;
      modal.click();
      await el.updateComplete;

      expect(el.open).to.be.true;
      // Clean up - close the modal
      el.open = false;
      await el.updateComplete;
    });

    it('closes when Escape key is pressed', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);
      expect(el.open).to.be.true;

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await el.updateComplete;

      expect(el.open).to.be.false;
    });

    it('dispatches modal-close event when Escape key is pressed', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      let eventFired = false;
      el.addEventListener('modal-close', () => {
        eventFired = true;
      });

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(eventFired).to.be.true;
    });

    it('does not close on other key presses', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);
      expect(el.open).to.be.true;

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await el.updateComplete;

      expect(el.open).to.be.true;
      // Clean up - close the modal
      el.open = false;
      await el.updateComplete;
    });

    it('focuses URL input when modal opens', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal></add-iframe-modal>`);

      el.open = true;
      await el.updateComplete;
      // Wait a tick for the setTimeout(0) focus to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      expect(el.shadowRoot!.activeElement).to.equal(input);
      // Clean up - close the modal
      el.open = false;
      await el.updateComplete;
    });

    it('removes keydown listener when modal closes', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      // Close the modal
      el.open = false;
      await el.updateComplete;

      // Track if modal-close fires again
      let eventCount = 0;
      el.addEventListener('modal-close', () => {
        eventCount++;
      });

      // Press Escape - should not dispatch modal-close because listener was removed
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(eventCount).to.equal(0);
    });

    it('modal-close event bubbles and is composed', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      let bubbles = false;
      let composed = false;
      el.addEventListener('modal-close', (e: Event) => {
        bubbles = e.bubbles;
        composed = e.composed;
      });

      const cancelButton = el.shadowRoot!.querySelector('.cancel-button') as HTMLButtonElement;
      cancelButton.click();

      expect(bubbles).to.be.true;
      expect(composed).to.be.true;
    });
  });
});
