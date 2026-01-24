import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { IframeConfig, GridConfig } from '../types/index.js';
import './iframe-grid.js';
import './add-iframe-button.js';
import './add-iframe-modal.js';

@customElement('dashboard-app')
export class DashboardApp extends LitElement {
  @state()
  private iframes: IframeConfig[] = [
    { id: 'iframe-1', url: 'https://example.com', position: { row: 0, col: 0 } },
    { id: 'iframe-2', url: 'https://example.org', position: { row: 0, col: 1 } },
    { id: 'iframe-3', url: 'https://example.net', position: { row: 1, col: 0 } },
    { id: 'iframe-4', url: 'https://example.edu', position: { row: 1, col: 1 } },
  ];

  @state()
  private grid: GridConfig = {
    columns: 2,
    rows: 2,
    columnRatios: [1, 1],
    rowRatios: [1, 1],
  };

  @state()
  private modalOpen = false;
  static override styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      background-color: #1a1a2e;
      color: #eaeaea;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .dashboard-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .dashboard-header {
      padding: 8px 16px;
      background-color: #16213e;
      border-bottom: 1px solid #0f3460;
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
      color: #e94560;
    }

    .dashboard-content {
      flex: 1;
      overflow: hidden;
    }
  `;

  override render() {
    return html`
      <div class="dashboard-container">
        <header class="dashboard-header">
          <h1>Simple Dashboard</h1>
        </header>
        <main class="dashboard-content">
          <iframe-grid
            .iframes=${this.iframes}
            .grid=${this.grid}
            @remove-iframe=${this._handleRemoveIframe}
          ></iframe-grid>
        </main>
        <add-iframe-button @add-iframe-click=${this._handleAddIframeClick}></add-iframe-button>
        <add-iframe-modal .open=${this.modalOpen} @modal-close=${this._handleModalClose} @add-iframe=${this._handleAddIframe}></add-iframe-modal>
      </div>
    `;
  }

  private _handleAddIframeClick() {
    this.modalOpen = true;
  }

  private _handleModalClose() {
    this.modalOpen = false;
  }

  private _handleAddIframe(event: CustomEvent<{ url: string }>) {
    const { url } = event.detail;

    // Generate unique ID
    const id = `iframe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate next available grid position
    const position = this._getNextGridPosition();

    // Create new iframe config
    const newIframe: IframeConfig = {
      id,
      url,
      position,
    };

    // Add to state
    this.iframes = [...this.iframes, newIframe];

    // Close modal
    this.modalOpen = false;
  }

  private _handleRemoveIframe(event: CustomEvent<{ id: string }>) {
    const { id } = event.detail;
    const removedIframe = this.iframes.find(iframe => iframe.id === id);
    if (!removedIframe) return;

    // Remove the iframe from state
    const remainingIframes = this.iframes.filter(iframe => iframe.id !== id);

    // Reflow the grid
    this._reflowGrid(remainingIframes);
  }

  private _reflowGrid(iframes: IframeConfig[]) {
    if (iframes.length === 0) {
      // Reset to minimum 1x1 grid with empty state
      this.iframes = [];
      this.grid = {
        columns: 1,
        rows: 1,
        columnRatios: [1],
        rowRatios: [1],
      };
      return;
    }

    // Sort iframes by their current position (row-major order)
    const sortedIframes = [...iframes].sort((a, b) => {
      if (a.position.row !== b.position.row) {
        return a.position.row - b.position.row;
      }
      return a.position.col - b.position.col;
    });

    // Calculate optimal grid dimensions
    const { newColumns, newRows } = this._calculateOptimalGridDimensions(sortedIframes.length);

    // Reassign positions in row-major order to fill gaps
    const repositionedIframes = sortedIframes.map((iframe, index) => ({
      ...iframe,
      position: {
        row: Math.floor(index / newColumns),
        col: index % newColumns,
      },
    }));

    // Calculate new ratios - distribute proportionally
    const newColumnRatios = this._calculateNewRatios(this.grid.columnRatios, this.grid.columns, newColumns);
    const newRowRatios = this._calculateNewRatios(this.grid.rowRatios, this.grid.rows, newRows);

    this.iframes = repositionedIframes;
    this.grid = {
      columns: newColumns,
      rows: newRows,
      columnRatios: newColumnRatios,
      rowRatios: newRowRatios,
    };
  }

  private _calculateOptimalGridDimensions(count: number): { newColumns: number; newRows: number } {
    if (count === 0) {
      return { newColumns: 1, newRows: 1 };
    }

    // Try to keep the grid as square as possible
    const sqrt = Math.sqrt(count);
    let newColumns = Math.ceil(sqrt);
    let newRows = Math.ceil(count / newColumns);

    // Ensure we have enough cells
    while (newColumns * newRows < count) {
      if (newColumns <= newRows) {
        newColumns++;
      } else {
        newRows++;
      }
    }

    return { newColumns, newRows };
  }

  private _calculateNewRatios(oldRatios: number[], oldCount: number, newCount: number): number[] {
    if (newCount === oldCount) {
      return [...oldRatios];
    }

    if (newCount < oldCount) {
      // Shrinking: take the first newCount ratios and normalize
      const keptRatios = oldRatios.slice(0, newCount);
      return keptRatios;
    }

    // Expanding: add new ratios with value 1
    const newRatios = [...oldRatios];
    while (newRatios.length < newCount) {
      newRatios.push(1);
    }
    return newRatios;
  }

  private _getNextGridPosition(): { row: number; col: number } {
    // Find all occupied positions
    const occupied = new Set(
      this.iframes.map(iframe => `${iframe.position.row},${iframe.position.col}`)
    );

    // First, try to find an empty cell in the current grid
    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.columns; col++) {
        if (!occupied.has(`${row},${col}`)) {
          return { row, col };
        }
      }
    }

    // No empty cell found, need to expand the grid
    // Prefer adding columns until grid is roughly square, then add rows
    if (this.grid.columns <= this.grid.rows) {
      // Add a new column
      this.grid = {
        ...this.grid,
        columns: this.grid.columns + 1,
        columnRatios: [...this.grid.columnRatios, 1],
      };
      return { row: 0, col: this.grid.columns - 1 };
    } else {
      // Add a new row
      this.grid = {
        ...this.grid,
        rows: this.grid.rows + 1,
        rowRatios: [...this.grid.rowRatios, 1],
      };
      return { row: this.grid.rows - 1, col: 0 };
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-app': DashboardApp;
  }
}
