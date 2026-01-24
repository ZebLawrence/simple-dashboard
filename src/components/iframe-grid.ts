import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IframeConfig, GridConfig } from '../types/index.js';
import './iframe-panel.js';
import './grid-divider.js';

const DIVIDER_SIZE = 4;

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
      <div class="grid-container" style=${gridStyle}>
        ${cells}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'iframe-grid': IframeGrid;
  }
}
