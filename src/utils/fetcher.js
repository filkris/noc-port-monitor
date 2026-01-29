import { fetchRouterLogs, fetchDebugRouterLogs } from "./api";
import { parseRouterLogs } from "./parser";
import { ROUTERS } from "@/constants/routers";
import { STORAGE_KEYS } from "@/constants/storage";
import { tryGetSessionFromCookies } from "./storage";
import { DEBUG_MODE } from "@/app/config";

async function getSessionId() {
	let { [STORAGE_KEYS.SESSION_ID]: sessionId } = await chrome.storage.local.get(STORAGE_KEYS.SESSION_ID);

	if (!sessionId) {
		sessionId = await tryGetSessionFromCookies();
	}

	return sessionId;
}

function hasNewEvents(oldData, newData) {
	if (!oldData?.ports || !newData?.ports) return Object.keys(newData?.ports || {}).length > 0;

	const oldPorts = oldData.ports;
	const newPorts = newData.ports;

	for (const portId of Object.keys(newPorts)) {
		if (!oldPorts[portId]) return true;
		if (newPorts[portId].length > oldPorts[portId].length) return true;
	}

	return false;
}

async function updateRouterData(routerId, result) {
	const { [STORAGE_KEYS.ROUTER_DATA]: routerData = {} } = await chrome.storage.local.get(STORAGE_KEYS.ROUTER_DATA);
	const oldData = routerData[routerId];

	if (oldData?.lastSeenState === "seen" && !hasNewEvents(oldData, result)) {
		result.lastSeenState = "seen";
	}

	routerData[routerId] = result;

	await chrome.storage.local.set({
		[STORAGE_KEYS.ROUTER_DATA]: routerData,
		[STORAGE_KEYS.LAST_CHECK]: Date.now(),
	});

	return routerData;
}

export async function fetchAllRouters() {
	const sessionId = DEBUG_MODE ? null : await getSessionId();

	if (!DEBUG_MODE && !sessionId) {
		return { error: "No session - open NOC Portal first" };
	}

	for (const router of ROUTERS) {
		await chrome.storage.local.set({ scanningRouter: router.name });

		const { [STORAGE_KEYS.ROUTER_DATA]: routerDataBefore = {} } = await chrome.storage.local.get(STORAGE_KEYS.ROUTER_DATA);
		const oldData = routerDataBefore[router.id];

		let result;
		try {
			const apiResult = DEBUG_MODE ? await fetchDebugRouterLogs(router) : await fetchRouterLogs(router, sessionId);
			result = parseRouterLogs(apiResult, router);

			if (oldData?.lastSeenState === "seen" && !hasNewEvents(oldData, result)) {
				result.lastSeenState = "seen";
			}
		} catch (error) {
			result = { error: error.message };
		}

		const { [STORAGE_KEYS.ROUTER_DATA]: routerDataAfter = {} } = await chrome.storage.local.get(STORAGE_KEYS.ROUTER_DATA);
		routerDataAfter[router.id] = result;

		await chrome.storage.local.set({
			[STORAGE_KEYS.ROUTER_DATA]: routerDataAfter,
			[STORAGE_KEYS.LAST_CHECK]: Date.now(),
		});
	}

	await chrome.storage.local.remove("scanningRouter");

	const { [STORAGE_KEYS.ROUTER_DATA]: finalRouterData = {} } = await chrome.storage.local.get(STORAGE_KEYS.ROUTER_DATA);

	return { success: true, results: finalRouterData };
}

export async function fetchSingleRouter(routerId) {
	const sessionId = DEBUG_MODE ? null : await getSessionId();

	if (!DEBUG_MODE && !sessionId) {
		return { error: "No session - open NOC Portal first" };
	}

	const router = ROUTERS.find(r => r.id === routerId);
	if (!router) {
		return { error: "Router not found" };
	}

	try {
		const apiResult = DEBUG_MODE ? await fetchDebugRouterLogs(router) : await fetchRouterLogs(router, sessionId);
		const result = parseRouterLogs(apiResult, router);

		await updateRouterData(router.id, result);

		return { success: true, result };
	} catch (error) {
		return { error: error.message };
	}
}
