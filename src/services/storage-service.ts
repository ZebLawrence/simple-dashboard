import type { WorkspaceState, SavedPreset } from '../types/index.js';

const STORAGE_KEY = 'dashboard-workspace-state';
const PRESETS_STORAGE_KEY = 'dashboard-saved-presets';

/**
 * Service for persisting workspace state to localStorage
 */
export class StorageService {
  private storageKey: string;

  constructor(storageKey: string = STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  /**
   * Save workspace state to localStorage
   * @param state - The workspace state to save
   * @returns true if save was successful, false if storage quota exceeded
   */
  save(state: WorkspaceState): boolean {
    try {
      const json = JSON.stringify(state);
      localStorage.setItem(this.storageKey, json);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded:', error);
        return false;
      }
      throw error;
    }
  }

  /**
   * Load workspace state from localStorage
   * @returns The loaded workspace state, or null if not found or invalid
   */
  load(): WorkspaceState | null {
    try {
      const json = localStorage.getItem(this.storageKey);
      if (!json) {
        return null;
      }
      const parsed = JSON.parse(json);
      if (!this.isValidWorkspaceState(parsed)) {
        console.error('Invalid workspace state in storage, clearing...');
        this.clear();
        return null;
      }
      return parsed;
    } catch (error) {
      console.error('Error loading workspace state:', error);
      this.clear();
      return null;
    }
  }

  /**
   * Clear saved workspace state from localStorage
   */
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Validate that a parsed object is a valid WorkspaceState
   */
  private isValidWorkspaceState(obj: unknown): obj is WorkspaceState {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    const state = obj as Record<string, unknown>;

    // Validate iframes array
    if (!Array.isArray(state.iframes)) {
      return false;
    }

    for (const iframe of state.iframes) {
      if (!this.isValidIframeConfig(iframe)) {
        return false;
      }
    }

    // Validate grid config
    if (!this.isValidGridConfig(state.grid)) {
      return false;
    }

    return true;
  }

  /**
   * Validate that an object is a valid IframeConfig
   */
  private isValidIframeConfig(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    const config = obj as Record<string, unknown>;

    if (typeof config.id !== 'string' || config.id.length === 0) {
      return false;
    }

    if (typeof config.url !== 'string' || config.url.length === 0) {
      return false;
    }

    // Label is optional, but if present must be a string
    if (config.label !== undefined && typeof config.label !== 'string') {
      return false;
    }

    if (!config.position || typeof config.position !== 'object') {
      return false;
    }

    const position = config.position as Record<string, unknown>;
    if (typeof position.row !== 'number' || typeof position.col !== 'number') {
      return false;
    }

    if (position.row < 0 || position.col < 0) {
      return false;
    }

    return true;
  }

  /**
   * Validate that an object is a valid GridConfig
   */
  private isValidGridConfig(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    const config = obj as Record<string, unknown>;

    if (typeof config.columns !== 'number' || config.columns < 1) {
      return false;
    }

    if (typeof config.rows !== 'number' || config.rows < 1) {
      return false;
    }

    if (!Array.isArray(config.columnRatios)) {
      return false;
    }

    if (!Array.isArray(config.rowRatios)) {
      return false;
    }

    // Verify ratio arrays have correct length
    if (config.columnRatios.length !== config.columns) {
      return false;
    }

    if (config.rowRatios.length !== config.rows) {
      return false;
    }

    // Verify all ratios are positive numbers
    for (const ratio of config.columnRatios) {
      if (typeof ratio !== 'number' || ratio <= 0) {
        return false;
      }
    }

    for (const ratio of config.rowRatios) {
      if (typeof ratio !== 'number' || ratio <= 0) {
        return false;
      }
    }

    return true;
  }

  // ==================== Preset Management ====================

  /**
   * Get all saved presets
   */
  getPresets(): SavedPreset[] {
    try {
      const json = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (!json) {
        return [];
      }
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) {
        return [];
      }
      // Filter out any invalid presets
      return parsed.filter((p: unknown) => this.isValidPreset(p));
    } catch (error) {
      console.error('Error loading presets:', error);
      return [];
    }
  }

  /**
   * Save a new preset
   */
  savePreset(name: string, urls: string[]): SavedPreset | null {
    try {
      const presets = this.getPresets();
      const newPreset: SavedPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        urls,
        createdAt: Date.now(),
      };
      presets.push(newPreset);
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
      return newPreset;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded:', error);
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete a preset by ID
   */
  deletePreset(id: string): boolean {
    try {
      const presets = this.getPresets();
      const filtered = presets.filter(p => p.id !== id);
      if (filtered.length === presets.length) {
        return false; // Preset not found
      }
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting preset:', error);
      return false;
    }
  }

  /**
   * Get a preset by ID
   */
  getPreset(id: string): SavedPreset | null {
    const presets = this.getPresets();
    return presets.find(p => p.id === id) || null;
  }

  /**
   * Validate that an object is a valid SavedPreset
   */
  private isValidPreset(obj: unknown): obj is SavedPreset {
    if (!obj || typeof obj !== 'object') {
      return false;
    }
    const preset = obj as Record<string, unknown>;
    if (typeof preset.id !== 'string' || preset.id.length === 0) {
      return false;
    }
    if (typeof preset.name !== 'string' || preset.name.length === 0) {
      return false;
    }
    if (!Array.isArray(preset.urls)) {
      return false;
    }
    if (typeof preset.createdAt !== 'number') {
      return false;
    }
    return true;
  }
}

// Export a default instance for convenience
export const storageService = new StorageService();
