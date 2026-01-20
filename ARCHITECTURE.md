# Architecture Overview

This document outlines the technical architecture of the NOC Port Monitor Chrome Extension.

## Project Structure

The project follows a standard Vite + React structure, adapted for Chrome Extension development.

```text
noc-port-monitor/
├── src/
│   ├── app/            # The main UI (Popup/Options page)
│   │   └── index.html  # Entry point for the React application
│   ├── background.js   # Service Worker (Background script)
│   └── content.js      # Content Script (Injected into web pages)
├── dist/               # Production build output
├── public/             # Static assets (manifest.json, icons)
└── vite.config.js      # Vite configuration
```

## Build System

The project uses **Vite** for bundling, configured specifically to handle multiple entry points required by Chrome Extensions.

### Configuration (`vite.config.js`)

Unlike a standard Single Page Application (SPA), a Chrome Extension requires distinct entry points that cannot be code-split together in the traditional way.

1.  **Entry Points**:
    -   `app`: The React application (Popup or Options page).
    -   `background`: The background service worker.
    -   `content`: The content script.

2.  **Output Strategy**:
    -   The build outputs to the `dist` directory.
    -   **File Naming**:
        -   `background.js` and `content.js` are output with fixed filenames (no hashing) to ensure they match the references in `manifest.json`.
        -   UI assets (React app chunks) use standard hashing (`assets/[name]-[hash].js`) for cache busting.

### Tailwind CSS v4

Tailwind is integrated via the `@tailwindcss/vite` plugin. It scans source files for class names and generates the necessary CSS at build time.

## Extension Components

### 1. The App (`src/app`)
This is a standard React 19 application. It uses `react-dom` to render the interface. This component likely serves as the extension's **Popup** (clicked from the toolbar) or **Options** page.

### 2. Background Script (`src/background.js`)
Runs as a service worker. It handles:
- Extension lifecycle events.
- Network requests (if applicable).
- State management that persists across tabs.

### 3. Content Script (`src/content.js`)
Runs in the context of web pages. It handles:
- DOM manipulation.
- Scraping data from specific NOC monitoring tools/pages.
