/**
 * Configuration for a single iframe panel in the dashboard
 */
export interface IframeConfig {
  /** Unique identifier for the iframe */
  id: string;
  /** URL to load in the iframe */
  url: string;
  /** Grid position of the iframe */
  position: {
    /** Row index (0-based) */
    row: number;
    /** Column index (0-based) */
    col: number;
  };
}

/**
 * Configuration for the grid layout
 */
export interface GridConfig {
  /** Number of columns in the grid */
  columns: number;
  /** Number of rows in the grid */
  rows: number;
  /** Relative width ratios for each column (e.g., [1, 2, 1] for 25%-50%-25%) */
  columnRatios: number[];
  /** Relative height ratios for each row */
  rowRatios: number[];
}

/**
 * Complete workspace state for persistence
 */
export interface WorkspaceState {
  /** Array of iframe configurations */
  iframes: IframeConfig[];
  /** Grid layout configuration */
  grid: GridConfig;
}

/**
 * A saved preset containing a set of URLs
 */
export interface SavedPreset {
  /** Unique identifier for the preset */
  id: string;
  /** User-defined name for the preset */
  name: string;
  /** Array of URLs in this preset */
  urls: string[];
  /** Timestamp when the preset was created */
  createdAt: number;
}
