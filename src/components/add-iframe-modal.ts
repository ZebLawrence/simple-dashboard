import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

type ModalTab = 'add' | 'import-export';

@customElement('add-iframe-modal')
export class AddIframeModal extends LitElement {
  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: Array })
  currentUrls: string[] = [];

  @state()
  private activeTab: ModalTab = 'add';

  @state()
  private hasError = false;

  @state()
  private importError = '';

  @state()
  private copySuccess = false;

  @query('#url-input')
  private urlInput!: HTMLInputElement;

  @query('#import-textarea')
  private importTextarea!: HTMLTextAreaElement;

  private boundHandleKeydown: (e: KeyboardEvent) => void;

  constructor() {
    super();
    this.boundHandleKeydown = this._handleGlobalKeydown.bind(this);
  }

  override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    if (changedProperties.has('open')) {
      if (this.open) {
        this._onOpen();
      } else {
        this._onClose();
      }
    }
  }

  private _onOpen() {
    // Reset state when opening
    this.activeTab = 'add';
    this.hasError = false;
    this.importError = '';
    this.copySuccess = false;

    // Focus the URL input after the modal is rendered
    setTimeout(() => {
      this.urlInput?.focus();
    }, 0);
    // Add global keydown listener for Escape key
    document.addEventListener('keydown', this.boundHandleKeydown);
  }

  private _onClose() {
    // Remove global keydown listener
    document.removeEventListener('keydown', this.boundHandleKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up any listeners when element is removed from DOM
    document.removeEventListener('keydown', this.boundHandleKeydown);
  }

  private _handleGlobalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this._close();
    }
  }

  static override styles = css`
    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: backdrop-fade-in 0.2s ease-out;
    }

    .modal {
      background-color: #1c1b1a;
      border-radius: 8px;
      padding: 24px;
      min-width: 450px;
      max-width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      border: 1px solid #3d3937;
      animation: modal-slide-in 0.25s ease-out;
    }

    @keyframes backdrop-fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes modal-slide-in {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-header {
      margin: 0 0 16px 0;
      color: #eae8e6;
      font-size: 20px;
      font-weight: 500;
    }

    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      border-bottom: 1px solid #3d3937;
      padding-bottom: 0;
    }

    .tab {
      padding: 10px 16px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: #a8a29e;
      font-size: 14px;
      cursor: pointer;
      transition: color 0.15s ease, border-color 0.15s ease;
      margin-bottom: -1px;
    }

    .tab:hover {
      color: #eae8e6;
    }

    .tab.active {
      color: #e07850;
      border-bottom-color: #e07850;
    }

    .tab-content {
      min-height: 150px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #a8a29e;
      font-size: 14px;
      margin-bottom: 8px;
    }

    input, textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #3d3937;
      border-radius: 4px;
      background-color: #2a2826;
      color: #eae8e6;
      font-size: 14px;
      font-family: inherit;
      box-sizing: border-box;
    }

    textarea {
      resize: vertical;
      min-height: 120px;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: #c9a87c;
      box-shadow: 0 0 0 2px rgba(201, 168, 124, 0.2);
    }

    input.error, textarea.error {
      border-color: #e07850;
      box-shadow: 0 0 0 2px rgba(224, 120, 80, 0.2);
    }

    input.error:focus, textarea.error:focus {
      border-color: #e07850;
      box-shadow: 0 0 0 2px rgba(224, 120, 80, 0.2);
    }

    .error-message {
      color: #e07850;
      font-size: 12px;
      margin-top: 4px;
      display: none;
    }

    .error-message.visible {
      display: block;
    }

    .success-message {
      color: #6abf69;
      font-size: 12px;
      margin-top: 4px;
    }

    input::placeholder, textarea::placeholder {
      color: #666;
    }

    .button-group {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .button-group-left {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    button {
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s ease, transform 0.1s ease;
    }

    button:active {
      transform: scale(0.97);
    }

    .cancel-button {
      background-color: transparent;
      border: 1px solid #3d3937;
      color: #a8a29e;
    }

    .cancel-button:hover {
      background-color: #3d3937;
      color: #eae8e6;
    }

    .cancel-button:focus {
      outline: 2px solid #c9a87c;
      outline-offset: 2px;
    }

    .add-button, .import-button {
      background-color: #e07850;
      border: none;
      color: #eae8e6;
    }

    .add-button:hover, .import-button:hover {
      background-color: #f08a62;
    }

    .add-button:focus, .import-button:focus {
      outline: 2px solid #c9a87c;
      outline-offset: 2px;
    }

    .copy-button {
      background-color: #3d3937;
      border: none;
      color: #eae8e6;
    }

    .copy-button:hover {
      background-color: #4a4744;
    }

    .copy-button:focus {
      outline: 2px solid #c9a87c;
      outline-offset: 2px;
    }

    .copy-button.success {
      background-color: #4a7c4a;
    }

    .section-divider {
      border: none;
      border-top: 1px solid #3d3937;
      margin: 20px 0;
    }

    .section-label {
      color: #a8a29e;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .help-text {
      color: #7a7572;
      font-size: 12px;
      margin-top: 4px;
    }
  `;

  override render() {
    return html`
      <div class="backdrop" @click=${this._handleBackdropClick}>
        <div class="modal" @click=${this._stopPropagation}>
          <h2 class="modal-header">Manage Iframes</h2>

          <div class="tabs">
            <button
              class="tab ${this.activeTab === 'add' ? 'active' : ''}"
              @click=${() => this._setTab('add')}
            >
              Add URL
            </button>
            <button
              class="tab ${this.activeTab === 'import-export' ? 'active' : ''}"
              @click=${() => this._setTab('import-export')}
            >
              Import / Export
            </button>
          </div>

          <div class="tab-content">
            ${this.activeTab === 'add' ? this._renderAddTab() : this._renderImportExportTab()}
          </div>
        </div>
      </div>
    `;
  }

  private _renderAddTab() {
    return html`
      <div class="form-group">
        <label for="url-input">URL</label>
        <input
          id="url-input"
          type="url"
          class="${this.hasError ? 'error' : ''}"
          placeholder="https://example.com"
          @input=${this._handleInput}
          @keydown=${this._handleInputKeydown}
        />
        <div class="error-message ${this.hasError ? 'visible' : ''}">
          Please enter a valid URL
        </div>
      </div>
      <div class="button-group">
        <button
          type="button"
          class="cancel-button"
          @click=${this._handleCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          class="add-button"
          @click=${this._handleAdd}
        >
          Add
        </button>
      </div>
    `;
  }

  private _renderImportExportTab() {
    const exportText = this.currentUrls.join('\n');

    return html`
      <div class="section-label">Export Current URLs</div>
      <div class="form-group">
        <textarea
          readonly
          .value=${exportText}
          placeholder="No iframes to export"
        ></textarea>
        <div class="help-text">Copy these URLs to save your current dashboard layout</div>
        ${this.copySuccess ? html`<div class="success-message">Copied to clipboard!</div>` : ''}
      </div>
      <div class="button-group">
        <button
          type="button"
          class="copy-button ${this.copySuccess ? 'success' : ''}"
          @click=${this._handleCopyExport}
          ?disabled=${this.currentUrls.length === 0}
        >
          ${this.copySuccess ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>

      <hr class="section-divider" />

      <div class="section-label">Import URLs</div>
      <div class="form-group">
        <textarea
          id="import-textarea"
          class="${this.importError ? 'error' : ''}"
          placeholder="Paste URLs here, one per line&#10;https://example.com&#10;https://example.org"
          @input=${this._handleImportInput}
        ></textarea>
        <div class="help-text">Enter one URL per line. Invalid URLs will be skipped.</div>
        <div class="error-message ${this.importError ? 'visible' : ''}">
          ${this.importError}
        </div>
      </div>
      <div class="button-group-left">
        <button
          type="button"
          class="cancel-button"
          @click=${this._handleCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          class="import-button"
          @click=${this._handleImport}
        >
          Import URLs
        </button>
      </div>
    `;
  }

  private _setTab(tab: ModalTab) {
    this.activeTab = tab;
    this.hasError = false;
    this.importError = '';

    if (tab === 'add') {
      setTimeout(() => {
        this.urlInput?.focus();
      }, 0);
    }
  }

  private _handleBackdropClick() {
    this._close();
  }

  private _stopPropagation(e: Event) {
    e.stopPropagation();
  }

  private _handleCancel() {
    this._close();
  }

  private _handleInput() {
    // Clear error state when user types
    if (this.hasError) {
      this.hasError = false;
    }
  }

  private _handleInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._handleAdd();
    }
  }

  private _handleImportInput() {
    // Clear error state when user types
    if (this.importError) {
      this.importError = '';
    }
  }

  private _isValidUrl(url: string): boolean {
    if (!url.trim()) {
      return false;
    }
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private _handleAdd() {
    const url = this.urlInput.value.trim();

    if (!this._isValidUrl(url)) {
      this.hasError = true;
      return;
    }

    // Dispatch add-iframe event with the URL
    this.dispatchEvent(
      new CustomEvent('add-iframe', {
        bubbles: true,
        composed: true,
        detail: { url },
      })
    );

    // Clear the input
    this.urlInput.value = '';
    this.hasError = false;

    // Close the modal
    this._close();
  }

  private async _handleCopyExport() {
    const exportText = this.currentUrls.join('\n');

    try {
      await navigator.clipboard.writeText(exportText);
      this.copySuccess = true;

      // Reset success state after 2 seconds
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }

  private _handleImport() {
    const text = this.importTextarea.value.trim();

    if (!text) {
      this.importError = 'Please enter at least one URL';
      return;
    }

    // Parse URLs from textarea (one per line)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const validUrls: string[] = [];
    const invalidLines: number[] = [];

    lines.forEach((line, index) => {
      if (this._isValidUrl(line)) {
        validUrls.push(line);
      } else {
        invalidLines.push(index + 1);
      }
    });

    if (validUrls.length === 0) {
      this.importError = 'No valid URLs found. URLs must start with http:// or https://';
      return;
    }

    // Dispatch import event with valid URLs
    this.dispatchEvent(
      new CustomEvent('import-urls', {
        bubbles: true,
        composed: true,
        detail: { urls: validUrls },
      })
    );

    // Clear the textarea
    this.importTextarea.value = '';
    this.importError = '';

    // Close the modal
    this._close();
  }

  private _close() {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('modal-close', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'add-iframe-modal': AddIframeModal;
  }
}
