import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('add-iframe-button')
export class AddIframeButton extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
    }

    button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background-color: #e94560;
      color: #eaeaea;
      font-size: 28px;
      font-weight: 300;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    }

    button:hover {
      background-color: #ff6b6b;
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    button:active {
      background-color: #c73e54;
      transform: scale(0.95);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    button:focus {
      outline: 2px solid #4a90d9;
      outline-offset: 2px;
    }

    .plus-icon {
      line-height: 1;
    }
  `;

  override render() {
    return html`
      <button
        type="button"
        aria-label="Add iframe"
        @click=${this._handleClick}
      >
        <span class="plus-icon">+</span>
      </button>
    `;
  }

  private _handleClick() {
    this.dispatchEvent(
      new CustomEvent('add-iframe-click', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'add-iframe-button': AddIframeButton;
  }
}
