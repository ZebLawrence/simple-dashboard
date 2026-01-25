import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import type { SavedPreset } from '../types/index.js';
import { storageService } from '../services/storage-service.js';

type ModalTab = 'add' | 'import-export' | 'presets';

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

  @state()
  private savedPresets: SavedPreset[] = [];

  @state()
  private presetNameInput = '';

  @state()
  private presetSaveError = '';

  @state()
  private presetSaveSuccess = false;

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
    this.presetNameInput = '';
    this.presetSaveError = '';
    this.presetSaveSuccess = false;

    // Load saved presets
    this.savedPresets = storageService.getPresets();

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

    .preset-list {
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 16px;
    }

    .preset-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background-color: #2a2826;
      border: 1px solid #3d3937;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .preset-item:last-child {
      margin-bottom: 0;
    }

    .preset-info {
      flex: 1;
      min-width: 0;
    }

    .preset-name {
      color: #eae8e6;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preset-meta {
      color: #7a7572;
      font-size: 12px;
    }

    .preset-actions {
      display: flex;
      gap: 8px;
      margin-left: 12px;
    }

    .preset-actions button {
      padding: 6px 12px;
      font-size: 12px;
    }

    .load-button {
      background-color: #e07850;
      border: none;
      color: #eae8e6;
    }

    .load-button:hover {
      background-color: #f08a62;
    }

    .delete-button {
      background-color: transparent;
      border: 1px solid #3d3937;
      color: #a8a29e;
    }

    .delete-button:hover {
      background-color: #3d3937;
      color: #eae8e6;
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: #7a7572;
      font-size: 14px;
    }

    .save-preset-form {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .save-preset-form .form-group {
      flex: 1;
      margin-bottom: 0;
    }

    .save-button {
      background-color: #e07850;
      border: none;
      color: #eae8e6;
    }

    .save-button:hover {
      background-color: #f08a62;
    }

    .save-button:disabled {
      background-color: #3d3937;
      color: #7a7572;
      cursor: not-allowed;
    }
  `;

  override render() {
    return html`
      <div class="backdrop" @click=${this._handleBackdropClick}>
        <div class="modal" @click=${this._stopPropagation}>
          <h2 class="modal-header">Manage Iframes</h2>

          <div class="tabs">
            <button
              type="button"
              class="tab ${this.activeTab === 'add' ? 'active' : ''}"
              @click=${() => this._setTab('add')}
            >
              Add URL
            </button>
            <button
              type="button"
              class="tab ${this.activeTab === 'import-export' ? 'active' : ''}"
              @click=${() => this._setTab('import-export')}
            >
              Import / Export
            </button>
            <button
              type="button"
              class="tab ${this.activeTab === 'presets' ? 'active' : ''}"
              @click=${() => this._setTab('presets')}
            >
              Saved Presets
            </button>
          </div>

          <div class="tab-content">
            ${this.activeTab === 'add'
              ? this._renderAddTab()
              : this.activeTab === 'import-export'
                ? this._renderImportExportTab()
                : this._renderPresetsTab()}
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

  private _renderPresetsTab() {
    return html`
      <div class="section-label">Save Current URLs as Preset</div>
      <div class="save-preset-form">
        <div class="form-group">
          <input
            type="text"
            class="${this.presetSaveError ? 'error' : ''}"
            placeholder="Enter preset name"
            .value=${this.presetNameInput}
            @input=${this._handlePresetNameInput}
            @keydown=${this._handlePresetNameKeydown}
          />
          <div class="error-message ${this.presetSaveError ? 'visible' : ''}">
            ${this.presetSaveError}
          </div>
          ${this.presetSaveSuccess ? html`<div class="success-message">Preset saved!</div>` : ''}
        </div>
        <button
          type="button"
          class="save-button"
          @click=${this._handleSavePreset}
          ?disabled=${this.currentUrls.length === 0}
        >
          Save
        </button>
      </div>
      <div class="help-text" style="margin-bottom: 16px;">
        ${this.currentUrls.length === 0
          ? 'Add some iframes first to save as a preset'
          : `This will save ${this.currentUrls.length} URL${this.currentUrls.length === 1 ? '' : 's'}`}
      </div>

      <hr class="section-divider" />

      <div class="section-label">Your Saved Presets</div>
      ${this.savedPresets.length === 0
        ? html`<div class="empty-state">No saved presets yet</div>`
        : html`
            <div class="preset-list">
              ${this.savedPresets.map(preset => html`
                <div class="preset-item">
                  <div class="preset-info">
                    <div class="preset-name">${preset.name}</div>
                    <div class="preset-meta">
                      ${preset.urls.length} URL${preset.urls.length === 1 ? '' : 's'} ·
                      ${this._formatDate(preset.createdAt)}
                    </div>
                  </div>
                  <div class="preset-actions">
                    <button
                      type="button"
                      class="load-button"
                      @click=${() => this._handleLoadPreset(preset.id)}
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      class="delete-button"
                      @click=${() => this._handleDeletePreset(preset.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              `)}
            </div>
          `}

      <div class="button-group" style="margin-top: 20px;">
        <button
          type="button"
          class="cancel-button"
          @click=${this._handleCancel}
        >
          Close
        </button>
      </div>
    `;
  }

  private _formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private _handlePresetNameInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.presetNameInput = input.value;
    if (this.presetSaveError) {
      this.presetSaveError = '';
    }
    if (this.presetSaveSuccess) {
      this.presetSaveSuccess = false;
    }
  }

  private _handlePresetNameKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._handleSavePreset();
    }
  }

  private _handleSavePreset() {
    const name = this.presetNameInput.trim();

    if (!name) {
      this.presetSaveError = 'Please enter a preset name';
      return;
    }

    if (this.currentUrls.length === 0) {
      this.presetSaveError = 'No URLs to save';
      return;
    }

    const result = storageService.savePreset(name, this.currentUrls);
    if (result) {
      this.savedPresets = storageService.getPresets();
      this.presetNameInput = '';
      this.presetSaveSuccess = true;
      setTimeout(() => {
        this.presetSaveSuccess = false;
      }, 2000);
    } else {
      this.presetSaveError = 'Failed to save preset (storage full)';
    }
  }

  private _handleLoadPreset(presetId: string) {
    const preset = storageService.getPreset(presetId);
    if (!preset) return;

    // Dispatch import event with the preset URLs
    this.dispatchEvent(
      new CustomEvent('import-urls', {
        bubbles: true,
        composed: true,
        detail: { urls: preset.urls },
      })
    );

    // Close the modal
    this._close();
  }

  private _handleDeletePreset(presetId: string) {
    storageService.deletePreset(presetId);
    this.savedPresets = storageService.getPresets();
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
