# NOC Port Monitor - Chrome Extension

Chrome MV3 side panel extension for monitoring router port status changes from NOC Portal.

Built with React 19 + Vite 6 + Tailwind CSS 4.

## Features

- **Scheduler**: Automated log collection at configurable intervals (1h, 2h, 3h, 6h)
- **Manual Check**: Check all routers or individual router on demand
- **Port Status Tracking**: Detects UP/DOWN events with timestamps
- **Router Accordion**: Expandable list showing affected ports per router
- **Status Indicators**: Green (all ports UP), Red (any port DOWN), Gray (no data)
- **New Badge**: Visual indicator for routers with state changes since last viewed
- **Persistent Background**: Service worker runs while NOC Portal tab is open
- **Auto Session Detection**: Detects login state and session from NOC Portal cookies
- **Side Panel Modes**: Global (all tabs) or Scoped (NOC Portal only)
- **Notifications**: Real-time feedback in footer for all operations

## Architecture

```
noc-port-monitor/
├── public/
│   ├── manifest.json       # MV3 manifest
│   └── assets/             # Extension icons
├── src/
│   ├── background.js       # Service worker (alarms, messages, context menus)
│   ├── content.js          # Session/auth detection on NOC Portal
│   ├── hooks/              # Custom React hooks
│   │   ├── index.js
│   │   ├── useAsyncAction.js
│   │   ├── useChromeStorage.js
│   │   ├── useCountdown.js
│   │   ├── useNotification.js
│   │   └── useToggle.js
│   ├── constants/          # Configuration constants
│   │   ├── api.js          # API endpoints
│   │   ├── frequencies.js  # Scheduler frequency options
│   │   ├── menu.js         # Context menu IDs
│   │   ├── notifications.js # Notification types and messages
│   │   ├── patterns.js     # Log parsing patterns
│   │   ├── routers.js      # Router definitions
│   │   ├── status.js       # Status indicator colors
│   │   ├── storage.js      # Storage keys and defaults
│   │   └── tags.js         # Tag component colors
│   ├── utils/              # Shared utilities
│   │   ├── api.js          # API call functions
│   │   ├── fetcher.js      # Router data fetching
│   │   ├── helpers.js      # Date/time formatters
│   │   ├── notify.js       # Global notification system
│   │   ├── parser.js       # Log parsing utilities
│   │   └── storage.js      # Chrome storage operations
│   └── app/
│       ├── index.html      # Side panel entry
│       ├── app.jsx         # React app root
│       ├── app.css         # Tailwind 4 styles with @theme
│       ├── config.js       # App configuration (URL, UID, locale)
│       └── components/     # React components
│           ├── Accordion.jsx
│           ├── AccordionBody.jsx
│           ├── AccordionHeader.jsx
│           ├── AccordionItem.jsx
│           ├── AccordionSubheader.jsx
│           ├── Auth.jsx
│           ├── Badge.jsx
│           ├── Button.jsx
│           ├── Event.jsx
│           ├── Footer.jsx
│           ├── Header.jsx
│           ├── Main.jsx
│           ├── Manual.jsx
│           ├── Port.jsx
│           ├── Scheduler.jsx
│           ├── Select.jsx
│           ├── Status.jsx
│           └── Tag.jsx
├── vite.config.js          # Vite build configuration
└── package.json
```

## Tech Stack

- **React 19** - UI framework with functional components and hooks
- **Vite 6** - Build tool with HMR and optimized production builds
- **Tailwind CSS 4** - Utility-first CSS with `@theme` directive for custom properties
- **Lucide React** - Icon library
- **Chrome Extension MV3** - Service worker, side panel, alarms, storage APIs

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Installation

1. Run `npm run build` to generate the `dist/` folder
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the `dist/` folder

## Usage

1. **Login** to https://nocportal.telekom.rs
2. **Click extension icon** in toolbar to open the side panel
3. **Enable Scheduler** and select frequency, or
4. **Click Check** to run manual check

### Authentication States

| State | Screen |
|-------|--------|
| Not logged in | "Please login to NOC Portal" |
| No session | "Open NOC Portal to detect session" |
| Logged in | Main interface |

### Scheduler

- Toggle ON/OFF with switch
- Frequency options: 1h, 2h, 3h, 6h
- Countdown timer shows time until next check
- Checks all routers automatically
- Uses chrome.alarms API for reliability

### Manual Check

- Select "All Routers" or specific router from dropdown
- Click "Check" button
- Status bar shows current checking progress

### Router Accordion

Each router shows:
- **Header**: Status indicator (colored dot), router name, "NEW" badge, affected port count, chevron
- **Subheader**: Vendor tag, network type tag, model, IP address
- **Body**: Port groups with chronological UP/DOWN events

Clicking header opens/closes accordion and dismisses "NEW" badge.

### Reboot Button

Clears all storage and reinitializes extension to default state.

## Port Detection

Log events are parsed using specific patterns:

| Event | Pattern |
|-------|---------|
| UP | `CID=0x80fc05ad` + `alarmID=0x0813005b` + `clearType=service_resume` |
| DOWN | `CID=0x80fc051d` + `alarmID=0x0813005b` |

Port names are extracted and formatted as "Port #X/Y/Z".

## Storage Schema

