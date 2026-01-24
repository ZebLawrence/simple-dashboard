import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
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

    it('sets isHovered to true on mouseenter', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const container = el.shadowRoot!.querySelector('.iframe-container')!;

      container.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;

      expect(el.isHovered).to.be.true;
    });

    it('sets isHovered to false on mouseleave', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const container = el.shadowRoot!.querySelector('.iframe-container')!;

      container.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;
      container.dispatchEvent(new MouseEvent('mouseleave'));
      await el.updateComplete;

      expect(el.isHovered).to.be.false;
    });

    it('adds hovered class to container on mouseenter', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const container = el.shadowRoot!.querySelector('.iframe-container')!;

      container.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;

      expect(container.classList.contains('hovered')).to.be.true;
    });

    it('removes hovered class from container on mouseleave', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const container = el.shadowRoot!.querySelector('.iframe-container')!;

      container.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;
      container.dispatchEvent(new MouseEvent('mouseleave'));
      await el.updateComplete;

      expect(container.classList.contains('hovered')).to.be.false;
    });

    it('renders hover overlay for pointer event handling', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);

      const overlay = el.shadowRoot!.querySelector('.hover-overlay');
      expect(overlay).to.exist;
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

    it('toolbar becomes visible when hovered', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const container = el.shadowRoot!.querySelector('.iframe-container')!;

      container.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;

      const toolbar = el.shadowRoot!.querySelector('.toolbar')!;
      expect(toolbar.classList.contains('visible')).to.be.true;
    });

    it('toolbar hides when hover ends', async () => {
      const el = await fixture<IframePanel>(html`<iframe-panel></iframe-panel>`);
      const container = el.shadowRoot!.querySelector('.iframe-container')!;

      container.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;
      container.dispatchEvent(new MouseEvent('mouseleave'));
      await el.updateComplete;

      const toolbar = el.shadowRoot!.querySelector('.toolbar')!;
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
});
