# Development Guide

This guide covers setting up the development environment and workflows for the NOC Port Monitor.

## Prerequisites

- **Node.js**: Ensure you have a recent version of Node.js installed (LTS recommended).
- **npm**: Comes with Node.js.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server. Useful for developing the React UI (`src/app`) in a browser environment. |
| `npm run build` | Compiles the extension for production into the `dist` folder. |
| `npm run preview` | Preview the production build locally. |

## Workflow

### Developing the UI (Popup/Options)

You can develop the React portion of the extension just like a normal web app.

1.  Run `npm run dev`.
2.  Open the localhost URL provided by Vite.
3.  Changes to `src/app` will hot-reload.

### Developing Extension Scripts (Background/Content)

Because Chrome Extensions require specific contexts (Service Workers, Page Injection), you often need to rebuild and reload the extension in Chrome to test changes in `background.js` or `content.js`.

1.  Make changes to your code.
2.  Run `npm run build`.
3.  Go to `chrome://extensions`.
4.  Find **NOC Port Monitor**.
5.  Click the **Refresh** (circular arrow) icon.
6.  Reload any web pages where the content script is active.

## Debugging

- **Popup/Options**: Right-click the extension popup and select **Inspect** to open DevTools.
- **Background Script**: In `chrome://extensions`, click the "service worker" link under the extension ID to open a dedicated DevTools window.
- **Content Script**: Use the standard DevTools (F12) on the web page where the script is injected.