```javascript
// chrome.storage.local
{
  schedulerEnabled: boolean,        // Scheduler toggle state
  schedulerFrequency: number,       // Minutes (60, 120, 180, 360)
  schedulerStartTime: number,       // Timestamp when scheduler was enabled
  sessionId: string | null,         // NOC Portal session cookie
  authState: 'logged_in' | 'logged_out' | 'unknown',
  routerData: {
    [routerId]: {
      routerId: string,
      routerName: string,
      ports: { [portId]: [{ state, port, timestamp, date, raw }] },
      totalEvents: number,
      affectedPorts: number,
      hasIssues: boolean,
      lastUpdated: number,
      lastSeenState: 'seen' | null
    }
  },
  lastCheck: number                 // Timestamp of last completed check
}

// chrome.storage.sync
{
  sidePanelMode: boolean            // Global mode toggle
}
```

## API Endpoints

Three-step wizard process for fetching router logs:

| Step | Endpoint |
|------|----------|
| 1. Create wizard | `/web/dataset/call_kw/mts.router.switch.command.wizard/create` |
| 2. Execute command | `/web/dataset/call_button` |
| 3. Read output | `/web/dataset/call_kw/mts.router.switch.command.wizard/read` |

## Routers

30 preconfigured routers in `src/constants/routers.js`:
- 2 TRANSIT (N-PE)
- 26 MAN (U-PE)
- 2 MOB (U-PE-MOB)

## Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Persist router data and settings |
| `alarms` | Scheduled check intervals |
| `cookies` | Session detection from NOC Portal |
| `sidePanel` | Enable side panel UI |
| `tabs` | React to tab changes for scoped mode |
| `contextMenus` | Right-click menu for mode selection |
| `host_permissions` | API access to nocportal.telekom.rs |

## Version History
- **v3.4.3** - Fixed NEW badge state being overwritten during router check
- **v3.4.2** - Reverted event sorting to newest first
- **v3.4.1** - Fixed NEW badge reappearing during router check when switching between routers
- **v3.4.0** - Updated Port and Event component styling (monospace font, colored backgrounds)
- **v3.3.2** - Updated app.css to style `webkit-scrollbar` correctly
- **v3.3.1** - Fixed NEW badge logic: shows only when new ports/events added, persists "seen" state
- **v3.3.0** - Live router name in status bar during check
- **v3.2.2** - Fixed status logic to check only last event per port
- **v3.2.1** - Removed `NOTIFICATION_TYPES` constant
- **v3.2.0** - Updated status indicator logic based on port events
  - `usePortStatus` hook: Gray (default), Red (any DOWN), Green (all UP)
- **v3.1.0** - Refactored to use custom hooks (`src/hooks/`)
  - `useChromeStorage` / `useChromeStorageMulti` - Chrome storage sync with listeners
  - `useCountdown` - Interval-based countdown timer
  - `useAsyncAction` - Loading state wrapper for async operations
  - `useNotification` - Notification state with auto-clear
  - `useToggle` - Boolean toggle state
- **v3.0.2** - Fixed Vite build asset paths for Chrome extension compatibility
- **v3.0.1** - Fixed side panel path in manifest, added cookie fallback for session detection
- **v3.0.0** - Complete rewrite with React 19 + Vite 6 + Tailwind CSS 4
  - Modern React architecture with functional components and hooks
  - Tailwind 4 with CSS-based configuration (`@theme`, `@source`)
  - Modular component structure (Accordion, Status, Badge, Tag, etc.)
  - Global notification system via callback pattern
  - Real-time storage sync for scheduler, router data, and auth state
  - Proper countdown timer based on alarm start time
  - Content script scoped to NOC Portal only
  - Path aliases (`@`) for clean imports
- **v2.5.2** - Fixed Global/Scoped mode side panel behavior
- **v2.5.1** - Fixed NEW badge reappearing during scan after being dismissed
- **v2.5.0** - UI restructure: moved scheduler/manual sections into header, router accordion wrapped in main tag
- **v2.4.0** - Moved "Reboot extension" to context menu, removed reboot button from UI
- **v2.3.0** - Context menu (right-click extension icon) for Global/Scoped mode selection, synced via chrome.storage.sync
- **v2.2.0** - Side Panel API with global/scoped modes, tab listeners for dynamic panel control
- **v2.1.0** - Open side panel by left clicking on extension icon
- **v2.0.0** - Migrated from popup to side panel extension, responsive UI sizing
- **v1.6.1** - Removed resizable popup, fixed popup height to 600px
- **v1.6.0** - Modular architecture refactor, code organized into modules/ directory
- **v1.5.0** - Live router name in status bar during scan, accordion state preserved on updates, single-click badge removal
- **v1.4.0** - Incremental scan progress updates, countdown on first scheduler enable, centered auth screen
- **v1.3.0** - Separated Scheduler/Manual sections, footer status bar, "new" badge on router state changes, port display as "Port #X/Y/Z"
- **v1.2.0** - Improved indicator logic (checks last port state), resizable popup toggle, date format DD-MM-YYYY HH:MM:SS
- **v1.1.0** - Added countdown timer for next scheduled scan, fixed log timestamp UTC parsing
- **v1.0.0** - Complete rewrite with scheduler, accordion UI, background service worker
