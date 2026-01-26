# Simple Dashboard

A client-side iframe dashboard workspace built with Lit web components. Manage multiple website iframes in a resizable grid layout with persistent state.

*Arrange multiple websites in a resizable grid — perfect for monitoring dashboards, documentation, or multi-tasking.*

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (or npm/yarn)

## Features

- 🖼️ **Multi-iframe grid** - Display multiple websites side by side
- 📐 **Resizable panels** - Drag dividers to resize columns and rows
- 💾 **Persistent state** - Layout and URLs saved to localStorage
- 📦 **URL presets** - Save and load sets of URLs
- 📤 **Import/Export** - Share configurations via clipboard
- 🌙 **Dark theme** - Easy on the eyes

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. Click the **+** button to add a new iframe
2. Enter a URL (must include `https://`)
3. Drag the dividers between panels to resize
4. Your layout is automatically saved

> **Note:** URLs must use HTTPS. Many sites block embedding via `X-Frame-Options` or CSP headers — if a site doesn't load, it's likely blocking iframe embedding for security reasons.

### URL Presets

- Save your current URLs as a preset for quick access
- Load presets to switch between different workspace configurations

### Import/Export

- Export your current URLs to share with others
- Import URLs from a newline-separated list

## Development

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run E2E tests with browser visible
pnpm test:e2e:headed

# Type check
pnpm typecheck

# Build for production
pnpm build
```

## Tech Stack

- **[Lit](https://lit.dev/)** - Web components framework
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Web Test Runner](https://modern-web.dev/docs/test-runner/overview/)** - Unit testing
- **[Playwright](https://playwright.dev/)** - E2E testing

## Project Structure

```
src/
├── components/          # Lit web components
│   ├── dashboard-app.ts    # Root component
│   ├── iframe-grid.ts      # Grid layout manager
│   ├── iframe-panel.ts     # Individual iframe wrapper
│   ├── grid-divider.ts     # Resizable divider
│   ├── add-iframe-modal.ts # URL input modal
│   └── add-iframe-button.ts # Floating action button
├── services/
│   └── storage-service.ts  # localStorage persistence
├── styles/
│   └── theme.ts            # Color theme
├── types/
│   └── index.ts            # TypeScript interfaces
└── index.ts                # Entry point

e2e/                     # Playwright E2E tests
```

## License

ISC
