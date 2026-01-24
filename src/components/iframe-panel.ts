import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('iframe-panel')
export class IframePanel extends LitElement {
  @property({ type: String })
  url = '';

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
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  `;

  override render() {
    return html`
      <div class="iframe-container">
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
