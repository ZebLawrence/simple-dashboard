import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type DividerOrientation = 'horizontal' | 'vertical';

@customElement('grid-divider')
export class GridDivider extends LitElement {
  @property({ type: String })
  orientation: DividerOrientation = 'vertical';

  @property({ type: Number })
  index = 0;

  static override styles = css`
    :host {
      display: block;
      position: relative;
      z-index: 10;
    }

    .divider {
      position: absolute;
      background-color: #0f3460;
      transition: background-color 0.15s ease, box-shadow 0.15s ease;
    }

    .divider:hover {
      background-color: #4a90d9;
      box-shadow: 0 0 8px rgba(74, 144, 217, 0.5);
    }

    .divider.dragging {
      background-color: #4a90d9;
      box-shadow: 0 0 12px rgba(74, 144, 217, 0.7);
    }

    :host([orientation='vertical']) .divider {
      width: 4px;
      height: 100%;
      cursor: col-resize;
      left: 0;
      top: 0;
    }

    :host([orientation='horizontal']) .divider {
      width: 100%;
      height: 4px;
      cursor: row-resize;
      left: 0;
      top: 0;
    }
  `;

  override render() {
    return html`
      <div
        class="divider"
        @mousedown=${this.handleMouseDown}
      ></div>
    `;
  }

  private handleMouseDown(event: MouseEvent) {
    event.preventDefault();

    const dividerEl = this.shadowRoot?.querySelector('.divider');
    dividerEl?.classList.add('dragging');

    this.dispatchEvent(
      new CustomEvent('divider-drag-start', {
        bubbles: true,
        composed: true,
        detail: {
          orientation: this.orientation,
          index: this.index,
          startX: event.clientX,
          startY: event.clientY,
        },
      })
    );
  }

  setDragging(isDragging: boolean) {
    const dividerEl = this.shadowRoot?.querySelector('.divider');
    if (isDragging) {
      dividerEl?.classList.add('dragging');
    } else {
      dividerEl?.classList.remove('dragging');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'grid-divider': GridDivider;
  }
}
