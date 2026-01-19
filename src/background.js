import { MENU_IDS } from "@/constants/menu";
import { fetchAllRouters, fetchSingleRouter } from "@/utils/fetcher";
import { STORAGE_KEYS, ALARM_NAME, SCOPED_ORIGIN } from "@/constants/storage";
import {
	initializeStorage,
	getExtensionState,
	setScheduler,
	handleSessionDetected,
	handleAuthStateChanged,
	updateRouterSeen,
	rebootExtension,
} from "@/utils/storage";

chrome.runtime.onInstalled.addListener(async () => {
	await initializeStorage();
	await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
	await createContextMenus();
});

async function createContextMenus() {
	await chrome.contextMenus.removeAll();

	const { [STORAGE_KEYS.SIDE_PANEL_MODE]: globalMode } = await chrome.storage.sync.get(STORAGE_KEYS.SIDE_PANEL_MODE);

	chrome.contextMenus.create({
		id: MENU_IDS.GLOBAL_MODE,
		title: "Global mode",
		type: "checkbox",
		checked: globalMode || false,
		contexts: ["action"],
	});

	chrome.contextMenus.create({
		id: MENU_IDS.SEPARATOR,
		type: "separator",
		contexts: ["action"],
	});

	chrome.contextMenus.create({
		id: MENU_IDS.REBOOT,
		title: "Reboot extension",
		type: "normal",
		contexts: ["action"],
	});
}

chrome.contextMenus.onClicked.addListener(async info => {
	if (info.menuItemId === MENU_IDS.GLOBAL_MODE) {
		await chrome.storage.sync.set({ [STORAGE_KEYS.SIDE_PANEL_MODE]: info.checked });
		await updateAllTabs();
	} else if (info.menuItemId === MENU_IDS.REBOOT) {
		await rebootExtension();
	}
});

chrome.alarms.onAlarm.addListener(async alarm => {
	if (alarm.name === ALARM_NAME) {
		await fetchAllRouters();
	}
});

async function updateSidePanelForTab(tabId, isNocPortal) {
	const { [STORAGE_KEYS.SIDE_PANEL_MODE]: globalMode } = await chrome.storage.sync.get(STORAGE_KEYS.SIDE_PANEL_MODE);

	try {
		await chrome.sidePanel.setOptions({
			tabId,
			path: "app/index.html",
			enabled: globalMode || isNocPortal,
		});
	} catch {
		// Tab may have been closed or is restricted
	}
}

async function updateAllTabs() {
	const { [STORAGE_KEYS.SIDE_PANEL_MODE]: globalMode } = await chrome.storage.sync.get(STORAGE_KEYS.SIDE_PANEL_MODE);

	const nocTabs = await chrome.tabs.query({ url: `${SCOPED_ORIGIN}/*` });
	const nocTabIds = new Set(nocTabs.map(t => t.id));

	const allTabs = await chrome.tabs.query({});
	for (const tab of allTabs) {
		if (tab.id) {
			try {
				await chrome.sidePanel.setOptions({
					tabId: tab.id,
					path: "app/index.html",
					enabled: globalMode || nocTabIds.has(tab.id),
				});
			} catch {
				// Tab may be restricted
			}
		}
	}
}

chrome.tabs.onActivated.addListener(async activeInfo => {
	try {
		const tab = await chrome.tabs.get(activeInfo.tabId);
		const isNocPortal = tab.url?.startsWith(SCOPED_ORIGIN) || false;
		await updateSidePanelForTab(activeInfo.tabId, isNocPortal);
	} catch {
		// Tab may not exist
	}
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
	if (changeInfo.url) {
		const isNocPortal = changeInfo.url.startsWith(SCOPED_ORIGIN);
		await updateSidePanelForTab(tabId, isNocPortal);
	}
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	handleMessage(message).then(sendResponse);
	return true;
});

async function handleMessage(message) {
	switch (message.action) {
		case "getState":
			return getExtensionState();

		case "setScheduler":
			return setScheduler(message.enabled, message.frequency);

		case "fetchAll":
			return fetchAllRouters();

		case "fetchRouter":
			return fetchSingleRouter(message.routerId);

		case "reboot":
			return rebootExtension();

		case "sessionDetected":
			return handleSessionDetected(message.sessionId);

		case "authStateChanged":
			return handleAuthStateChanged(message.isLoggedIn);

		case "updateRouterSeen":
			return updateRouterSeen(message.routerId, message.lastSeenState);

		case "setGlobalMode":
			await chrome.storage.sync.set({ [STORAGE_KEYS.SIDE_PANEL_MODE]: message.globalMode });
			await updateAllTabs();
			return { success: true };

		case "getGlobalMode": {
			const result = await chrome.storage.sync.get(STORAGE_KEYS.SIDE_PANEL_MODE);
			return { globalMode: result[STORAGE_KEYS.SIDE_PANEL_MODE] || false };
		}

		default:
			return { error: "Unknown action" };
	}
}
