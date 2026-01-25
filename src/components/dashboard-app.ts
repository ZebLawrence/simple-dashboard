import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { IframeConfig, GridConfig, WorkspaceState } from '../types/index.js';
import { storageService } from '../services/storage-service.js';
import { applyGlobalTheme, themeColors } from '../styles/theme.js';
import './iframe-grid.js';
import './add-iframe-button.js';
import './add-iframe-modal.js';

// Apply global theme styles to document
applyGlobalTheme();

@customElement('dashboard-app')
export class DashboardApp extends LitElement {
  @state()
  private iframes: IframeConfig[] = [];

  @state()
  private grid: GridConfig = {
    columns: 1,
    rows: 1,
    columnRatios: [1],
    rowRatios: [1],
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
      background-color: var(--color-background, ${unsafeCSS(themeColors.background)});
      color: var(--color-text-primary, ${unsafeCSS(themeColors.textPrimary)});
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .dashboard-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .dashboard-content {
      flex: 1;
      overflow: hidden;
    }
  `;

  override render() {
    return html`
      <div class="dashboard-container">
        <main class="dashboard-content">
          <iframe-grid
            .iframes=${this.iframes}
            .grid=${this.grid}
            @remove-iframe=${this._handleRemoveIframe}
            @url-changed=${this._handleUrlChanged}
            @grid-drag-complete=${this._handleGridDragComplete}
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

    // Auto-save after adding iframe
    this.saveState();
  }

  private _handleRemoveIframe(event: CustomEvent<{ id: string }>) {
    const { id } = event.detail;
    const removedIframe = this.iframes.find(iframe => iframe.id === id);
    if (!removedIframe) return;

    // Remove the iframe from state
    const remainingIframes = this.iframes.filter(iframe => iframe.id !== id);

    // Reflow the grid
    this._reflowGrid(remainingIframes);

    // Auto-save after removing iframe
    this.saveState();
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

  /**
   * Get the current workspace state
   */
  getWorkspaceState(): WorkspaceState {
    return {
      iframes: this.iframes,
      grid: this.grid,
    };
  }

  /**
   * Save the current workspace state to localStorage
   * @returns true if save was successful, false if storage quota exceeded
   */
  saveState(): boolean {
    const state = this.getWorkspaceState();
    return storageService.save(state);
  }

  /**
   * Load workspace state from localStorage and apply it
   * @returns true if state was loaded and applied, false if no saved state or invalid
   */
  loadState(): boolean {
    const state = storageService.load();
    if (!state) {
      return false;
    }

    this.iframes = state.iframes;
    this.grid = state.grid;
    return true;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.loadState();
  }

  private _handleUrlChanged(event: CustomEvent<{ id: string; url: string }>) {
    const { id, url } = event.detail;

    // Update the iframe URL in state
    this.iframes = this.iframes.map(iframe =>
      iframe.id === id ? { ...iframe, url } : iframe
    );

    // Auto-save after editing iframe URL
    this.saveState();
  }

  private _handleGridDragComplete(event: CustomEvent<{ columnRatios: number[]; rowRatios: number[] }>) {
    const { columnRatios, rowRatios } = event.detail;

    // Update grid ratios from the event (the iframe-grid already updated its local state)
    this.grid = {
      ...this.grid,
      columnRatios,
      rowRatios,
    };

    // Auto-save after resizing grid (debounced via grid-drag-complete instead of ratio-change)
    this.saveState();
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
