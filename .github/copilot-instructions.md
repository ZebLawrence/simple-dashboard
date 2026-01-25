# Simple Dashboard - AI Coding Agent Instructions

## Project Overview
Client-side iframe dashboard workspace using Lit web components. Users manage multiple website iframes in a resizable grid, persisted to localStorage.

## Architecture Patterns

### Component Structure (Lit + TypeScript)
- **All components are Lit web components** using `@customElement` decorator
- Collocated tests: each component has a corresponding `.test.ts` file in the same directory
- Event-driven communication: components emit custom events (bubbles: true, composed: true) and parent components listen
- Example: `iframe-panel` emits `remove-iframe`, `dashboard-app` handles it

### State Management
- State flows top-down from `dashboard-app.ts` (root component)
- Use `@state()` for private reactive state, `@property()` for public props
- All workspace state persists through `storage-service.ts` to localStorage
- Auto-save pattern: every state mutation triggers immediate `storageService.save()`

### Grid Layout System
The grid uses CSS Grid with interleaved dividers:
- Grid template: `1fr 4px 2fr` (panel, divider, panel)
- Ratios stored as numbers (e.g., `[1, 2]` means 33%-67%)
- Dividers emit `divider-drag-complete` events with new ratios
- **Critical**: `iframe-grid.ts` manages drag state and ratio calculations

### Type System
All interfaces defined in [src/types/index.ts](src/types/index.ts):
- `IframeConfig`: id, url, position {row, col}
- `GridConfig`: columns, rows, columnRatios, rowRatios
- `WorkspaceState`: iframes[], grid

## Developer Workflows

### Running & Testing
```bash
pnpm dev              # Start Vite dev server on port 3000
pnpm test             # Unit tests via Web Test Runner + Puppeteer
pnpm test:e2e         # Playwright E2E tests (auto-starts dev server)
pnpm build            # Production build
```

### Testing Conventions
- **Unit tests**: Use `@open-wc/testing` with `fixture()` helper
  - Import the component: `import './dashboard-app.js'`
  - Query shadow DOM: `el.shadowRoot!.querySelector('...')`
  - Clean up localStorage after each test
- **E2E tests**: Playwright with shadow DOM locators
  - Pattern: `page.locator('dashboard-app').locator('add-iframe-button')`
  - Clear localStorage in `beforeEach` hooks

### Web Test Runner Config
- Single file concurrency (`concurrency: 1`) to prevent localStorage conflicts
- Uses Puppeteer launcher (not Playwright)
- Esbuild plugin for TypeScript transformation

## Critical Conventions

### Shadow DOM Queries
Access nested elements via shadow roots:
```typescript
const modal = el.shadowRoot!.querySelector('add-iframe-modal');
const input = modal!.shadowRoot!.querySelector('#url-input');
```

### Event Dispatch Pattern
```typescript
this.dispatchEvent(new CustomEvent('event-name', {
  bubbles: true,
  composed: true,  // Required for shadow DOM
  detail: { /* data */ }
}));
```

### Styling
- Theme defined in [src/styles/theme.ts](src/styles/theme.ts) with warm dark grey palette
- CSS-in-JS using Lit's `css` tagged template
- Global theme applied via `applyGlobalTheme()` in dashboard-app
- Use CSS custom properties: `var(--color-background)`

### ID Generation
Use timestamp + random: `iframe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

## Dependencies & Integration

### Key Libraries
- **Lit 3.x**: Web components framework
- **Vite**: Dev server and build tool (ES modules, no bundler config needed)
- **pnpm**: Package manager (specified in packageManager field)
- **Web Test Runner**: Unit tests (not Jest/Vitest)
- **Playwright**: E2E tests only

### File Extensions
- Always use `.js` extensions in imports (even for `.ts` files): `import './component.js'`
- This is required for ES modules to work correctly

## Common Patterns

### Adding New Components
1. Create `component-name.ts` and `component-name.test.ts` in `src/components/`
2. Use `@customElement('component-name')` with hyphenated name
3. Import with `.js` extension: `import './component-name.js'`
4. Register event listeners in parent's render method: `@event-name=${handler}`

### Storage Service Usage
```typescript
const state = { iframes: this.iframes, grid: this.grid };
storageService.save(state);  // Auto-validates and handles quota errors
const loaded = storageService.load();  // Returns null if invalid
```

### Grid Position Calculation
Next position logic in `dashboard-app.ts`:
- Fill cells left-to-right, top-to-bottom
- Expand grid when all cells occupied
- See `_getNextGridPosition()` method

## Gotchas
- Never use `&&` in PowerShell commands (Windows environment) - use `;` instead
- localStorage is synchronous - all saves happen immediately
- Iframe refresh requires setting src to empty then back to URL
- Fullscreen mode needs both CSS positioning and event handling for Escape key
