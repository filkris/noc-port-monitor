// background.js - Service Worker for NOC Port Monitor

import { ALARM_NAME, SCOPED_ORIGIN, STORAGE_KEYS } from './modules/constants.js';
import {
	initializeStorage,
	getExtensionState,
	setScheduler,
	handleSessionDetected,
	handleAuthStateChanged,
	updateRouterSeen,
	rebootExtension
} from './modules/storage.js';
import { scanAllRouters, scanSingleRouter } from './modules/scanner.js';

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
	await initializeStorage();
	await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === ALARM_NAME) {
		await scanAllRouters();
	}
});

// Side panel mode management
async function updateSidePanelForTab(tabId, url) {
	const { sidePanelMode } = await chrome.storage.local.get(STORAGE_KEYS.SIDE_PANEL_MODE);
	const mode = sidePanelMode || 'global';

	if (mode === 'global') {
		await chrome.sidePanel.setOptions({
			tabId,
			path: 'app.html',
			enabled: true
		});
	} else {
		const enabled = url?.startsWith(SCOPED_ORIGIN) || false;
		await chrome.sidePanel.setOptions({
			tabId,
			path: 'app.html',
			enabled
		});
	}
}

// React to tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
	try {
		const tab = await chrome.tabs.get(activeInfo.tabId);
		await updateSidePanelForTab(activeInfo.tabId, tab.url);
	} catch (e) {
		// Tab may not exist
	}
});

// React to tab URL updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
	if (changeInfo.url) {
		await updateSidePanelForTab(tabId, changeInfo.url);
	}
});

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	handleMessage(message, sender).then(sendResponse);
	return true;
});

async function handleMessage(message) {
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

		case 'updateRouterSeen':
			return updateRouterSeen(message.routerId, message.lastSeenState);

		case 'setSidePanelMode':
			await chrome.storage.local.set({ [STORAGE_KEYS.SIDE_PANEL_MODE]: message.mode });
			// Update all existing tabs
			const tabs = await chrome.tabs.query({});
			for (const tab of tabs) {
				if (tab.id) {
					await updateSidePanelForTab(tab.id, tab.url);
				}
			}
			return { success: true };

		case 'getSidePanelMode':
			const result = await chrome.storage.local.get(STORAGE_KEYS.SIDE_PANEL_MODE);
			return { mode: result[STORAGE_KEYS.SIDE_PANEL_MODE] || 'global' };

		default:
			return { error: 'Unknown action' };
	}
}
