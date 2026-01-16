// background.js - Service Worker for NOC Port Monitor

import {
	ROUTERS,
	UID,
	API_BASE,
	ALARM_NAME,
	STORAGE_KEYS,
	FREQUENCY_MAP,
	API_ENDPOINTS,
	INTERFACE_STATE_PATTERNS
} from './config.js';

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
	await initializeStorage();
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === ALARM_NAME) {
		await scanAllRouters();
	}
});

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	handleMessage(message, sender).then(sendResponse);
	return true;
});

async function initializeStorage() {
	const defaults = {
		[STORAGE_KEYS.SCHEDULER_ENABLED]: false,
		[STORAGE_KEYS.SCHEDULER_FREQUENCY]: '1h',
		[STORAGE_KEYS.SESSION_ID]: null,
		[STORAGE_KEYS.ROUTER_DATA]: {},
		[STORAGE_KEYS.LAST_SCAN]: null,
		[STORAGE_KEYS.AUTH_STATE]: 'unknown'
	};

	const existing = await chrome.storage.local.get(Object.keys(defaults));
	const toSet = {};

	for (const [key, value] of Object.entries(defaults)) {
		if (existing[key] === undefined) {
			toSet[key] = value;
		}
	}

	if (Object.keys(toSet).length > 0) {
		await chrome.storage.local.set(toSet);
	}
}

async function handleMessage(message, sender) {
	switch (message.action) {
		case 'getState':
			return getExtensionState();

		case 'setScheduler':
			return setScheduler(message.enabled, message.frequency);

		case 'scanAll':
			return scanAllRouters();

		case 'scanRouter':
			return scanSingleRouter(message.routerId);

		case 'reboot':
			return rebootExtension();

		case 'sessionDetected':
			return handleSessionDetected(message.sessionId);

		case 'authStateChanged':
			return handleAuthStateChanged(message.isLoggedIn);

		default:
			return { error: 'Unknown action' };
	}
}

async function getExtensionState() {
	const data = await chrome.storage.local.get(null);
	return {
		schedulerEnabled: data[STORAGE_KEYS.SCHEDULER_ENABLED] ?? false,
		schedulerFrequency: data[STORAGE_KEYS.SCHEDULER_FREQUENCY] ?? '1h',
		sessionId: data[STORAGE_KEYS.SESSION_ID],
		routerData: data[STORAGE_KEYS.ROUTER_DATA] ?? {},
		lastScan: data[STORAGE_KEYS.LAST_SCAN],
		authState: data[STORAGE_KEYS.AUTH_STATE] ?? 'unknown',
		routers: ROUTERS
	};
}

async function setScheduler(enabled, frequency) {
	await chrome.storage.local.set({
		[STORAGE_KEYS.SCHEDULER_ENABLED]: enabled,
		[STORAGE_KEYS.SCHEDULER_FREQUENCY]: frequency
	});

	await chrome.alarms.clear(ALARM_NAME);

	if (enabled && frequency) {
		const minutes = FREQUENCY_MAP[frequency] || 60;
		await chrome.alarms.create(ALARM_NAME, {
			periodInMinutes: minutes,
			delayInMinutes: minutes
		});
	}

	return { success: true };
}

async function handleSessionDetected(sessionId) {
	await chrome.storage.local.set({ [STORAGE_KEYS.SESSION_ID]: sessionId });
	return { success: true };
}

async function handleAuthStateChanged(isLoggedIn) {
	const authState = isLoggedIn ? 'logged_in' : 'logged_out';
	await chrome.storage.local.set({ [STORAGE_KEYS.AUTH_STATE]: authState });

	if (!isLoggedIn) {
		await chrome.storage.local.set({ [STORAGE_KEYS.SESSION_ID]: null });
	}

	return { success: true, authState };
}

async function tryGetSessionFromCookies() {
	try {
		const cookies = await chrome.cookies.getAll({ domain: 'nocportal.telekom.rs' });
		const sessionCookie = cookies.find(c => c.name === 'session_id');
		if (sessionCookie?.value) {
			await chrome.storage.local.set({ [STORAGE_KEYS.SESSION_ID]: sessionCookie.value });
			return sessionCookie.value;
		}
	} catch (e) {
		// Cookies API may fail
	}
	return null;
}

async function scanAllRouters() {
	let { [STORAGE_KEYS.SESSION_ID]: sessionId } = await chrome.storage.local.get(STORAGE_KEYS.SESSION_ID);

	if (!sessionId) {
		sessionId = await tryGetSessionFromCookies();
	}

	if (!sessionId) {
		return { error: 'No session - open NOC Portal first' };
	}

	const results = {};

	for (const router of ROUTERS) {
		try {
			const result = await fetchRouterLogs(router, sessionId);
			results[router.id] = result;
		} catch (error) {
			results[router.id] = { error: error.message };
		}
	}

	await chrome.storage.local.set({
		[STORAGE_KEYS.ROUTER_DATA]: results,
		[STORAGE_KEYS.LAST_SCAN]: Date.now()
	});

	return { success: true, results };
}

async function scanSingleRouter(routerId) {
	let { [STORAGE_KEYS.SESSION_ID]: sessionId } = await chrome.storage.local.get(STORAGE_KEYS.SESSION_ID);

	if (!sessionId) {
		sessionId = await tryGetSessionFromCookies();
	}

	if (!sessionId) {
		return { error: 'No session - open NOC Portal first' };
	}

	const router = ROUTERS.find(r => r.id === routerId);
	if (!router) {
		return { error: 'Router not found' };
	}

	try {
		const result = await fetchRouterLogs(router, sessionId);

		const { [STORAGE_KEYS.ROUTER_DATA]: routerData } = await chrome.storage.local.get(STORAGE_KEYS.ROUTER_DATA);
		routerData[router.id] = result;

		await chrome.storage.local.set({
			[STORAGE_KEYS.ROUTER_DATA]: routerData,
			[STORAGE_KEYS.LAST_SCAN]: Date.now()
		});

		return { success: true, result };
	} catch (error) {
		return { error: error.message };
	}
}

