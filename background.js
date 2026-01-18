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

const MENU_ID_GLOBAL = 'mode-global';
const MENU_ID_SCOPED = 'mode-scoped';
const MENU_ID_REBOOT = 'reboot-extension';

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
	await initializeStorage();
	await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
	await createContextMenus();
});

// Create context menus
async function createContextMenus() {
	await chrome.contextMenus.removeAll();

	const { sidePanelMode } = await chrome.storage.sync.get(STORAGE_KEYS.SIDE_PANEL_MODE);
	const mode = sidePanelMode || 'global';

	chrome.contextMenus.create({
		id: MENU_ID_GLOBAL,
		title: 'Global',
		type: 'radio',
		checked: mode === 'global',
		contexts: ['action']
	});

	chrome.contextMenus.create({
		id: MENU_ID_SCOPED,
		title: 'Scoped',
		type: 'radio',
		checked: mode === 'scoped',
		contexts: ['action']
	});

	chrome.contextMenus.create({
		id: 'separator',
		type: 'separator',
		contexts: ['action']
	});

	chrome.contextMenus.create({
		id: MENU_ID_REBOOT,
		title: 'Reboot extension',
		type: 'normal',
		contexts: ['action']
	});
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info) => {
	if (info.menuItemId === MENU_ID_GLOBAL || info.menuItemId === MENU_ID_SCOPED) {
		const mode = info.menuItemId === MENU_ID_GLOBAL ? 'global' : 'scoped';
		await chrome.storage.sync.set({ [STORAGE_KEYS.SIDE_PANEL_MODE]: mode });
		await updateAllTabs();
	} else if (info.menuItemId === MENU_ID_REBOOT) {
		await rebootExtension();
	}
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === ALARM_NAME) {
		await scanAllRouters();
	}
});

// Side panel mode management
async function updateSidePanelForTab(tabId, isNocPortal) {
	const { sidePanelMode } = await chrome.storage.sync.get(STORAGE_KEYS.SIDE_PANEL_MODE);
	const mode = sidePanelMode || 'global';

	try {
		await chrome.sidePanel.setOptions({
			tabId,
			path: 'app.html',
			enabled: mode === 'global' || isNocPortal
		});
	} catch (e) {
		// Tab may have been closed or is restricted
	}
}

// Update all tabs
async function updateAllTabs() {
	const { sidePanelMode } = await chrome.storage.sync.get(STORAGE_KEYS.SIDE_PANEL_MODE);
	const mode = sidePanelMode || 'global';

	// Get NOC Portal tab IDs
	const nocTabs = await chrome.tabs.query({ url: `${SCOPED_ORIGIN}/*` });
	const nocTabIds = new Set(nocTabs.map(t => t.id));

	// Update all tabs
	const allTabs = await chrome.tabs.query({});
	for (const tab of allTabs) {
		if (tab.id) {
			try {
				await chrome.sidePanel.setOptions({
					tabId: tab.id,
					path: 'app.html',
					enabled: mode === 'global' || nocTabIds.has(tab.id)
				});
			} catch (e) {
				// Tab may be restricted
			}
		}
	}
}

// React to tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
	try {
		const tab = await chrome.tabs.get(activeInfo.tabId);
		const isNocPortal = tab.url?.startsWith(SCOPED_ORIGIN) || false;
		await updateSidePanelForTab(activeInfo.tabId, isNocPortal);
	} catch (e) {
		// Tab may not exist
	}
});

// React to tab URL updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
	if (changeInfo.url) {
		const isNocPortal = changeInfo.url.startsWith(SCOPED_ORIGIN);
		await updateSidePanelForTab(tabId, isNocPortal);
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
			await chrome.storage.sync.set({ [STORAGE_KEYS.SIDE_PANEL_MODE]: message.mode });
			await updateAllTabs();
			return { success: true };

		case 'getSidePanelMode':
			const result = await chrome.storage.sync.get(STORAGE_KEYS.SIDE_PANEL_MODE);
			return { mode: result[STORAGE_KEYS.SIDE_PANEL_MODE] || 'global' };

		default:
			return { error: 'Unknown action' };
	}
}
