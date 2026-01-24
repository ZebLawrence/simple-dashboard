import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IframeConfig, GridConfig } from '../types/index.js';
import './iframe-panel.js';

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
      gap: 4px;
      background-color: #1a1a2e;
    }
  `;

  private getGridTemplateColumns(): string {
    return this.grid.columnRatios.map(ratio => `${ratio}fr`).join(' ');
  }

  private getGridTemplateRows(): string {
    return this.grid.rowRatios.map(ratio => `${ratio}fr`).join(' ');
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
    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.columns; col++) {
        const iframe = this.getIframeAtPosition(row, col);
        cells.push(html`
          <iframe-panel
            url=${iframe?.url ?? ''}
            style="grid-row: ${row + 1}; grid-column: ${col + 1};"
          ></iframe-panel>
        `);
      }
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
