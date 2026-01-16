// storage.js - Storage operations for interface state logs
// Uses localStorage for browser compatibility

import { mergeLogEntries, getLatestLogTimestamp } from './parser.js';
import { LogStorageKeys, MAX_LOGS_PER_ROUTER } from './config.js';

export { LogStorageKeys };

/**
 * Gets the storage key for a specific router
 * @param {number|string} routerId - Router ID
 * @returns {string} Storage key
 */
const getRouterLogKey = (routerId) =>
	`${LogStorageKeys.ROUTER_LOG_PREFIX}${routerId}`;

/**
 * Retrieves stored logs for a specific router
 * @param {number|string} routerId - Router ID
 * @returns {Promise<Object>} Stored log data
 */
export const getStoredLogs = async (routerId) => {
	const key = getRouterLogKey(routerId);
	try {
		const stored = localStorage.getItem(key);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (e) {
		console.error('Error reading from localStorage:', e);
	}
	return { logs: [], lastFetchTime: null };
};

/**
 * Saves logs for a specific router with size limiting
 * @param {number|string} routerId - Router ID
 * @param {string[]} logs - Log entries to save
 * @param {number} lastFetchTime - Timestamp of the latest log entry
 * @returns {Promise<{saved: boolean, truncated: boolean}>}
 */
export const saveRouterLogs = async (routerId, logs, lastFetchTime) => {
	const key = getRouterLogKey(routerId);

	// Limit logs to prevent storage quota issues (keep newest)
	const truncated = logs.length > MAX_LOGS_PER_ROUTER;
	const limitedLogs = truncated ? logs.slice(0, MAX_LOGS_PER_ROUTER) : logs;

	try {
		localStorage.setItem(key, JSON.stringify({
			logs: limitedLogs,
			lastFetchTime
		}));
		return { saved: true, truncated };
	} catch (e) {
		console.error('Storage error:', e);
		return { saved: false, truncated: false };
	}
};

/**
 * Updates logs for a router, merging with existing entries
 * @param {number|string} routerId - Router ID
 * @param {string[]} newLogs - New log entries
 * @returns {Promise<Object>} Updated log data with change info
 */
export const updateRouterLogs = async (routerId, newLogs) => {
	const stored = await getStoredLogs(routerId);

	// Merge new logs with existing
	const mergedLogs = mergeLogEntries(stored.logs, newLogs);

	// Get the latest timestamp from merged logs
	const latestTime = getLatestLogTimestamp(mergedLogs) || Date.now();

	// Save updated logs
	await saveRouterLogs(routerId, mergedLogs, latestTime);

	// Calculate what changed
	const previousCount = stored.logs.length;
	const newCount = mergedLogs.length;
	const addedCount = newCount - previousCount;

	return {
		logs: mergedLogs,
		lastFetchTime: latestTime,
		previousCount,
		newCount,
		addedCount,
		hasChanges: addedCount > 0
	};
};

/**
 * Gets the last fetch timestamp for a router
 * @param {number|string} routerId - Router ID
 * @returns {Promise<number|null>} Last fetch timestamp or null
 */
export const getLastFetchTime = async (routerId) => {
	const stored = await getStoredLogs(routerId);
	return stored.lastFetchTime;
};

/**
 * Clears all stored logs for a router
 * @param {number|string} routerId - Router ID
 * @returns {Promise<void>}
 */
export const clearRouterLogs = async (routerId) => {
	const key = getRouterLogKey(routerId);
	localStorage.removeItem(key);
};

/**
 * Gets all stored router log keys
 * @returns {Promise<string[]>} Array of router IDs with stored logs
 */
export const getAllStoredRouterIds = async () => {
	const routerIds = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key && key.startsWith(LogStorageKeys.ROUTER_LOG_PREFIX)) {
			routerIds.push(key.replace(LogStorageKeys.ROUTER_LOG_PREFIX, ''));
		}
	}
	return routerIds;
};

/**
 * Gets summary of all stored logs
 * @returns {Promise<Object[]>} Summary of logs per router
 */
export const getAllLogsSummary = async () => {
	const routerIds = await getAllStoredRouterIds();

	const summaries = await Promise.all(
		routerIds.map(async (routerId) => {
			const data = await getStoredLogs(routerId);
			return {
				routerId,
				logCount: data.logs.length,
				lastFetchTime: data.lastFetchTime,
				lastFetchDate: data.lastFetchTime
					? new Date(data.lastFetchTime).toISOString()
					: null
			};
		})
	);

	return summaries;
};

/**
 * Clears all stored interface logs
 * @returns {Promise<void>}
 */
export const clearAllLogs = async () => {
	const routerIds = await getAllStoredRouterIds();
	await Promise.all(routerIds.map(clearRouterLogs));
};

/**
 * Exports all logs as a JSON object
 * @returns {Promise<Object>} All logs organized by router
 */
export const exportAllLogs = async () => {
	const routerIds = await getAllStoredRouterIds();

	const allLogs = {};
	await Promise.all(
		routerIds.map(async (routerId) => {
			allLogs[routerId] = await getStoredLogs(routerId);
		})
	);

	return {
		exportedAt: new Date().toISOString(),
		routers: allLogs
	};
};
