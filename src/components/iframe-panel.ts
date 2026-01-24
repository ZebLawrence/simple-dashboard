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

  @state()
  private _isEditingUrl = false;

  @state()
  private _editUrlValue = '';

  @state()
  private _isRefreshing = false;

  @state()
  private _isFullscreen = false;

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

    .toolbar-button {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 4px;
      background-color: rgba(255, 255, 255, 0.15);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      line-height: 1;
      padding: 0;
      transition: background-color 0.15s ease;
    }

    .toolbar-button:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .toolbar-button:active {
      background-color: rgba(255, 255, 255, 0.4);
    }

    .toolbar-button.close-button {
      background-color: rgba(233, 69, 96, 0.9);
      font-size: 16px;
    }

    .toolbar-button.close-button:hover {
      background-color: #e94560;
    }

    .toolbar-button.close-button:active {
      background-color: #c73e54;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }

    .url-edit-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
    }

    .url-edit-container {
      background-color: #16213e;
      border: 1px solid #0f3460;
      border-radius: 8px;
      padding: 16px;
      width: 80%;
      max-width: 500px;
    }

    .url-edit-label {
      color: #e0e0e0;
      font-size: 14px;
      margin-bottom: 8px;
      display: block;
    }

    .url-edit-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #0f3460;
      border-radius: 4px;
      background-color: #1a1a2e;
      color: white;
      font-size: 14px;
      box-sizing: border-box;
    }

    .url-edit-input:focus {
      outline: none;
      border-color: #e94560;
    }

    .loading-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 15;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(22, 33, 62, 0.9);
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid #0f3460;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(233, 69, 96, 0.3);
      border-top-color: #e94560;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 10px;
    }

    .loading-text {
      color: #e0e0e0;
      font-size: 14px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .fullscreen-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #1a1a2e;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      animation: fullscreen-enter 0.2s ease-out;
    }

    @keyframes fullscreen-enter {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .fullscreen-toolbar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 12px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      background-color: rgba(15, 52, 96, 0.85);
      z-index: 1001;
    }

    .fullscreen-iframe {
      flex: 1;
      width: 100%;
      height: 100%;
      border: none;
    }

    .exit-fullscreen-button {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 4px;
      background-color: rgba(233, 69, 96, 0.9);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      line-height: 1;
      padding: 0;
      transition: background-color 0.15s ease;
    }

    .exit-fullscreen-button:hover {
      background-color: #e94560;
    }

    .exit-fullscreen-button:active {
      background-color: #c73e54;
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

  get isEditingUrl(): boolean {
    return this._isEditingUrl;
  }

  get isRefreshing(): boolean {
    return this._isRefreshing;
  }

  get isFullscreen(): boolean {
    return this._isFullscreen;
  }

  private _handleRefreshClick() {
    this._isRefreshing = true;
    const iframe = this.shadowRoot?.querySelector('iframe');
    if (iframe) {
      // Force reload by re-setting the src with a cache-busting parameter
      const currentSrc = iframe.src;
      const url = new URL(currentSrc);
      url.searchParams.set('_refresh', Date.now().toString());
      iframe.src = url.toString();
    }
  }

  private _handleIframeLoad() {
    if (this._isRefreshing) {
      this._isRefreshing = false;
    }
  }

  private _handleEditClick() {
    this._editUrlValue = this.url;
    this._isEditingUrl = true;
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector('.url-edit-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  private _handleEditInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._submitUrlEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this._cancelUrlEdit();
    }
  }

  private _handleEditInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this._editUrlValue = input.value;
  }

  private _handleOverlayClick(e: Event) {
    const target = e.target as HTMLElement;
    if (target.classList.contains('url-edit-overlay')) {
      this._cancelUrlEdit();
    }
  }

  private _submitUrlEdit() {
    this.url = this._editUrlValue;
    this._isEditingUrl = false;
    this.dispatchEvent(
      new CustomEvent('url-changed', {
        bubbles: true,
        composed: true,
        detail: { id: this.iframeId, url: this.url },
      })
    );
  }

  private _cancelUrlEdit() {
    this._isEditingUrl = false;
    this._editUrlValue = '';
  }

  private _handleFullscreenClick() {
    this._isFullscreen = true;
    document.addEventListener('keydown', this._handleFullscreenKeydown);
  }

  private _handleExitFullscreen() {
    this._isFullscreen = false;
    document.removeEventListener('keydown', this._handleFullscreenKeydown);
  }

  private _handleFullscreenKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      this._handleExitFullscreen();
    }
  };

  override render() {
    return html`
      <div
        class="iframe-container ${this._isHovered ? 'hovered' : ''}"
        @mouseenter=${this._handleMouseEnter}
        @mouseleave=${this._handleMouseLeave}
      >
        <div class="toolbar ${this._isHovered ? 'visible' : ''}">
          <button class="toolbar-button edit-button" @click=${this._handleEditClick} title="Edit URL">✎</button>
          <button class="toolbar-button refresh-button" @click=${this._handleRefreshClick} title="Refresh">↻</button>
          <button class="toolbar-button fullscreen-button" @click=${this._handleFullscreenClick} title="Fullscreen">⛶</button>
          <button class="toolbar-button close-button" @click=${this._handleClose} title="Remove iframe">×</button>
        </div>
        <div class="hover-overlay"></div>
        ${this._isEditingUrl
          ? html`
              <div class="url-edit-overlay" @click=${this._handleOverlayClick}>
                <div class="url-edit-container">
                  <label class="url-edit-label">Enter URL:</label>
                  <input
                    type="text"
                    class="url-edit-input"
                    .value=${this._editUrlValue}
                    @input=${this._handleEditInputChange}
                    @keydown=${this._handleEditInputKeydown}
                  />
                </div>
              </div>
            `
          : ''}
        ${this._isRefreshing
          ? html`
              <div class="loading-indicator">
                <div class="loading-spinner"></div>
                <span class="loading-text">Refreshing...</span>
              </div>
            `
          : ''}
        <iframe
          src=${this.url}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          @load=${this._handleIframeLoad}
        ></iframe>
      </div>
      ${this._isFullscreen
        ? html`
            <div class="fullscreen-overlay">
              <div class="fullscreen-toolbar">
                <button class="exit-fullscreen-button" @click=${this._handleExitFullscreen} title="Exit Fullscreen">×</button>
              </div>
              <iframe
                class="fullscreen-iframe"
                src=${this.url}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </div>
          `
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'iframe-panel': IframePanel;
  }
}
