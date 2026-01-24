import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('add-iframe-modal')
export class AddIframeModal extends LitElement {
  @property({ type: Boolean, reflect: true })
  open = false;

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
    }

    .modal {
      background-color: #1a1a2e;
      border-radius: 8px;
      padding: 24px;
      min-width: 400px;
      max-width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      border: 1px solid #0f3460;
    }

    .modal-header {
      margin: 0 0 20px 0;
      color: #eaeaea;
      font-size: 20px;
      font-weight: 500;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #a0a0a0;
      font-size: 14px;
      margin-bottom: 8px;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #0f3460;
      border-radius: 4px;
      background-color: #16213e;
      color: #eaeaea;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #4a90d9;
      box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2);
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
      transition: background-color 0.15s ease;
    }

    .cancel-button {
      background-color: transparent;
      border: 1px solid #0f3460;
      color: #a0a0a0;
    }

    .cancel-button:hover {
      background-color: #0f3460;
      color: #eaeaea;
    }

    .cancel-button:focus {
      outline: 2px solid #4a90d9;
      outline-offset: 2px;
    }

    .add-button {
      background-color: #e94560;
      border: none;
      color: #eaeaea;
    }

    .add-button:hover {
      background-color: #ff6b6b;
    }

    .add-button:focus {
      outline: 2px solid #4a90d9;
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
              placeholder="https://example.com"
              @keydown=${this._handleKeydown}
            />
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

  private _handleAdd() {
    // To be implemented in task 4
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this._close();
    }
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
