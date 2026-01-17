// background.js - Service Worker for NOC Port Monitor

import { ALARM_NAME } from './modules/constants.js';
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

		default:
			return { error: 'Unknown action' };
	}
}
