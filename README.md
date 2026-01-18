# NOC Port Monitor - Chrome Extension

Chrome MV3 side panel extension for monitoring router port status changes from NOC Portal.

## Features

- **Scheduler**: Automated log collection at configurable intervals (1h, 2h, 3h, 6h)
- **Manual Scan**: Scan all routers or individual router on demand
- **Port Status Tracking**: Detects UP/DOWN events with timestamps
- **Router Accordion**: Expandable list showing affected ports per router
- **Status Indicators**: Green (all ports UP), Red (any port DOWN), Gray (no data)
- **New Badge**: Visual indicator for routers with state changes since last viewed
- **Persistent Background**: Service worker runs while NOC Portal tab is open
- **Auto Session Detection**: Detects login state and session from NOC Portal cookies
- **Side Panel Modes**: Global (all tabs) or Scoped (NOC Portal only)

## Architecture

```
noc-port-monitor/
├── manifest.json         # MV3 manifest
├── background.js         # Service worker entry point
├── content.js            # Session/auth detection on NOC Portal
├── app.html              # Side panel UI
├── app.css               # Styles
├── app.js                # UI controller
└── modules/
    ├── constants.js      # App constants and configuration
    ├── routers.js        # Router definitions (30 routers)
    ├── api.js            # API calls and request building
    ├── parser.js         # Log parsing utilities
    ├── storage.js        # Chrome storage operations
    ├── scanner.js        # Router scanning operations
    └── countdown.js      # Countdown timer module
```

## Installation

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the extension folder

## Usage

1. **Login** to https://nocportal.telekom.rs
2. **Click extension icon** in toolbar to open the side panel
3. **Enable Scheduler** and select frequency, or
4. **Click Scan** to run manual scan

### Authentication States

| State | Screen |
|-------|--------|
| Not logged in | "Please login to NOC Portal" |
| No session | "Open NOC Portal to detect session" |
| Logged in | Main interface |

### Scheduler

- Toggle ON/OFF with switch
- Frequency options: 1h, 2h, 3h, 6h
- Countdown timer shows time until next scan
- Scans all routers automatically
- Uses chrome.alarms API for reliability

### Manual Scan

- Select "All Routers" or specific router from dropdown
- Click "Scan" button
- Status bar shows current scanning progress

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
{
  schedulerEnabled: boolean,
  schedulerFrequency: '1h' | '2h' | '3h' | '6h',
  schedulerStartTime: number,
  sessionId: string | null,
  authState: 'logged_in' | 'logged_out' | 'unknown',
  sidePanelMode: 'global' | 'scoped',
  routerData: {
    [routerId]: {
      ports: { [portId]: [{ state, timestamp, raw }] },
      affectedPorts: number,
      hasIssues: boolean,
      lastSeenState: { [portId]: 'UP' | 'DOWN' }
    }
  },
  lastScan: number,
  scanningRouter: string | null
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

30 preconfigured routers in `modules/routers.js`:
- 2 TRANSIT (N-PE)
- 26 MAN (U-PE)
- 2 MOB (U-PE-MOB)

## Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Persist router data and settings |
| `alarms` | Scheduled scan intervals |
| `cookies` | Session detection from NOC Portal |
| `sidePanel` | Enable side panel UI |
| `tabs` | React to tab changes for scoped mode |
| `host_permissions` | API access to nocportal.telekom.rs |

## Version History
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
