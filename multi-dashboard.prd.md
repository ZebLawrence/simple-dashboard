# Iframe Dashboard Workspace - PRD & Implementation Plan

## Overview
A single-page, client-side dashboard workspace that allows users to display multiple websites in iframes arranged in a flexible grid layout. All data persists in browser local storage.

---

## Features

### 1. Flexible Grid Layout
- Display 1 or more iframes in a grid arrangement
- **Draggable dividers** between cells to resize columns and rows
- Grid automatically fills available viewport space
- Responsive: handles window resize gracefully

### 2. Add Iframe
- **Floating "+" button** (bottom-right corner)
- Opens a **modal dialog** to enter URL
- New iframe added to next available grid cell
- Grid expands as needed (adds rows/columns)

### 3. Iframe Panel Controls (Hover Toolbar)
Each iframe displays a toolbar on hover with:
- **Close (X)** - Remove iframe from workspace
- **Edit URL** - Change the iframe source
- **Refresh** - Reload the iframe content
- **Fullscreen** - Expand iframe to fill entire viewport (with escape to exit)

### 4. Persistence
- Save to **localStorage**:
  - List of iframe URLs
  - Grid configuration (rows, columns, sizing ratios)
- Auto-save on any change
- Auto-load on page open

### 5. Visual Design
- **Dark mode** theme
- Minimal chrome - maximize iframe viewing space
- Subtle borders/dividers between panels
- Smooth transitions for hover states and modals

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Components | **Lit** with TypeScript |
| Styling | CSS (within Lit components) |
| Unit Testing | **open-wc** testing |
| E2E Testing | **Playwright** |
| Build | Vite (recommended for Lit projects) |
| Package Manager | npm |

---

## Component Architecture

```
src/
├── components/
│   ├── dashboard-app.ts        # Root app shell
│   ├── iframe-grid.ts          # Grid container with resizable layout
│   ├── iframe-panel.ts         # Single iframe with hover toolbar
│   ├── add-iframe-button.ts    # Floating "+" button
│   ├── add-iframe-modal.ts     # URL input modal dialog
│   └── grid-divider.ts         # Draggable resize handle
├── services/
│   └── storage-service.ts      # localStorage read/write
├── types/
│   └── index.ts                # TypeScript interfaces
├── styles/
│   └── theme.ts                # Dark mode CSS variables
└── index.ts                    # Entry point
```

---

## Data Model

```typescript
interface WorkspaceState {
  iframes: IframeConfig[];
  grid: GridConfig;
}

interface IframeConfig {
  id: string;
  url: string;
  position: { row: number; col: number };
}

interface GridConfig {
  columns: number;
  rows: number;
  columnRatios: number[];  // e.g., [1, 2, 1] for 25%-50%-25%
  rowRatios: number[];
}
```

---

## Implementation Steps

### Phase 1: Project Setup
1. Initialize npm project with TypeScript
2. Install Lit and configure Vite
3. Set up open-wc testing
4. Set up Playwright
5. Create basic project structure

### Phase 2: Core Components
1. Create `dashboard-app` root component
2. Create `iframe-panel` component with basic iframe display
3. Create `iframe-grid` with CSS Grid layout
4. Implement static grid rendering

### Phase 3: Grid Resizing
1. Create `grid-divider` component for drag handles
2. Implement drag-to-resize logic
3. Update CSS Grid template on drag
4. Handle edge cases (min sizes, bounds)

### Phase 4: Add/Remove Iframes
1. Create `add-iframe-button` (floating action button)
2. Create `add-iframe-modal` with URL input
3. Implement add iframe logic
4. Implement close/remove from hover toolbar

### Phase 5: Iframe Toolbar
1. Implement hover detection on `iframe-panel`
2. Add toolbar overlay with icons
3. Implement Edit URL functionality
4. Implement Refresh functionality
5. Implement Fullscreen mode

### Phase 6: Persistence
1. Create `storage-service` for localStorage
2. Auto-save workspace state on changes
3. Auto-load state on app initialization
4. Handle empty/first-load state

### Phase 7: Polish & Testing
1. Apply dark mode styling throughout
2. Add transitions and hover effects
3. Write open-wc unit tests for each component
4. Write Playwright e2e tests for user flows

---

## Verification Plan

### Unit Tests (open-wc)
- Each component renders correctly
- Toolbar actions dispatch correct events
- Storage service saves/loads correctly
- Grid calculations are accurate

### E2E Tests (Playwright)
- Add a new iframe via modal
- Remove an iframe via toolbar
- Edit an iframe URL
- Resize grid by dragging dividers
- Fullscreen toggle works
- State persists after page reload

### Manual Testing
- Open in browser, add multiple iframes
- Resize grid sections
- Refresh page and verify state restored
- Test with various websites in iframes

---

## Out of Scope (Minimal MVP)
- Preset layout buttons
- Named/saved workspaces
- Drag-to-reorder panels
- Light mode / theme toggle
- Keyboard shortcuts
- Import/export configuration
