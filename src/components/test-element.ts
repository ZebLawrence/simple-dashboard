import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('test-element')
export class TestElement extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      color: var(--test-element-text-color, #000);
    }
  `;

  @property({ type: String })
  name = 'World';

  @property({ type: Number })
  count = 0;

  override render() {
    return html`
      <h1>Hello, ${this.name}!</h1>
      <button @click=${this._onClick}>
        Count: ${this.count}
      </button>
    `;
  }

  private _onClick() {
    this.count++;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-element': TestElement;
  }
}
