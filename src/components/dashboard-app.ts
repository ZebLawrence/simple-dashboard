import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { IframeConfig, GridConfig } from '../types/index.js';
import './iframe-grid.js';

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
          ></iframe-grid>
        </main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-app': DashboardApp;
  }
}
