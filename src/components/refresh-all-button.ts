import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('refresh-all-button')
export class RefreshAllButton extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 24px;
      right: 92px;
      z-index: 1000;
    }

    button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background-color: #4a7c59;
      color: #eae8e6;
      font-size: 24px;
      font-weight: 300;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    }

    button:hover {
      background-color: #5a9469;
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    button:active {
      background-color: #3a6c49;
      transform: scale(0.95);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    button:focus {
      outline: 2px solid #c9a87c;
      outline-offset: 2px;
    }

    .refresh-icon {
      line-height: 1;
    }
  `;

  override render() {
    return html`
      <button
        type="button"
        aria-label="Refresh all iframes"
        @click=${this._handleClick}
      >
        <span class="refresh-icon">↻</span>
      </button>
    `;
  }

  private _handleClick() {
    this.dispatchEvent(
      new CustomEvent('refresh-all-click', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'refresh-all-button': RefreshAllButton;
  }
}
