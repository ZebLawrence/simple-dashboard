import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('iframe-panel')
export class IframePanel extends LitElement {
  @property({ type: String })
  url = '';

  @property({ type: String, attribute: 'iframe-id' })
  iframeId = '';

  @state()
  private _isHovered = false;

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .iframe-container {
      width: 100%;
      height: 100%;
      background-color: #16213e;
      border: 1px solid #0f3460;
      box-sizing: border-box;
      position: relative;
    }

    .toolbar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 8px;
      display: flex;
      justify-content: flex-end;
      gap: 4px;
      background-color: rgba(15, 52, 96, 0.85);
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 10;
      pointer-events: none;
    }

    .toolbar.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .hover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 5;
      pointer-events: none;
    }

    .iframe-container.hovered .hover-overlay {
      pointer-events: auto;
    }

    .close-button {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 4px;
      background-color: rgba(233, 69, 96, 0.9);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
      padding: 0;
    }

    .close-button:hover {
      background-color: #e94560;
    }

    .close-button:active {
      background-color: #c73e54;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  `;

  private _handleClose() {
    this.dispatchEvent(
      new CustomEvent('remove-iframe', {
        bubbles: true,
        composed: true,
        detail: { id: this.iframeId },
      })
    );
  }

  private _handleMouseEnter() {
    this._isHovered = true;
  }

  private _handleMouseLeave() {
    this._isHovered = false;
  }

  get isHovered(): boolean {
    return this._isHovered;
  }

  override render() {
    return html`
      <div
        class="iframe-container ${this._isHovered ? 'hovered' : ''}"
        @mouseenter=${this._handleMouseEnter}
        @mouseleave=${this._handleMouseLeave}
      >
        <div class="toolbar ${this._isHovered ? 'visible' : ''}">
          <button class="close-button" @click=${this._handleClose} title="Remove iframe">×</button>
        </div>
        <div class="hover-overlay"></div>
        <iframe
          src=${this.url}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'iframe-panel': IframePanel;
  }
}
