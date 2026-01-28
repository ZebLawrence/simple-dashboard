import { html } from 'lit';
import { fixture, expect, oneEvent, aTimeout } from '@open-wc/testing';
import './iframe-panel.js';
import type { IframePanel } from './iframe-panel.js';

describe('IframePanel', () => {
  it('renders with default empty url', async () => {
    const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

    expect(el.url).to.equal('');
  });

  it('renders with default empty iframeId', async () => {
    const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

    expect(el.iframeId).to.equal('');
  });

  it('renders with provided iframeId', async () => {
    const testId = 'iframe-123';
    const el = await fixture<IframePanel>(html`<iframe-panel iframe-id=${testId}></iframe-panel>`);

    expect(el.iframeId).to.equal(testId);
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

  describe('hover detection', () => {
    it('isHovered is false by default', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      expect(el.isHovered).to.be.false;
    });

    it('sets isHovered to true on toolbar trigger mouseenter', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const trigger = el.shadowRoot!.querySelector('.toolbar-trigger')!;

      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;

      expect(el.isHovered).to.be.true;
    });

    it('sets isHovered to false on toolbar mouseleave', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const trigger = el.shadowRoot!.querySelector('.toolbar-trigger')!;
      const toolbar = el.shadowRoot!.querySelector('.toolbar')!;

      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;
      toolbar.dispatchEvent(new MouseEvent('mouseleave'));
      await el.updateComplete;

      expect(el.isHovered).to.be.false;
    });

    it('renders toolbar trigger zone at top of panel', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const trigger = el.shadowRoot!.querySelector('.toolbar-trigger');
      expect(trigger).to.exist;
    });
  });

  describe('hover toolbar', () => {
    it('renders a toolbar', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const toolbar = el.shadowRoot!.querySelector('.toolbar');
      expect(toolbar).to.exist;
    });

    it('renders a close button in the toolbar', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const closeButton = el.shadowRoot!.querySelector('.close-button');
      expect(closeButton).to.exist;
    });

    it('close button has × symbol', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const closeButton = el.shadowRoot!.querySelector('.close-button')!;
      expect(closeButton.textContent).to.equal('×');
    });

    it('dispatches remove-iframe event when close button is clicked', async () => {
      const testId = 'iframe-456';
      const el = await fixture<IframePanel>(html`<iframe-panel iframe-id=${testId}></iframe-panel>`);

      const closeButton = el.shadowRoot!.querySelector('.close-button') as HTMLButtonElement;

      setTimeout(() => closeButton.click());
      const event = await oneEvent(el, 'remove-iframe');

      expect(event).to.exist;
    });

    it('remove-iframe event includes the iframe id', async () => {
      const testId = 'iframe-789';
      const el = await fixture<IframePanel>(html`<iframe-panel iframe-id=${testId}></iframe-panel>`);

      const closeButton = el.shadowRoot!.querySelector('.close-button') as HTMLButtonElement;

      setTimeout(() => closeButton.click());
      const event = await oneEvent(el, 'remove-iframe') as CustomEvent<{ id: string }>;

      expect(event.detail.id).to.equal(testId);
    });

    it('remove-iframe event bubbles and is composed', async () => {
      const testId = 'iframe-bubbles';
      const el = await fixture<IframePanel>(html`<iframe-panel iframe-id=${testId}></iframe-panel>`);

      const closeButton = el.shadowRoot!.querySelector('.close-button') as HTMLButtonElement;

      setTimeout(() => closeButton.click());
      const event = await oneEvent(el, 'remove-iframe') as CustomEvent;

      expect(event.bubbles).to.be.true;
      expect(event.composed).to.be.true;
    });

    it('toolbar is hidden by default (opacity 0)', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const toolbar = el.shadowRoot!.querySelector('.toolbar') as HTMLElement;
      const styles = window.getComputedStyle(toolbar);
      expect(styles.opacity).to.equal('0');
    });

    it('toolbar has semi-transparent dark background', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const toolbar = el.shadowRoot!.querySelector('.toolbar') as HTMLElement;
      const styles = window.getComputedStyle(toolbar);
      expect(styles.backgroundColor).to.match(/rgba?\(/);
    });

    it('toolbar spans full width at top of panel', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const toolbar = el.shadowRoot!.querySelector('.toolbar') as HTMLElement;
      const styles = window.getComputedStyle(toolbar);
      expect(styles.position).to.equal('absolute');
      expect(styles.top).to.equal('0px');
      expect(styles.left).to.equal('0px');
      expect(styles.right).to.equal('0px');
    });

    it('toolbar becomes visible when trigger zone is hovered', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const trigger = el.shadowRoot!.querySelector('.toolbar-trigger')!;

      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;

      const toolbar = el.shadowRoot!.querySelector('.toolbar')!;
      expect(toolbar.classList.contains('visible')).to.be.true;
    });

    it('toolbar hides when mouse leaves toolbar', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const trigger = el.shadowRoot!.querySelector('.toolbar-trigger')!;
      const toolbar = el.shadowRoot!.querySelector('.toolbar')!;

      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;
      toolbar.dispatchEvent(new MouseEvent('mouseleave'));
      await el.updateComplete;

      expect(toolbar.classList.contains('visible')).to.be.false;
    });
  });

  describe('toolbar action icons', () => {
    it('renders an edit button in the toolbar', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const editButton = el.shadowRoot!.querySelector('.edit-button');
      expect(editButton).to.exist;
    });

    it('edit button has pencil icon', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const editButton = el.shadowRoot!.querySelector('.edit-button')!;
      expect(editButton.textContent).to.equal('✎');
    });

    it('edit button has Edit URL title', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const editButton = el.shadowRoot!.querySelector('.edit-button')!;
      expect(editButton.getAttribute('title')).to.equal('Edit URL');
    });

    it('renders a refresh button in the toolbar', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const refreshButton = el.shadowRoot!.querySelector('.refresh-button');
      expect(refreshButton).to.exist;
    });

    it('refresh button has circular arrow icon', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const refreshButton = el.shadowRoot!.querySelector('.refresh-button')!;
      expect(refreshButton.textContent).to.equal('↻');
    });

    it('refresh button has Refresh title', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const refreshButton = el.shadowRoot!.querySelector('.refresh-button')!;
      expect(refreshButton.getAttribute('title')).to.equal('Refresh');
    });

    it('renders a fullscreen button in the toolbar', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button');
      expect(fullscreenButton).to.exist;
    });

    it('fullscreen button has expand icon', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button')!;
      expect(fullscreenButton.textContent).to.equal('⛶');
    });

    it('fullscreen button has Fullscreen title', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button')!;
      expect(fullscreenButton.getAttribute('title')).to.equal('Fullscreen');
    });

    it('all toolbar buttons have consistent toolbar-button class', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const buttons = el.shadowRoot!.querySelectorAll('.toolbar-button');
      expect(buttons.length).to.equal(4);
    });

    it('toolbar buttons are in correct order: edit, refresh, fullscreen, close', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const buttons = el.shadowRoot!.querySelectorAll('.toolbar-button');
      expect(buttons[0].classList.contains('edit-button')).to.be.true;
      expect(buttons[1].classList.contains('refresh-button')).to.be.true;
      expect(buttons[2].classList.contains('fullscreen-button')).to.be.true;
      expect(buttons[3].classList.contains('close-button')).to.be.true;
    });

    it('close button still has × symbol after adding other buttons', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const closeButton = el.shadowRoot!.querySelector('.close-button')!;
      expect(closeButton.textContent).to.equal('×');
    });
  });

  describe('edit URL functionality', () => {
    it('isEditingUrl is false by default', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      expect(el.isEditingUrl).to.be.false;
    });

    it('clicking edit button shows URL edit overlay', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;

      editButton.click();
      await el.updateComplete;

      const overlay = el.shadowRoot!.querySelector('.url-edit-overlay');
      expect(overlay).to.exist;
    });

    it('sets isEditingUrl to true when edit button is clicked', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;

      editButton.click();
      await el.updateComplete;

      expect(el.isEditingUrl).to.be.true;
    });

    it('URL input is pre-filled with current URL', async () => {
      const testUrl = 'https://example.com/page';
      const el = await fixture<IframePanel>(html`<iframe-panel url=${testUrl}></iframe-panel>`);
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;

      editButton.click();
      await el.updateComplete;

      const input = el.shadowRoot!.querySelector('.url-edit-input') as HTMLInputElement;
      expect(input.value).to.equal(testUrl);
    });

    it('pressing Enter submits the new URL', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;

      editButton.click();
      await el.updateComplete;

      const input = el.shadowRoot!.querySelector('.url-edit-input') as HTMLInputElement;
      input.value = 'https://newurl.com';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await el.updateComplete;

      expect(el.url).to.equal('https://newurl.com');
      expect(el.isEditingUrl).to.be.false;
    });

    it('pressing Escape cancels the edit', async () => {
      const originalUrl = 'https://example.com';
      const el = await fixture<IframePanel>(html`<iframe-panel url=${originalUrl}></iframe-panel>`);
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;

      editButton.click();
      await el.updateComplete;

      const input = el.shadowRoot!.querySelector('.url-edit-input') as HTMLInputElement;
      input.value = 'https://newurl.com';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await el.updateComplete;

      expect(el.url).to.equal(originalUrl);
      expect(el.isEditingUrl).to.be.false;
    });

    it('clicking outside the edit container cancels the edit', async () => {
      const originalUrl = 'https://example.com';
      const el = await fixture<IframePanel>(html`<iframe-panel url=${originalUrl}></iframe-panel>`);
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;

      editButton.click();
      await el.updateComplete;

      const overlay = el.shadowRoot!.querySelector('.url-edit-overlay') as HTMLElement;
      overlay.click();
      await el.updateComplete;

      expect(el.url).to.equal(originalUrl);
      expect(el.isEditingUrl).to.be.false;
    });

    it('clicking inside the edit container does not cancel the edit', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;

      editButton.click();
      await el.updateComplete;

      const container = el.shadowRoot!.querySelector('.url-edit-container') as HTMLElement;
      container.click();
      await el.updateComplete;

      expect(el.isEditingUrl).to.be.true;
    });

    it('iframe src updates when URL is submitted', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;

      editButton.click();
      await el.updateComplete;

      const input = el.shadowRoot!.querySelector('.url-edit-input') as HTMLInputElement;
      input.value = 'https://newurl.com';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await el.updateComplete;

      const iframe = el.shadowRoot!.querySelector('iframe')!;
      expect(iframe.src).to.equal('https://newurl.com/');
    });

    it('dispatches url-changed event when URL is submitted', async () => {
      const testId = 'iframe-url-change';
      const el = await fixture<IframePanel>(html`<iframe-panel iframe-id=${testId} url="https://example.com"></iframe-panel>`);
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;

      editButton.click();
      await el.updateComplete;

      const input = el.shadowRoot!.querySelector('.url-edit-input') as HTMLInputElement;
      input.value = 'https://newurl.com';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;

      let eventFired = false;
      let eventId = '';
      let eventUrl = '';
      el.addEventListener('url-changed', ((e: CustomEvent<{ id: string; url: string }>) => {
        eventFired = true;
        eventId = e.detail.id;
        eventUrl = e.detail.url;
      }) as EventListener);

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await el.updateComplete;

      expect(eventFired).to.be.true;
      expect(eventId).to.equal(testId);
      expect(eventUrl).to.equal('https://newurl.com');
    });

    it('url-changed event bubbles and is composed', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;

      editButton.click();
      await el.updateComplete;

      const input = el.shadowRoot!.querySelector('.url-edit-input') as HTMLInputElement;
      input.value = 'https://newurl.com';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;

      let eventBubbles = false;
      let eventComposed = false;
      el.addEventListener('url-changed', ((e: CustomEvent) => {
        eventBubbles = e.bubbles;
        eventComposed = e.composed;
      }) as EventListener);

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await el.updateComplete;

      expect(eventBubbles).to.be.true;
      expect(eventComposed).to.be.true;
    });

    it('overlay is not rendered when not editing', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);

      const overlay = el.shadowRoot!.querySelector('.url-edit-overlay');
      expect(overlay).to.be.null;
    });
  });

  describe('refresh functionality', () => {
    it('isRefreshing is false by default', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      expect(el.isRefreshing).to.be.false;
    });

    it('clicking refresh button sets isRefreshing to true', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const refreshButton = el.shadowRoot!.querySelector('.refresh-button') as HTMLButtonElement;

      refreshButton.click();
      await el.updateComplete;

      expect(el.isRefreshing).to.be.true;
    });

    it('clicking refresh button updates iframe src', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const iframe = el.shadowRoot!.querySelector('iframe')!;
      const originalSrc = iframe.src;

      const refreshButton = el.shadowRoot!.querySelector('.refresh-button') as HTMLButtonElement;
      refreshButton.click();
      await el.updateComplete;

      expect(iframe.src).to.not.equal(originalSrc);
      expect(iframe.src).to.include('_refresh=');
    });

    it('shows loading indicator when refreshing', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const refreshButton = el.shadowRoot!.querySelector('.refresh-button') as HTMLButtonElement;

      refreshButton.click();
      await el.updateComplete;

      const loadingIndicator = el.shadowRoot!.querySelector('.loading-indicator');
      expect(loadingIndicator).to.exist;
    });

    it('loading indicator contains spinner', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const refreshButton = el.shadowRoot!.querySelector('.refresh-button') as HTMLButtonElement;

      refreshButton.click();
      await el.updateComplete;

      const spinner = el.shadowRoot!.querySelector('.loading-spinner');
      expect(spinner).to.exist;
    });

    it('loading indicator contains "Refreshing..." text', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const refreshButton = el.shadowRoot!.querySelector('.refresh-button') as HTMLButtonElement;

      refreshButton.click();
      await el.updateComplete;

      const loadingText = el.shadowRoot!.querySelector('.loading-text');
      expect(loadingText).to.exist;
      expect(loadingText!.textContent).to.equal('Refreshing...');
    });

    it('loading indicator is hidden when not refreshing', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);

      const loadingIndicator = el.shadowRoot!.querySelector('.loading-indicator');
      expect(loadingIndicator).to.be.null;
    });

    it('isRefreshing is set to false when iframe loads', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const refreshButton = el.shadowRoot!.querySelector('.refresh-button') as HTMLButtonElement;

      refreshButton.click();
      await el.updateComplete;
      expect(el.isRefreshing).to.be.true;

      const iframe = el.shadowRoot!.querySelector('iframe')!;
      iframe.dispatchEvent(new Event('load'));
      await el.updateComplete;

      expect(el.isRefreshing).to.be.false;
    });

    it('loading indicator hides after iframe loads', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const refreshButton = el.shadowRoot!.querySelector('.refresh-button') as HTMLButtonElement;

      refreshButton.click();
      await el.updateComplete;

      let loadingIndicator = el.shadowRoot!.querySelector('.loading-indicator');
      expect(loadingIndicator).to.exist;

      const iframe = el.shadowRoot!.querySelector('iframe')!;
      iframe.dispatchEvent(new Event('load'));
      await el.updateComplete;

      loadingIndicator = el.shadowRoot!.querySelector('.loading-indicator');
      expect(loadingIndicator).to.be.null;
    });

    it('iframe has load event listener', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);

      const iframe = el.shadowRoot!.querySelector('iframe')!;
      expect(iframe).to.exist;
      // The iframe should handle the load event - verified by dispatching load event and checking state change
    });
  });

  describe('fullscreen functionality', () => {
    it('isFullscreen is false by default', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      expect(el.isFullscreen).to.be.false;
    });

    it('clicking fullscreen button sets isFullscreen to true', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      expect(el.isFullscreen).to.be.true;
    });

    it('shows fullscreen overlay when fullscreen is active', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      const overlay = el.shadowRoot!.querySelector('.fullscreen-overlay');
      expect(overlay).to.exist;
    });

    it('fullscreen overlay has fixed positioning to cover viewport', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      const overlay = el.shadowRoot!.querySelector('.fullscreen-overlay') as HTMLElement;
      const styles = window.getComputedStyle(overlay);
      expect(styles.position).to.equal('fixed');
      expect(styles.top).to.equal('0px');
      expect(styles.left).to.equal('0px');
    });

    it('fullscreen overlay contains exit button', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      const exitButton = el.shadowRoot!.querySelector('.exit-fullscreen-button');
      expect(exitButton).to.exist;
    });

    it('exit fullscreen button has × symbol', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      const exitButton = el.shadowRoot!.querySelector('.exit-fullscreen-button')!;
      expect(exitButton.textContent).to.equal('×');
    });

    it('clicking exit button closes fullscreen', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      const exitButton = el.shadowRoot!.querySelector('.exit-fullscreen-button') as HTMLButtonElement;
      exitButton.click();
      // Wait for exit animation to complete (200ms)
      await aTimeout(250);
      await el.updateComplete;

      expect(el.isFullscreen).to.be.false;
    });

    it('fullscreen overlay is hidden after exit', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      const exitButton = el.shadowRoot!.querySelector('.exit-fullscreen-button') as HTMLButtonElement;
      exitButton.click();
      // Wait for exit animation to complete (200ms)
      await aTimeout(250);
      await el.updateComplete;

      const overlay = el.shadowRoot!.querySelector('.fullscreen-overlay');
      expect(overlay).to.be.null;
    });

    it('pressing Escape exits fullscreen', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;
      expect(el.isFullscreen).to.be.true;

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      // Wait for exit animation to complete (200ms)
      await aTimeout(250);
      await el.updateComplete;

      expect(el.isFullscreen).to.be.false;
    });

    it('fullscreen overlay contains an iframe', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      const iframe = el.shadowRoot!.querySelector('.fullscreen-iframe');
      expect(iframe).to.exist;
    });

    it('fullscreen iframe has same URL as panel', async () => {
      const testUrl = 'https://example.com/page';
      const el = await fixture<IframePanel>(html`<iframe-panel url=${testUrl}></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      const iframe = el.shadowRoot!.querySelector('.fullscreen-iframe') as HTMLIFrameElement;
      expect(iframe.src).to.equal(testUrl);
    });

    it('fullscreen overlay is not rendered when not fullscreen', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);

      const overlay = el.shadowRoot!.querySelector('.fullscreen-overlay');
      expect(overlay).to.be.null;
    });

    it('fullscreen overlay has high z-index', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      const overlay = el.shadowRoot!.querySelector('.fullscreen-overlay') as HTMLElement;
      const styles = window.getComputedStyle(overlay);
      expect(parseInt(styles.zIndex)).to.be.greaterThan(100);
    });

    it('fullscreen toolbar is visible in fullscreen mode', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      const toolbar = el.shadowRoot!.querySelector('.fullscreen-toolbar');
      expect(toolbar).to.exist;
    });
  });

  describe('toolbar interactions with iframe', () => {
    it('toolbar has pointer-events none by default', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);

      const toolbar = el.shadowRoot!.querySelector('.toolbar') as HTMLElement;
      const styles = window.getComputedStyle(toolbar);
      expect(styles.pointerEvents).to.equal('none');
    });

    it('toolbar has pointer-events auto when visible', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const trigger = el.shadowRoot!.querySelector('.toolbar-trigger')!;

      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;

      const toolbar = el.shadowRoot!.querySelector('.toolbar') as HTMLElement;
      const styles = window.getComputedStyle(toolbar);
      expect(styles.pointerEvents).to.equal('auto');
    });

    it('close button click stops event propagation', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const closeButton = el.shadowRoot!.querySelector('.close-button') as HTMLButtonElement;

      let propagated = false;
      el.shadowRoot!.querySelector('.iframe-container')!.addEventListener('click', () => {
        propagated = true;
      });

      closeButton.click();
      await el.updateComplete;

      expect(propagated).to.be.false;
    });

    it('edit button click stops event propagation', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;

      let propagated = false;
      el.shadowRoot!.querySelector('.iframe-container')!.addEventListener('click', () => {
        propagated = true;
      });

      editButton.click();
      await el.updateComplete;

      expect(propagated).to.be.false;
    });

    it('refresh button click stops event propagation', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const refreshButton = el.shadowRoot!.querySelector('.refresh-button') as HTMLButtonElement;

      let propagated = false;
      el.shadowRoot!.querySelector('.iframe-container')!.addEventListener('click', () => {
        propagated = true;
      });

      refreshButton.click();
      await el.updateComplete;

      expect(propagated).to.be.false;
    });

    it('fullscreen button click stops event propagation', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      let propagated = false;
      el.shadowRoot!.querySelector('.iframe-container')!.addEventListener('click', () => {
        propagated = true;
      });

      fullscreenButton.click();
      await el.updateComplete;

      expect(propagated).to.be.false;
    });

    it('toolbar buttons remain interactive when toolbar is visible', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const trigger = el.shadowRoot!.querySelector('.toolbar-trigger')!;

      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;

      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;
      editButton.click();
      await el.updateComplete;

      expect(el.isEditingUrl).to.be.true;
    });

    it('toolbar z-index is higher than toolbar trigger', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);

      const toolbar = el.shadowRoot!.querySelector('.toolbar') as HTMLElement;
      const trigger = el.shadowRoot!.querySelector('.toolbar-trigger') as HTMLElement;
      const toolbarZIndex = parseInt(window.getComputedStyle(toolbar).zIndex);
      const triggerZIndex = parseInt(window.getComputedStyle(trigger).zIndex);

      expect(toolbarZIndex).to.be.greaterThan(triggerZIndex);
    });

    it('all toolbar actions work reliably in sequence', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com" iframe-id="test-id"></iframe-panel>`);
      const trigger = el.shadowRoot!.querySelector('.toolbar-trigger')!;

      // Hover trigger to show toolbar
      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;
      expect(el.isHovered).to.be.true;

      // Test edit action
      const editButton = el.shadowRoot!.querySelector('.edit-button') as HTMLButtonElement;
      editButton.click();
      await el.updateComplete;
      expect(el.isEditingUrl).to.be.true;

      // Cancel edit
      const input = el.shadowRoot!.querySelector('.url-edit-input') as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await el.updateComplete;
      expect(el.isEditingUrl).to.be.false;

      // Test refresh action
      const refreshButton = el.shadowRoot!.querySelector('.refresh-button') as HTMLButtonElement;
      refreshButton.click();
      await el.updateComplete;
      expect(el.isRefreshing).to.be.true;

      // Simulate iframe load
      const iframe = el.shadowRoot!.querySelector('iframe')!;
      iframe.dispatchEvent(new Event('load'));
      await el.updateComplete;
      expect(el.isRefreshing).to.be.false;

      // Test fullscreen action
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;
      fullscreenButton.click();
      await el.updateComplete;
      expect(el.isFullscreen).to.be.true;

      // Exit fullscreen
      const exitButton = el.shadowRoot!.querySelector('.exit-fullscreen-button') as HTMLButtonElement;
      exitButton.click();
      // Wait for exit animation to complete (200ms)
      await aTimeout(250);
      await el.updateComplete;
      expect(el.isFullscreen).to.be.false;
    });

    it('exit fullscreen button click stops event propagation', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel url="https://example.com"></iframe-panel>`);
      const fullscreenButton = el.shadowRoot!.querySelector('.fullscreen-button') as HTMLButtonElement;

      fullscreenButton.click();
      await el.updateComplete;

      let propagated = false;
      el.shadowRoot!.querySelector('.fullscreen-overlay')!.addEventListener('click', () => {
        propagated = true;
      });

      const exitButton = el.shadowRoot!.querySelector('.exit-fullscreen-button') as HTMLButtonElement;
      exitButton.click();
      await el.updateComplete;

      expect(propagated).to.be.false;
    });
  });

  describe('default label display', () => {
    it('renders a default label element', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const defaultLabel = el.shadowRoot!.querySelector('.default-label');
      expect(defaultLabel).to.exist;
    });

    it('default label shows the label text when set', async () => {
      const testLabel = 'Test Dashboard';
      const el = await fixture<IframePanel>(html`<iframe-panel label=${testLabel}></iframe-panel>`);

      const defaultLabel = el.shadowRoot!.querySelector('.default-label')!;
      expect(defaultLabel.textContent).to.equal(testLabel);
    });

    it('default label shows the URL when label is not set', async () => {
      const testUrl = 'https://example.com';
      const el = await fixture<IframePanel>(html`<iframe-panel url=${testUrl}></iframe-panel>`);

      const defaultLabel = el.shadowRoot!.querySelector('.default-label')!;
      expect(defaultLabel.textContent).to.equal(testUrl);
    });

    it('default label is visible by default (opacity 1)', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const defaultLabel = el.shadowRoot!.querySelector('.default-label') as HTMLElement;
      const styles = window.getComputedStyle(defaultLabel);
      expect(styles.opacity).to.equal('1');
    });

    it('default label is hidden when toolbar is hovered (opacity 0)', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const trigger = el.shadowRoot!.querySelector('.toolbar-trigger')!;

      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;

      const defaultLabel = el.shadowRoot!.querySelector('.default-label') as HTMLElement;
      const styles = window.getComputedStyle(defaultLabel);
      expect(styles.opacity).to.equal('0');
    });

    it('default label is positioned at the top left', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const defaultLabel = el.shadowRoot!.querySelector('.default-label') as HTMLElement;
      const styles = window.getComputedStyle(defaultLabel);
      expect(styles.position).to.equal('absolute');
      expect(styles.top).to.equal('8px');
      expect(styles.left).to.equal('8px');
    });

    it('default label has bold font weight', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const defaultLabel = el.shadowRoot!.querySelector('.default-label') as HTMLElement;
      const styles = window.getComputedStyle(defaultLabel);
      expect(styles.fontWeight).to.equal('700');
    });

    it('default label has text shadow', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const defaultLabel = el.shadowRoot!.querySelector('.default-label') as HTMLElement;
      const styles = window.getComputedStyle(defaultLabel);
      expect(styles.textShadow).to.include('rgba(0, 0, 0');
    });

    it('default label becomes visible again when toolbar is no longer hovered', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const trigger = el.shadowRoot!.querySelector('.toolbar-trigger')!;
      const toolbar = el.shadowRoot!.querySelector('.toolbar')!;

      // Hover toolbar
      trigger.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;

      // Unhover toolbar
      toolbar.dispatchEvent(new MouseEvent('mouseleave'));
      await el.updateComplete;

      const defaultLabel = el.shadowRoot!.querySelector('.default-label') as HTMLElement;
      const styles = window.getComputedStyle(defaultLabel);
      expect(styles.opacity).to.equal('1');
    });
  });
});
