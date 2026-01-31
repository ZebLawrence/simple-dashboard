import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { IframeConfig, GridConfig } from '../types/index.js';
import './iframe-panel.js';
import type { IframePanel } from './iframe-panel.js';
import './grid-divider.js';
import type { GridDivider, DividerOrientation } from './grid-divider.js';

const DIVIDER_SIZE = 4;
const MIN_PANEL_SIZE_PX = 100;

export interface DragState {
  active: boolean;
  orientation: DividerOrientation;
  index: number;
  startX: number;
  startY: number;
  pointerId: number;
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

  // Drag state - NOT decorated with @state() to prevent re-renders during drag
  private dragState: DragState | null = null;

  // Working ratios used during drag - not reactive to avoid re-renders
  private workingColumnRatios: number[] = [];
  private workingRowRatios: number[] = [];

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
      background-color: #1c1b1a;
    }

    grid-divider[orientation='vertical'] {
      height: 100%;
    }

    grid-divider[orientation='horizontal'] {
      width: 100%;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #9ca3af;
      text-align: center;
      padding: 32px;
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    .empty-state-title {
      font-size: 1.25rem;
      font-weight: 500;
      color: #e0e0e0;
      margin: 0 0 8px 0;
    }

    .empty-state-description {
      font-size: 0.875rem;
      color: #9ca3af;
      margin: 0;
      max-width: 300px;
      line-height: 1.5;
    }

    /* Prevent text selection during drag */
    .grid-container.dragging {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
    }

    /* Apply cursor during drag */
    .grid-container.dragging-vertical {
      cursor: col-resize;
    }

    .grid-container.dragging-horizontal {
      cursor: row-resize;
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
    // Show empty state when there are no iframes
    if (this.iframes.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-state-icon">+</div>
          <h2 class="empty-state-title">No panels yet</h2>
          <p class="empty-state-description">
            Click the + button in the bottom right corner to add your first iframe panel.
          </p>
        </div>
      `;
    }

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
            iframe-id=${iframe?.id ?? ''}
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
    const { orientation, index, startX, startY, pointerId } = event.detail;

    // Get container early
    const container = this.shadowRoot?.querySelector('.grid-container') as HTMLElement;
    if (!container) return;

    // Initialize working ratios from current grid state
    this.workingColumnRatios = [...this.grid.columnRatios];
    this.workingRowRatios = [...this.grid.rowRatios];

    // Store drag state (NOT @state, so no re-render)
    this.dragState = {
      active: true,
      orientation,
      index,
      startX,
      startY,
      pointerId,
      initialColumnRatios: [...this.grid.columnRatios],
      initialRowRatios: [...this.grid.rowRatios],
    };

    // Visual feedback only - no state changes
    const dividers = this.shadowRoot?.querySelectorAll('grid-divider');
    dividers?.forEach((divider) => {
      const dividerEl = divider as GridDivider;
      if (dividerEl.orientation === orientation && dividerEl.index === index) {
        dividerEl.setDragging(true);
      }
    });

    container.classList.add('dragging', `dragging-${orientation}`);
    document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    // Attach document-level listeners (critical for tracking pointer outside divider)
    this.boundHandlePointerMove = this.handlePointerMove.bind(this);
    this.boundHandlePointerUp = this.handlePointerUp.bind(this);
    
    document.addEventListener('pointermove', this.boundHandlePointerMove);
    document.addEventListener('pointerup', this.boundHandlePointerUp);
    document.addEventListener('pointercancel', this.boundHandlePointerUp);
  }

  private boundHandlePointerMove: ((event: PointerEvent) => void) | null = null;
  private boundHandlePointerUp: ((event: PointerEvent) => void) | null = null;

  private handlePointerMove(event: PointerEvent) {
    if (!this.dragState?.active) return;
    if (event.pointerId !== this.dragState.pointerId) return;
    
    event.preventDefault();

    const { orientation, index, startX, startY, initialColumnRatios, initialRowRatios } = this.dragState;
    const container = this.shadowRoot?.querySelector('.grid-container') as HTMLElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    if (orientation === 'vertical') {
      const deltaX = event.clientX - startX;
      const numDividers = this.grid.columns - 1;
      const contentWidth = rect.width - (numDividers * DIVIDER_SIZE);
      const totalRatios = initialColumnRatios.reduce((sum, r) => sum + r, 0);
      const ratioDelta = (deltaX / contentWidth) * totalRatios;

      let newRatio1 = initialColumnRatios[index] + ratioDelta;
      let newRatio2 = initialColumnRatios[index + 1] - ratioDelta;

      const minRatio = (MIN_PANEL_SIZE_PX / contentWidth) * totalRatios;
      if (newRatio1 < minRatio) {
        newRatio1 = minRatio;
        newRatio2 = initialColumnRatios[index] + initialColumnRatios[index + 1] - minRatio;
      } else if (newRatio2 < minRatio) {
        newRatio2 = minRatio;
        newRatio1 = initialColumnRatios[index] + initialColumnRatios[index + 1] - minRatio;
      }

      this.workingColumnRatios[index] = newRatio1;
      this.workingColumnRatios[index + 1] = newRatio2;

      // Direct DOM manipulation - no Lit re-render
      container.style.gridTemplateColumns = this.buildGridTemplateColumns(this.workingColumnRatios);
    } else {
      const deltaY = event.clientY - startY;
      const numDividers = this.grid.rows - 1;
      const contentHeight = rect.height - (numDividers * DIVIDER_SIZE);
      const totalRatios = initialRowRatios.reduce((sum, r) => sum + r, 0);
      const ratioDelta = (deltaY / contentHeight) * totalRatios;

      let newRatio1 = initialRowRatios[index] + ratioDelta;
      let newRatio2 = initialRowRatios[index + 1] - ratioDelta;

      const minRatio = (MIN_PANEL_SIZE_PX / contentHeight) * totalRatios;
      if (newRatio1 < minRatio) {
        newRatio1 = minRatio;
        newRatio2 = initialRowRatios[index] + initialRowRatios[index + 1] - minRatio;
      } else if (newRatio2 < minRatio) {
        newRatio2 = minRatio;
        newRatio1 = initialRowRatios[index] + initialRowRatios[index + 1] - minRatio;
      }

      this.workingRowRatios[index] = newRatio1;
      this.workingRowRatios[index + 1] = newRatio2;

      // Direct DOM manipulation - no Lit re-render
      container.style.gridTemplateRows = this.buildGridTemplateRows(this.workingRowRatios);
    }
  }

  // Helper to build grid-template-columns string from ratios
  private buildGridTemplateColumns(ratios: number[]): string {
    return ratios
      .map((ratio, i) => {
        if (i < ratios.length - 1) {
          return `${ratio}fr ${DIVIDER_SIZE}px`;
        }
        return `${ratio}fr`;
      })
      .join(' ');
  }

  // Helper to build grid-template-rows string from ratios
  private buildGridTemplateRows(ratios: number[]): string {
    return ratios
      .map((ratio, i) => {
        if (i < ratios.length - 1) {
          return `${ratio}fr ${DIVIDER_SIZE}px`;
        }
        return `${ratio}fr`;
      })
      .join(' ');
  }

  private handlePointerUp(event: PointerEvent) {
    if (!this.dragState?.active) return;
    if (event.pointerId !== this.dragState.pointerId) return;

    // Commit final ratios to Lit state (single re-render to persist)
    this.grid = {
      ...this.grid,
      columnRatios: [...this.workingColumnRatios],
      rowRatios: [...this.workingRowRatios],
    };

    this.dispatchEvent(
      new CustomEvent('grid-drag-complete', {
        bubbles: true,
        composed: true,
        detail: {
          orientation: this.dragState.orientation,
          index: this.dragState.index,
          columnRatios: [...this.workingColumnRatios],
          rowRatios: [...this.workingRowRatios],
        },
      })
    );

    this.clearDragState();
  }

  removePointerMoveListener() {
    if (this.boundHandlePointerMove) {
      document.removeEventListener('pointermove', this.boundHandlePointerMove);
      this.boundHandlePointerMove = null;
    }
  }

  removePointerUpListener() {
    if (this.boundHandlePointerUp) {
      document.removeEventListener('pointerup', this.boundHandlePointerUp);
      document.removeEventListener('pointercancel', this.boundHandlePointerUp);
      this.boundHandlePointerUp = null;
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

      // Remove dragging classes from grid container
      const container = this.shadowRoot?.querySelector('.grid-container') as HTMLElement;
      if (container) {
        container.classList.remove('dragging');
        container.classList.remove('dragging-vertical');
        container.classList.remove('dragging-horizontal');
      }

      // Reset global cursor and user-select
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    this.removePointerMoveListener();
    this.removePointerUpListener();
    this.dragState = null;
  }

  /**
   * Refresh all iframe panels in the grid
   */
  refreshAll() {
    const panels = this.shadowRoot?.querySelectorAll('iframe-panel');
    panels?.forEach(panel => {
      (panel as IframePanel).refresh();
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'iframe-grid': IframeGrid;
  }
}