async function fetchRouterLogs(router, sessionId) {
	const generateRequestId = () => Math.floor(Math.random() * 1000000000);

	const buildContext = (router) => ({
		bin_size: true,
		lang: 'sr@latin',
		tz: 'Europe/Belgrade',
		uid: UID,
		allowed_company_ids: [1],
		full_width: true,
		default_mts_router_switch_id: parseInt(router.id, 10),
		default_mts_router_switch_name: router.name
	});

	// Step 1: Create wizard
	const createPayload = {
		jsonrpc: '2.0',
		method: 'call',
		params: {
			args: [{ mts_router_switch_id: parseInt(router.id, 10), interface: 'GigabitEthernet' }],
			model: 'mts.router.switch.command.wizard',
			method: 'create',
			kwargs: { context: buildContext(router) }
		},
		id: generateRequestId()
	};

	const createResult = await apiCall(API_ENDPOINTS.CREATE_WIZARD, createPayload, sessionId);
	const wizardId = createResult.result;

	if (!wizardId) {
		throw new Error('Failed to create wizard');
	}

	// Step 2: Execute action_log
	const actionLogPayload = {
		jsonrpc: '2.0',
		method: 'call',
		params: {
			args: [[wizardId]],
			model: 'mts.router.switch.command.wizard',
			method: 'action_log',
			kwargs: {
				context: {
					lang: 'sr@latin',
					tz: 'Europe/Belgrade',
					uid: UID,
					allowed_company_ids: [1],
					full_width: true,
					active_model: 'mts.router.switch.command.wizard',
					active_id: wizardId,
					active_ids: [wizardId]
				}
			}
		},
		id: generateRequestId()
	};

	await apiCall(API_ENDPOINTS.CALL_BUTTON, actionLogPayload, sessionId);

	// Step 3: Read output
	const fields = ['mts_router_switch_id', 'interface', 'output'];
	const readPayload = {
		jsonrpc: '2.0',
		method: 'call',
		params: {
			args: [[wizardId], fields],
			model: 'mts.router.switch.command.wizard',
			method: 'read',
			kwargs: { context: buildContext(router) }
		},
		id: generateRequestId()
	};

	const readResult = await apiCall(API_ENDPOINTS.READ_WIZARD, readPayload, sessionId);

	// Parse the logs
	return parseRouterLogs(readResult, router);
}

async function apiCall(endpoint, payload, sessionId) {
	const response = await fetch(`${API_BASE}${endpoint}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Cookie': `session_id=${sessionId}`
		},
		body: JSON.stringify(payload),
		credentials: 'include'
	});

	const data = await response.json();

	if (data.error) {
		throw new Error(data.error.message || 'API Error');
	}

	return data;
}

function parseRouterLogs(data, router) {
	const resultArray = Array.isArray(data?.result) ? data.result : [];
	const ports = {};
	let totalEvents = 0;
	let hasIssues = false;

	for (const item of resultArray) {
		const output = item?.output;
		if (!output || output === '<p><br></p>') continue;

		const lines = extractLogLines(output);

		for (const line of lines) {
			const event = parseLogLine(line);
			if (!event) continue;

			if (!ports[event.port]) {
				ports[event.port] = [];
			}

			ports[event.port].push(event);
			totalEvents++;

			if (event.state === 'DOWN') {
				hasIssues = true;
			}
		}
	}

	// Sort events by timestamp (newest first)
	for (const port of Object.keys(ports)) {
		ports[port].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
	}

	return {
		routerId: router.id,
		routerName: router.name,
		ports,
		totalEvents,
		affectedPorts: Object.keys(ports).length,
		hasIssues,
		lastUpdated: Date.now()
	};
}

function extractLogLines(output) {
	const tempDiv = output
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<[^>]+>/g, '');

	return tempDiv
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean);
}

function parseLogLine(line) {
	const hasAlarmId = line.includes(`alarmID=${INTERFACE_STATE_PATTERNS.alarmId}`);
	if (!hasAlarmId) return null;

	const hasClearType = line.includes(`clearType=${INTERFACE_STATE_PATTERNS.clearType}`);
	const isUp = hasClearType;
	const isDown = !hasClearType;

	if (!isUp && !isDown) return null;

	const portMatch = line.match(/(\d+\/\d+\/\d+)\s*$/);
	const port = portMatch ? portMatch[1] : null;

	if (!port) return null;

	const dateMatch = line.match(/^(\w{3}\s+\d{1,2}\s+\d{4}\s+\d{1,2}:\d{2})/);
	let timestamp = null;

	if (dateMatch) {
		const parsed = new Date(dateMatch[1]);
		if (!isNaN(parsed.getTime())) {
			timestamp = parsed.getTime();
		}
	}

	return {
		state: isUp ? 'UP' : 'DOWN',
		port,
		timestamp,
		date: timestamp ? new Date(timestamp).toISOString() : null,
		raw: line
	};
}

async function rebootExtension() {
	await chrome.alarms.clearAll();
	await chrome.storage.local.clear();
	await initializeStorage();
	return { success: true };
}
