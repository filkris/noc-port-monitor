// modules/storage.js - Chrome storage operations

import { STORAGE_KEYS, ALARM_NAME, FREQUENCY_MAP } from './constants.js';
import { ROUTERS } from './routers.js';

const DEFAULTS = {
	[STORAGE_KEYS.SCHEDULER_ENABLED]: false,
	[STORAGE_KEYS.SCHEDULER_FREQUENCY]: '1h',
	[STORAGE_KEYS.SESSION_ID]: null,
	[STORAGE_KEYS.ROUTER_DATA]: {},
	[STORAGE_KEYS.LAST_SCAN]: null,
	[STORAGE_KEYS.AUTH_STATE]: 'unknown'
};

export async function initializeStorage() {
	const existing = await chrome.storage.local.get(Object.keys(DEFAULTS));
	const toSet = {};

	for (const [key, value] of Object.entries(DEFAULTS)) {
		if (existing[key] === undefined) {
			toSet[key] = value;
		}
	}

	if (Object.keys(toSet).length > 0) {
		await chrome.storage.local.set(toSet);
	}
}

export async function getExtensionState() {
	const data = await chrome.storage.local.get(null);
	return {
		schedulerEnabled: data[STORAGE_KEYS.SCHEDULER_ENABLED] ?? false,
		schedulerFrequency: data[STORAGE_KEYS.SCHEDULER_FREQUENCY] ?? '1h',
		schedulerStartTime: data.schedulerStartTime ?? null,
		sessionId: data[STORAGE_KEYS.SESSION_ID],
		routerData: data[STORAGE_KEYS.ROUTER_DATA] ?? {},
		lastScan: data[STORAGE_KEYS.LAST_SCAN],
		authState: data[STORAGE_KEYS.AUTH_STATE] ?? 'unknown',
		routers: ROUTERS
	};
}

export async function setScheduler(enabled, frequency) {
	const updates = {
		[STORAGE_KEYS.SCHEDULER_ENABLED]: enabled,
		[STORAGE_KEYS.SCHEDULER_FREQUENCY]: frequency,
		schedulerStartTime: enabled ? Date.now() : null
	};

	await chrome.storage.local.set(updates);
	await chrome.alarms.clear(ALARM_NAME);

	if (enabled && frequency) {
		const minutes = FREQUENCY_MAP[frequency] || 60;
		await chrome.alarms.create(ALARM_NAME, {
			periodInMinutes: minutes,
			delayInMinutes: minutes
		});
	}

	return { success: true, schedulerStartTime: updates.schedulerStartTime };
}

export async function handleSessionDetected(sessionId) {
	await chrome.storage.local.set({ [STORAGE_KEYS.SESSION_ID]: sessionId });
	return { success: true };
}

export async function handleAuthStateChanged(isLoggedIn) {
	const authState = isLoggedIn ? 'logged_in' : 'logged_out';
	await chrome.storage.local.set({ [STORAGE_KEYS.AUTH_STATE]: authState });

	if (!isLoggedIn) {
		await chrome.storage.local.set({ [STORAGE_KEYS.SESSION_ID]: null });
	}

	return { success: true, authState };
}

export async function updateRouterSeen(routerId, lastSeenState) {
	const { [STORAGE_KEYS.ROUTER_DATA]: routerData } = await chrome.storage.local.get(STORAGE_KEYS.ROUTER_DATA);
	if (routerData?.[routerId]) {
		routerData[routerId].lastSeenState = lastSeenState;
		await chrome.storage.local.set({ [STORAGE_KEYS.ROUTER_DATA]: routerData });
	}
	return { success: true };
}

export async function rebootExtension() {
	await chrome.alarms.clearAll();
	await chrome.storage.local.clear();
	await initializeStorage();
	return { success: true };
}

export async function tryGetSessionFromCookies() {
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
