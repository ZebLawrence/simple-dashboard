import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { themeColors } from '../styles/theme.js';

export type DividerOrientation = 'horizontal' | 'vertical';

// Visible divider size (thin line)
const DIVIDER_SIZE = 4;
// Hit area size for easier grabbing (transparent, larger than visible)
const HIT_AREA_SIZE = 12;
// Offset to center the visible divider within the hit area
const HIT_AREA_OFFSET = (HIT_AREA_SIZE - DIVIDER_SIZE) / 2;

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

    /* Hit area - larger transparent area for easier grabbing */
    .divider-hit-area {
      position: absolute;
      background-color: transparent;
    }

    /* Visible divider line */
    .divider {
      position: absolute;
      background-color: ${unsafeCSS(themeColors.border)};
      transition: background-color 0.15s ease, box-shadow 0.15s ease;
    }

    .divider-hit-area:hover .divider {
      background-color: ${unsafeCSS(themeColors.focus)};
      box-shadow: 0 0 8px rgba(74, 144, 217, 0.5);
    }

    .divider.dragging {
      background-color: ${unsafeCSS(themeColors.focus)};
      box-shadow: 0 0 12px rgba(74, 144, 217, 0.7);
    }

    /* Vertical divider (between columns) */
    :host([orientation='vertical']) .divider-hit-area {
      width: ${HIT_AREA_SIZE}px;
      height: 100%;
      cursor: col-resize;
      left: -${HIT_AREA_OFFSET}px;
      top: 0;
    }

    :host([orientation='vertical']) .divider {
      width: ${DIVIDER_SIZE}px;
      height: 100%;
      left: ${HIT_AREA_OFFSET}px;
      top: 0;
    }

    /* Horizontal divider (between rows) */
    :host([orientation='horizontal']) .divider-hit-area {
      width: 100%;
      height: ${HIT_AREA_SIZE}px;
      cursor: row-resize;
      left: 0;
      top: -${HIT_AREA_OFFSET}px;
    }

    :host([orientation='horizontal']) .divider {
      width: 100%;
      height: ${DIVIDER_SIZE}px;
      left: 0;
      top: ${HIT_AREA_OFFSET}px;
    }
  `;

  override render() {
    return html`
      <div
        class="divider-hit-area"
        @mousedown=${this.handleMouseDown}
      >
        <div class="divider"></div>
      </div>
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
    if (dividerEl) {
      if (isDragging) {
        dividerEl.classList.add('dragging');
      } else {
        dividerEl.classList.remove('dragging');
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'grid-divider': GridDivider;
  }
}
