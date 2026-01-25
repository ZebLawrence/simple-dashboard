import { css, unsafeCSS } from 'lit';

/**
 * Warm dark grey theme color palette for the dashboard
 *
 * Colors:
 * - Background: #1c1b1a (primary dark warm grey)
 * - Surface: #2a2826 (cards, panels, elevated surfaces)
 * - Border: #3d3937 (borders, dividers, subtle separators)
 * - Accent: #e07850 (warm coral - buttons, highlights, branding)
 * - Accent hover: #f08a62 (accent on hover)
 * - Accent active: #c66840 (accent when pressed)
 * - Text primary: #eae8e6 (main text color - warm white)
 * - Text secondary: #d8d4d0 (slightly dimmer text)
 * - Text muted: #9a9590 (subdued text, placeholders)
 * - Text label: #a8a29e (form labels, secondary info)
 * - Focus: #c9a87c (warm amber focus rings)
 */

export const themeColors = {
  background: '#1c1b1a',
  surface: '#2a2826',
  border: '#3d3937',
  accent: '#e07850',
  accentHover: '#f08a62',
  accentActive: '#c66840',
  textPrimary: '#eae8e6',
  textSecondary: '#d8d4d0',
  textMuted: '#9a9590',
  textLabel: '#a8a29e',
  focus: '#c9a87c',
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
