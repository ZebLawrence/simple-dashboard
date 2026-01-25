import { css, unsafeCSS } from 'lit';

/**
 * Dark theme color palette for the dashboard
 *
 * Colors:
 * - Background: #1a1a2e (primary dark background)
 * - Surface: #16213e (cards, panels, elevated surfaces)
 * - Border: #0f3460 (borders, dividers, subtle separators)
 * - Accent: #e94560 (primary accent - buttons, highlights, branding)
 * - Accent hover: #ff6b6b (accent on hover)
 * - Accent active: #c73e54 (accent when pressed)
 * - Text primary: #eaeaea (main text color)
 * - Text secondary: #e0e0e0 (slightly dimmer text)
 * - Text muted: #9ca3af (subdued text, placeholders)
 * - Text label: #a0a0a0 (form labels, secondary info)
 * - Focus: #4a90d9 (focus rings, interactive highlights)
 */

export const themeColors = {
  background: '#1a1a2e',
  surface: '#16213e',
  border: '#0f3460',
  accent: '#e94560',
  accentHover: '#ff6b6b',
  accentActive: '#c73e54',
  textPrimary: '#eaeaea',
  textSecondary: '#e0e0e0',
  textMuted: '#9ca3af',
  textLabel: '#a0a0a0',
  focus: '#4a90d9',
} as const;

/**
 * CSS custom properties for the theme
 * Apply these to :host or a container element to make them available to children
 */
export const themeStyles = css`
  :host {
    --color-background: ${unsafeCSS(themeColors.background)};
    --color-surface: ${unsafeCSS(themeColors.surface)};
    --color-border: ${unsafeCSS(themeColors.border)};
    --color-accent: ${unsafeCSS(themeColors.accent)};
    --color-accent-hover: ${unsafeCSS(themeColors.accentHover)};
    --color-accent-active: ${unsafeCSS(themeColors.accentActive)};
    --color-text-primary: ${unsafeCSS(themeColors.textPrimary)};
    --color-text-secondary: ${unsafeCSS(themeColors.textSecondary)};
    --color-text-muted: ${unsafeCSS(themeColors.textMuted)};
    --color-text-label: ${unsafeCSS(themeColors.textLabel)};
    --color-focus: ${unsafeCSS(themeColors.focus)};
  }
`;

/**
 * Global styles to apply to the document body
 * Import and use in the main app component or index.html
 */
export const globalThemeStyles = `
  :root {
    --color-background: ${themeColors.background};
    --color-surface: ${themeColors.surface};
    --color-border: ${themeColors.border};
    --color-accent: ${themeColors.accent};
    --color-accent-hover: ${themeColors.accentHover};
    --color-accent-active: ${themeColors.accentActive};
    --color-text-primary: ${themeColors.textPrimary};
    --color-text-secondary: ${themeColors.textSecondary};
    --color-text-muted: ${themeColors.textMuted};
    --color-text-label: ${themeColors.textLabel};
    --color-focus: ${themeColors.focus};
  }

  body {
    margin: 0;
    padding: 0;
    background-color: var(--color-background);
    color: var(--color-text-primary);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
`;

/**
 * Apply global theme styles to the document
 * Call this once at app initialization
 */
export function applyGlobalTheme(): void {
  // Check if theme styles already exist
  if (document.getElementById('dashboard-theme-styles')) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'dashboard-theme-styles';
  styleElement.textContent = globalThemeStyles;
  document.head.appendChild(styleElement);
}
