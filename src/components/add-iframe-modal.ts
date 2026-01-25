import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('add-iframe-modal')
export class AddIframeModal extends LitElement {
  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: Boolean })
  private hasError = false;

  @query('#url-input')
  private urlInput!: HTMLInputElement;

  private boundHandleKeydown: (e: KeyboardEvent) => void;

  constructor() {
    super();
    this.boundHandleKeydown = this._handleGlobalKeydown.bind(this);
  }

  override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    if (changedProperties.has('open')) {
      if (this.open) {
        this._onOpen();
      } else {
        this._onClose();
      }
    }
  }

  private _onOpen() {
    // Focus the URL input after the modal is rendered
    // Using setTimeout(0) instead of requestAnimationFrame for better test compatibility
    setTimeout(() => {
      this.urlInput?.focus();
    }, 0);
    // Add global keydown listener for Escape key
    document.addEventListener('keydown', this.boundHandleKeydown);
  }

  private _onClose() {
    // Remove global keydown listener
    document.removeEventListener('keydown', this.boundHandleKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up any listeners when element is removed from DOM
    document.removeEventListener('keydown', this.boundHandleKeydown);
  }

  private _handleGlobalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this._close();
    }
  }

  static override styles = css`
    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: backdrop-fade-in 0.2s ease-out;
    }

    .modal {
      background-color: #1c1b1a;
      border-radius: 8px;
      padding: 24px;
      min-width: 400px;
      max-width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      border: 1px solid #3d3937;
      animation: modal-slide-in 0.25s ease-out;
    }

    @keyframes backdrop-fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes modal-slide-in {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-header {
      margin: 0 0 20px 0;
      color: #eae8e6;
      font-size: 20px;
      font-weight: 500;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #a8a29e;
      font-size: 14px;
      margin-bottom: 8px;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #3d3937;
      border-radius: 4px;
      background-color: #2a2826;
      color: #eae8e6;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #c9a87c;
      box-shadow: 0 0 0 2px rgba(201, 168, 124, 0.2);
    }

    input.error {
      border-color: #e07850;
      box-shadow: 0 0 0 2px rgba(224, 120, 80, 0.2);
    }

    input.error:focus {
      border-color: #e07850;
      box-shadow: 0 0 0 2px rgba(224, 120, 80, 0.2);
    }

    .error-message {
      color: #e07850;
      font-size: 12px;
      margin-top: 4px;
      display: none;
    }

    .error-message.visible {
      display: block;
    }

    input::placeholder {
      color: #666;
    }

    .button-group {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    button {
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s ease, transform 0.1s ease;
    }

    button:active {
      transform: scale(0.97);
    }

    .cancel-button {
      background-color: transparent;
      border: 1px solid #3d3937;
      color: #a8a29e;
    }

    .cancel-button:hover {
      background-color: #3d3937;
      color: #eae8e6;
    }

    .cancel-button:focus {
      outline: 2px solid #c9a87c;
      outline-offset: 2px;
    }

    .add-button {
      background-color: #e07850;
      border: none;
      color: #eae8e6;
    }

    .add-button:hover {
      background-color: #f08a62;
    }

    .add-button:focus {
      outline: 2px solid #c9a87c;
      outline-offset: 2px;
    }
  `;

  override render() {
    return html`
      <div class="backdrop" @click=${this._handleBackdropClick}>
        <div class="modal" @click=${this._stopPropagation}>
          <h2 class="modal-header">Add Iframe</h2>
          <div class="form-group">
            <label for="url-input">URL</label>
            <input
              id="url-input"
              type="url"
              class="${this.hasError ? 'error' : ''}"
              placeholder="https://example.com"
              @input=${this._handleInput}
            />
            <div class="error-message ${this.hasError ? 'visible' : ''}">
              Please enter a valid URL
            </div>
          </div>
          <div class="button-group">
            <button
              type="button"
              class="cancel-button"
              @click=${this._handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              class="add-button"
              @click=${this._handleAdd}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _handleBackdropClick() {
    this._close();
  }

  private _stopPropagation(e: Event) {
    e.stopPropagation();
  }

  private _handleCancel() {
    this._close();
  }

  private _handleInput() {
    // Clear error state when user types
    if (this.hasError) {
      this.hasError = false;
    }
  }

  private _isValidUrl(url: string): boolean {
    if (!url.trim()) {
      return false;
    }
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private _handleAdd() {
    const url = this.urlInput.value.trim();

    if (!this._isValidUrl(url)) {
      this.hasError = true;
      return;
    }

    // Dispatch add-iframe event with the URL
    this.dispatchEvent(
      new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url },
      })
    );

    // Clear the input
    this.urlInput.value = '';
    this.hasError = false;

    // Close the modal
    this._close();
  }

  private _close() {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('modal-close', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'add-iframe-modal': AddIframeModal;
  }
}
