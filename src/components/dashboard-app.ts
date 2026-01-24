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
    this.iframes = this.iframes.filter(iframe => iframe.id !== id);
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
