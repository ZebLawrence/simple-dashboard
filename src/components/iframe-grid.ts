import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { IframeConfig, GridConfig } from '../types/index.js';
import './iframe-panel.js';
import './grid-divider.js';
import type { GridDivider, DividerOrientation } from './grid-divider.js';

const DIVIDER_SIZE = 4;

export interface DragState {
  active: boolean;
  orientation: DividerOrientation;
  index: number;
  startX: number;
  startY: number;
  initialColumnRatios: number[];
  initialRowRatios: number[];
}

@customElement('iframe-grid')
export class IframeGrid extends LitElement {
  @property({ type: Array })
  iframes: IframeConfig[] = [];

  @property({ type: Object })
  grid: GridConfig = {
    columns: 2,
    rows: 2,
    columnRatios: [1, 1],
    rowRatios: [1, 1],
  };

  @state()
  private dragState: DragState | null = null;

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .grid-container {
      display: grid;
      width: 100%;
      height: 100%;
      gap: 0;
      background-color: #1a1a2e;
    }

    grid-divider[orientation='vertical'] {
      height: 100%;
    }

    grid-divider[orientation='horizontal'] {
      width: 100%;
    }
  `;

  private getGridTemplateColumns(): string {
    // Interleave column ratios with divider tracks
    // e.g., [1, 2] -> "1fr 4px 2fr"
    return this.grid.columnRatios
      .map((ratio, i) => {
        if (i < this.grid.columnRatios.length - 1) {
          return `${ratio}fr ${DIVIDER_SIZE}px`;
        }
        return `${ratio}fr`;
      })
      .join(' ');
  }

  private getGridTemplateRows(): string {
    // Interleave row ratios with divider tracks
    // e.g., [1, 1] -> "1fr 4px 1fr"
    return this.grid.rowRatios
      .map((ratio, i) => {
        if (i < this.grid.rowRatios.length - 1) {
          return `${ratio}fr ${DIVIDER_SIZE}px`;
        }
        return `${ratio}fr`;
      })
      .join(' ');
  }

  // Convert logical column index to actual grid column (accounting for divider tracks)
  private getActualGridColumn(col: number): number {
    return col * 2 + 1;
  }

  // Convert logical row index to actual grid row (accounting for divider tracks)
  private getActualGridRow(row: number): number {
    return row * 2 + 1;
  }

  private getIframeAtPosition(row: number, col: number): IframeConfig | undefined {
    return this.iframes.find(
      iframe => iframe.position.row === row && iframe.position.col === col
    );
  }

  override render() {
    const gridStyle = `
      grid-template-columns: ${this.getGridTemplateColumns()};
      grid-template-rows: ${this.getGridTemplateRows()};
    `;

    const cells = [];

    // Render iframe panels
    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.columns; col++) {
        const iframe = this.getIframeAtPosition(row, col);
        const actualRow = this.getActualGridRow(row);
        const actualCol = this.getActualGridColumn(col);
        cells.push(html`
          <iframe-panel
            url=${iframe?.url ?? ''}
            style="grid-row: ${actualRow}; grid-column: ${actualCol};"
          ></iframe-panel>
        `);
      }
    }

    // Render vertical dividers between columns
    for (let col = 0; col < this.grid.columns - 1; col++) {
      const dividerCol = this.getActualGridColumn(col) + 1; // Position in the divider track
      // Span all rows (including divider rows)
      const totalRowTracks = this.grid.rows * 2 - 1;
      cells.push(html`
        <grid-divider
          orientation="vertical"
          index=${col}
          style="grid-column: ${dividerCol}; grid-row: 1 / span ${totalRowTracks};"
        ></grid-divider>
      `);
    }

    // Render horizontal dividers between rows
    for (let row = 0; row < this.grid.rows - 1; row++) {
      const dividerRow = this.getActualGridRow(row) + 1; // Position in the divider track
      // Span all columns (including divider columns)
      const totalColTracks = this.grid.columns * 2 - 1;
      cells.push(html`
        <grid-divider
          orientation="horizontal"
          index=${row}
          style="grid-row: ${dividerRow}; grid-column: 1 / span ${totalColTracks};"
        ></grid-divider>
      `);
    }

    return html`
      <div
        class="grid-container"
        style=${gridStyle}
        @divider-drag-start=${this.handleDragStart}
      >
        ${cells}
      </div>
    `;
  }

  private handleDragStart(event: CustomEvent) {
    const { orientation, index, startX, startY } = event.detail;

    this.dragState = {
      active: true,
      orientation,
      index,
      startX,
      startY,
      initialColumnRatios: [...this.grid.columnRatios],
      initialRowRatios: [...this.grid.rowRatios],
    };

    // Add document-level mousemove listener for drag tracking
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    document.addEventListener('mousemove', this.boundHandleMouseMove);

    this.dispatchEvent(
      new CustomEvent('grid-drag-start', {
        bubbles: true,
        composed: true,
        detail: {
          orientation,
          index,
          initialColumnRatios: this.dragState.initialColumnRatios,
          initialRowRatios: this.dragState.initialRowRatios,
        },
      })
    );
  }

  private boundHandleMouseMove: ((event: MouseEvent) => void) | null = null;

  private handleMouseMove(event: MouseEvent) {
    if (!this.dragState || !this.dragState.active) {
      return;
    }

    const { orientation, index, startX, startY, initialColumnRatios, initialRowRatios } =
      this.dragState;

    // Get the grid container dimensions
    const container = this.shadowRoot?.querySelector('.grid-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();

    if (orientation === 'vertical') {
      // Calculate delta in pixels
      const deltaX = event.clientX - startX;

      // Calculate total content width (excluding divider tracks)
      const numDividers = this.grid.columns - 1;
      const totalDividerWidth = numDividers * DIVIDER_SIZE;
      const contentWidth = rect.width - totalDividerWidth;

      // Convert pixel delta to ratio delta
      const totalRatios = initialColumnRatios.reduce((sum, r) => sum + r, 0);
      const ratioPerPixel = totalRatios / contentWidth;
      const ratioDelta = deltaX * ratioPerPixel;

      // Calculate new ratios for the two adjacent columns
      const newColumnRatios = [...initialColumnRatios];
      newColumnRatios[index] = Math.max(0.1, initialColumnRatios[index] + ratioDelta);
      newColumnRatios[index + 1] = Math.max(0.1, initialColumnRatios[index + 1] - ratioDelta);

      // Update the grid property to trigger re-render with new CSS grid template
      this.grid = {
        ...this.grid,
        columnRatios: newColumnRatios,
      };

      this.dispatchEvent(
        new CustomEvent('ratio-change', {
          bubbles: true,
          composed: true,
          detail: {
            orientation,
            index,
            columnRatios: newColumnRatios,
            rowRatios: this.grid.rowRatios,
          },
        })
      );
    } else {
      // Horizontal divider - affects row ratios
      const deltaY = event.clientY - startY;

      // Calculate total content height (excluding divider tracks)
      const numDividers = this.grid.rows - 1;
      const totalDividerHeight = numDividers * DIVIDER_SIZE;
      const contentHeight = rect.height - totalDividerHeight;

      // Convert pixel delta to ratio delta
      const totalRatios = initialRowRatios.reduce((sum, r) => sum + r, 0);
      const ratioPerPixel = totalRatios / contentHeight;
      const ratioDelta = deltaY * ratioPerPixel;

      // Calculate new ratios for the two adjacent rows
      const newRowRatios = [...initialRowRatios];
      newRowRatios[index] = Math.max(0.1, initialRowRatios[index] + ratioDelta);
      newRowRatios[index + 1] = Math.max(0.1, initialRowRatios[index + 1] - ratioDelta);

      // Update the grid property to trigger re-render with new CSS grid template
      this.grid = {
        ...this.grid,
        rowRatios: newRowRatios,
      };

      this.dispatchEvent(
        new CustomEvent('ratio-change', {
          bubbles: true,
          composed: true,
          detail: {
            orientation,
            index,
            columnRatios: this.grid.columnRatios,
            rowRatios: newRowRatios,
          },
        })
      );
    }
  }

  removeMouseMoveListener() {
    if (this.boundHandleMouseMove) {
      document.removeEventListener('mousemove', this.boundHandleMouseMove);
      this.boundHandleMouseMove = null;
    }
  }

  getDragState(): DragState | null {
    return this.dragState;
  }

  clearDragState() {
    if (this.dragState) {
      const dividers = this.shadowRoot?.querySelectorAll('grid-divider');
      dividers?.forEach(divider => {
        (divider as GridDivider).setDragging(false);
      });
    }
    this.removeMouseMoveListener();
    this.dragState = null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'iframe-grid': IframeGrid;
  }
}
