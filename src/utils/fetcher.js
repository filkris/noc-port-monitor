import { fetchRouterLogs } from "./api";
import { parseRouterLogs } from "./parser";
import { ROUTERS } from "@/constants/routers";
import { STORAGE_KEYS } from "@/constants/storage";
import { tryGetSessionFromCookies } from "./storage";

async function getSessionId() {
	let { [STORAGE_KEYS.SESSION_ID]: sessionId } = await chrome.storage.local.get(STORAGE_KEYS.SESSION_ID);

	if (!sessionId) {
		sessionId = await tryGetSessionFromCookies();
	}

	return sessionId;
}

async function updateRouterData(routerId, result) {
	const { [STORAGE_KEYS.ROUTER_DATA]: routerData = {} } = await chrome.storage.local.get(STORAGE_KEYS.ROUTER_DATA);
	routerData[routerId] = result;

	await chrome.storage.local.set({
		[STORAGE_KEYS.ROUTER_DATA]: routerData,
		[STORAGE_KEYS.LAST_SCAN]: Date.now(),
	});

	return routerData;
}

export async function fetchAllRouters() {
	const sessionId = await getSessionId();

	if (!sessionId) {
		return { error: "No session - open NOC Portal first" };
	}

	let { [STORAGE_KEYS.ROUTER_DATA]: routerData = {} } = await chrome.storage.local.get(STORAGE_KEYS.ROUTER_DATA);

	for (const router of ROUTERS) {
		await chrome.storage.local.set({ scanningRouter: router.name });

		try {
			const apiResult = await fetchRouterLogs(router, sessionId);
			const result = parseRouterLogs(apiResult, router);

			if (routerData[router.id]?.lastSeenState) {
				result.lastSeenState = routerData[router.id].lastSeenState;
			}
			routerData[router.id] = result;
		} catch (error) {
			routerData[router.id] = { error: error.message };
		}

		await chrome.storage.local.set({
			[STORAGE_KEYS.ROUTER_DATA]: routerData,
			[STORAGE_KEYS.LAST_SCAN]: Date.now(),
		});
	}

	await chrome.storage.local.remove("scanningRouter");

	return { success: true, results: routerData };
}

export async function fetchSingleRouter(routerId) {
	const sessionId = await getSessionId();

	if (!sessionId) {
		return { error: "No session - open NOC Portal first" };
	}

	const router = ROUTERS.find((r) => r.id === routerId);
	if (!router) {
		return { error: "Router not found" };
	}

	try {
		const apiResult = await fetchRouterLogs(router, sessionId);
		const result = parseRouterLogs(apiResult, router);

		await updateRouterData(router.id, result);

		return { success: true, result };
	} catch (error) {
		return { error: error.message };
	}
}
