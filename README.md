# NOC Port Monitor - Chrome Extension

Chrome MV3 extension for monitoring router port status changes from NOC Portal.

## Features

- **Scheduler**: Automated log collection at configurable intervals (1h, 2h, 3h, 6h)
- **Manual Scan**: Scan all routers or individual router on demand
- **Port Status Tracking**: Detects UP/DOWN events with timestamps
- **Router Accordion**: Expandable list showing affected ports per router
- **Status Indicators**: Green (all ports UP), Red (any port DOWN), Gray (no data)
- **Resizable Popup**: Toggle to enable vertical resizing of popup window
- **Persistent Background**: Runs while NOC Portal tab is open
- **Auto Session Detection**: Detects login state and session from NOC Portal

## Architecture

```
parser/
├── manifest.json      # MV3 manifest
├── background.js      # Service worker (scheduler, API, parsing)
├── content.js         # Session/auth detection on NOC Portal
├── app.html         # Popup UI
├── app.css          # Styles
├── app.js           # UI controller
└── config.js          # Router definitions
```

## Installation

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the extension folder

## Usage

1. **Login** to https://nocportal.telekom.rs
2. **Click extension icon** in toolbar
3. **Enable Scheduler** and select frequency, or
4. **Click Scan** to run manual scan

### Authentication States

| State | Screen |
|-------|--------|
| Not logged in | "Please login to NOC Portal" |
| Session unavailable | "Session cannot be auto-detected" |
| Logged in | Main interface |

### Scheduler

- Toggle ON/OFF
- Frequency: 1h, 2h, 3h, 6h
- Scans all routers automatically
- Uses chrome.alarms API

### Manual Scan

- Select "All Routers" or specific router
- Click "Scan" button

### Router Accordion

Each router shows:
- **Header**: Status indicator, name, "new" badge, affected port count
- **Subheader**: Vendor, network type, model, IP
- **Body**: Port groups with chronological events

### Reboot

Clears all storage and reinitializes extension.

## Port Detection

| Event | Pattern |
|-------|---------|
| UP | `CID=0x80fc05ad` + `alarmID=0x0813005b` + `clearType=service_resume` |
| DOWN | `CID=0x80fc051d` + `alarmID=0x0813005b` |

## Storage Schema

```javascript
{
  schedulerEnabled: boolean,
  schedulerFrequency: '1h' | '2h' | '3h' | '6h',
  sessionId: string | null,
  authState: 'logged_in' | 'logged_out' | 'unknown',
  routerData: {
    [routerId]: {
      ports: { [portId]: [{ state, timestamp, raw }] },
      affectedPorts: number,
      hasIssues: boolean
    }
  },
  lastScan: number
}
```

## API Endpoints

| Step | Endpoint |
|------|----------|
| Create wizard | `/web/dataset/call_kw/mts.router.switch.command.wizard/create` |
| Execute command | `/web/dataset/call_button` |
| Read output | `/web/dataset/call_kw/mts.router.switch.command.wizard/read` |

## Routers

30 preconfigured routers in `config.js`:
- 2 TRANSIT (N-PE)
- 27 MAN (U-PE)
- 2 MOB (U-PE-MOB_NS_ZELEZNICKA-STANICA_1, U-PE-MOB_NS_NESTIN_1)

## Permissions

- `storage` - Persist data
- `alarms` - Scheduled scans
- `cookies` - Session detection
- `host_permissions` - NOC Portal API access

## Version

- **v1.4.0** - Incremental scan progress updates, countdown on first scheduler enable, centered auth screen
- **v1.3.0** - Separated Scheduler/Manual sections, footer status bar, "new" badge on router state changes, port display as "Port #X/Y/Z"
- **v1.2.0** - Improved indicator logic (checks last port state), resizable popup toggle, date format DD-MM-YYYY HH:MM:SS
- **v1.1.0** - Added countdown timer for next scheduled scan, fixed log timestamp UTC parsing
- **v1.0.0** - Complete rewrite with scheduler, accordion UI, background service worker
