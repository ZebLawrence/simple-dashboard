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
    expect(styles.backgroundColor).to.equal('rgb(28, 27, 26)'); // #1c1b1a
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
    expect(header!.textContent).to.equal('Manage Iframes');
  });

  it('renders tabs for Add URL and Import/Export', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const tabs = el.shadowRoot!.querySelectorAll('.tab');
    expect(tabs.length).to.equal(2);
    expect(tabs[0].textContent!.trim()).to.equal('Add URL');
    expect(tabs[1].textContent!.trim()).to.equal('Import / Export');
  });

  it('shows Add URL tab by default', async () => {
    const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

    const activeTab = el.shadowRoot!.querySelector('.tab.active');
    expect(activeTab).to.exist;
    expect(activeTab!.textContent!.trim()).to.equal('Add URL');
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

  // Add iframe submission tests
  describe('add iframe submission', () => {
    it('dispatches add-iframe event with valid URL when Add is clicked', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      input.value = 'https://example.com';

      let eventDetail: { url: string } | null = null;
      el.addEventListener('add-iframe', ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);

      const addButton = el.shadowRoot!.querySelector('.add-button') as HTMLButtonElement;
      addButton.click();

      expect(eventDetail).to.not.be.null;
      expect(eventDetail!.url).to.equal('https://example.com');
    });

    it('closes modal after successful add', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      input.value = 'https://example.com';

      const addButton = el.shadowRoot!.querySelector('.add-button') as HTMLButtonElement;
      addButton.click();
      await el.updateComplete;

      expect(el.open).to.be.false;
    });

    it('clears input field after successful add', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      input.value = 'https://example.com';

      const addButton = el.shadowRoot!.querySelector('.add-button') as HTMLButtonElement;
      addButton.click();
      await el.updateComplete;

      expect(input.value).to.equal('');
    });

    it('shows error state for empty URL', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const addButton = el.shadowRoot!.querySelector('.add-button') as HTMLButtonElement;
      addButton.click();
      await el.updateComplete;

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      expect(input.classList.contains('error')).to.be.true;

      const errorMessage = el.shadowRoot!.querySelector('.error-message') as HTMLElement;
      expect(errorMessage.classList.contains('visible')).to.be.true;
    });

    it('shows error state for invalid URL', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      input.value = 'not-a-valid-url';

      const addButton = el.shadowRoot!.querySelector('.add-button') as HTMLButtonElement;
      addButton.click();
      await el.updateComplete;

      expect(input.classList.contains('error')).to.be.true;
      expect(el.open).to.be.true; // Should stay open
    });

    it('does not dispatch add-iframe event for invalid URL', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      input.value = 'invalid-url';

      let eventFired = false;
      el.addEventListener('add-iframe', () => {
        eventFired = true;
      });

      const addButton = el.shadowRoot!.querySelector('.add-button') as HTMLButtonElement;
      addButton.click();

      expect(eventFired).to.be.false;
      // Clean up - close the modal
      el.open = false;
      await el.updateComplete;
    });

    it('clears error state when user types', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      // First trigger error state
      const addButton = el.shadowRoot!.querySelector('.add-button') as HTMLButtonElement;
      addButton.click();
      await el.updateComplete;

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      expect(input.classList.contains('error')).to.be.true;

      // Now type in the input
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;

      expect(input.classList.contains('error')).to.be.false;
      // Clean up - close the modal
      el.open = false;
      await el.updateComplete;
    });

    it('accepts http URLs', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      input.value = 'http://example.com';

      let eventDetail: { url: string } | null = null;
      el.addEventListener('add-iframe', ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);

      const addButton = el.shadowRoot!.querySelector('.add-button') as HTMLButtonElement;
      addButton.click();

      expect(eventDetail).to.not.be.null;
      expect(eventDetail!.url).to.equal('http://example.com');
    });

    it('rejects URLs with invalid protocols', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      input.value = 'ftp://example.com';

      let eventFired = false;
      el.addEventListener('add-iframe', () => {
        eventFired = true;
      });

      const addButton = el.shadowRoot!.querySelector('.add-button') as HTMLButtonElement;
      addButton.click();
      await el.updateComplete;

      expect(eventFired).to.be.false;
      expect(input.classList.contains('error')).to.be.true;
      // Clean up - close the modal
      el.open = false;
      await el.updateComplete;
    });

    it('add-iframe event bubbles and is composed', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      input.value = 'https://example.com';

      let bubbles = false;
      let composed = false;
      el.addEventListener('add-iframe', (e: Event) => {
        bubbles = e.bubbles;
        composed = e.composed;
      });

      const addButton = el.shadowRoot!.querySelector('.add-button') as HTMLButtonElement;
      addButton.click();

      expect(bubbles).to.be.true;
      expect(composed).to.be.true;
    });

    it('trims whitespace from URL', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const input = el.shadowRoot!.querySelector('#url-input') as HTMLInputElement;
      input.value = '  https://example.com  ';

      let eventDetail: { url: string } | null = null;
      el.addEventListener('add-iframe', ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);

      const addButton = el.shadowRoot!.querySelector('.add-button') as HTMLButtonElement;
      addButton.click();

      expect(eventDetail).to.not.be.null;
      expect(eventDetail!.url).to.equal('https://example.com');
    });
  });

  describe('import/export functionality', () => {
    it('switches to import/export tab when clicked', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const importExportTab = el.shadowRoot!.querySelectorAll('.tab')[1] as HTMLButtonElement;
      importExportTab.click();
      await el.updateComplete;

      expect(importExportTab.classList.contains('active')).to.be.true;

      // Should show export and import sections
      const sectionLabels = el.shadowRoot!.querySelectorAll('.section-label');
      expect(sectionLabels.length).to.equal(2);
      expect(sectionLabels[0].textContent).to.contain('Export');
      expect(sectionLabels[1].textContent).to.contain('Import');
    });

    it('displays current URLs in export textarea', async () => {
      const urls = ['https://example.com', 'https://example.org'];
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open .currentUrls=${urls}></add-iframe-modal>`);

      const importExportTab = el.shadowRoot!.querySelectorAll('.tab')[1] as HTMLButtonElement;
      importExportTab.click();
      await el.updateComplete;

      const exportTextarea = el.shadowRoot!.querySelector('textarea[readonly]') as HTMLTextAreaElement;
      expect(exportTextarea.value).to.equal('https://example.com\nhttps://example.org');
    });

    it('shows placeholder when no URLs to export', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open .currentUrls=${[]}></add-iframe-modal>`);

      const importExportTab = el.shadowRoot!.querySelectorAll('.tab')[1] as HTMLButtonElement;
      importExportTab.click();
      await el.updateComplete;

      const exportTextarea = el.shadowRoot!.querySelector('textarea[readonly]') as HTMLTextAreaElement;
      expect(exportTextarea.value).to.equal('');
      expect(exportTextarea.placeholder).to.equal('No iframes to export');
    });

    it('dispatches import-urls event with valid URLs', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const importExportTab = el.shadowRoot!.querySelectorAll('.tab')[1] as HTMLButtonElement;
      importExportTab.click();
      await el.updateComplete;

      const importTextarea = el.shadowRoot!.querySelector('#import-textarea') as HTMLTextAreaElement;
      importTextarea.value = 'https://example.com\nhttps://example.org';

      let eventDetail: { urls: string[] } | null = null;
      el.addEventListener('import-urls', ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);

      const importButton = el.shadowRoot!.querySelector('.import-button') as HTMLButtonElement;
      importButton.click();

      expect(eventDetail).to.not.be.null;
      expect(eventDetail!.urls).to.deep.equal(['https://example.com', 'https://example.org']);
    });

    it('filters out invalid URLs during import', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const importExportTab = el.shadowRoot!.querySelectorAll('.tab')[1] as HTMLButtonElement;
      importExportTab.click();
      await el.updateComplete;

      const importTextarea = el.shadowRoot!.querySelector('#import-textarea') as HTMLTextAreaElement;
      importTextarea.value = 'https://valid.com\ninvalid-url\nhttps://also-valid.com';

      let eventDetail: { urls: string[] } | null = null;
      el.addEventListener('import-urls', ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);

      const importButton = el.shadowRoot!.querySelector('.import-button') as HTMLButtonElement;
      importButton.click();

      expect(eventDetail).to.not.be.null;
      expect(eventDetail!.urls).to.deep.equal(['https://valid.com', 'https://also-valid.com']);
    });

    it('shows error when all URLs are invalid', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const importExportTab = el.shadowRoot!.querySelectorAll('.tab')[1] as HTMLButtonElement;
      importExportTab.click();
      await el.updateComplete;

      const importTextarea = el.shadowRoot!.querySelector('#import-textarea') as HTMLTextAreaElement;
      importTextarea.value = 'invalid-url\nalso-invalid';

      const importButton = el.shadowRoot!.querySelector('.import-button') as HTMLButtonElement;
      importButton.click();
      await el.updateComplete;

      const errorMessage = el.shadowRoot!.querySelectorAll('.error-message')[1] as HTMLElement;
      expect(errorMessage.classList.contains('visible')).to.be.true;
      expect(el.open).to.be.true; // Should stay open
    });

    it('shows error when import textarea is empty', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const importExportTab = el.shadowRoot!.querySelectorAll('.tab')[1] as HTMLButtonElement;
      importExportTab.click();
      await el.updateComplete;

      const importButton = el.shadowRoot!.querySelector('.import-button') as HTMLButtonElement;
      importButton.click();
      await el.updateComplete;

      const importTextarea = el.shadowRoot!.querySelector('#import-textarea') as HTMLTextAreaElement;
      expect(importTextarea.classList.contains('error')).to.be.true;
    });

    it('closes modal after successful import', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      const importExportTab = el.shadowRoot!.querySelectorAll('.tab')[1] as HTMLButtonElement;
      importExportTab.click();
      await el.updateComplete;

      const importTextarea = el.shadowRoot!.querySelector('#import-textarea') as HTMLTextAreaElement;
      importTextarea.value = 'https://example.com';

      const importButton = el.shadowRoot!.querySelector('.import-button') as HTMLButtonElement;
      importButton.click();
      await el.updateComplete;

      expect(el.open).to.be.false;
    });

    it('resets to Add URL tab when modal reopens', async () => {
      const el = await fixture<AddIframeModal>(html`<add-iframe-modal open></add-iframe-modal>`);

      // Switch to import/export tab
      const importExportTab = el.shadowRoot!.querySelectorAll('.tab')[1] as HTMLButtonElement;
      importExportTab.click();
      await el.updateComplete;

      // Close and reopen
      el.open = false;
      await el.updateComplete;
      el.open = true;
      await el.updateComplete;

      // Should be back on Add URL tab
      const activeTab = el.shadowRoot!.querySelector('.tab.active');
      expect(activeTab!.textContent!.trim()).to.equal('Add URL');
    });
  });
});
