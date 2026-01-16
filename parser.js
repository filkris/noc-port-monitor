// parser.js - Log parsing utilities
// Chrome-extension friendly (no Node.js), ES module

import {
	COLLAPSIBLE_CONTENT_REGEX,
	LOG_DATE_REGEX,
	INTERFACE_STATE_PATTERNS
} from './config.js';

export { INTERFACE_STATE_PATTERNS };

/**
 * Parses a log date string into a timestamp
 * @param {string} dateStr - Date string like "Jan 15 2026 10:23"
 * @returns {number|null} Timestamp in milliseconds or null if parsing fails
 */
export const parseLogDate = (dateStr) => {
	if (!dateStr) return null;

	const match = dateStr.match(LOG_DATE_REGEX);
	if (!match) return null;

	const parsed = new Date(match[1]);
	return isNaN(parsed.getTime()) ? null : parsed.getTime();
};

/**
 * Extracts the date from a log line
 * @param {string} line - Log line
 * @returns {number|null} Timestamp or null
 */
export const extractDateFromLine = (line) => {
	if (!line) return null;
	return parseLogDate(line);
};

/**
 * Checks if a log line is a port UP event
 * @param {string} line - Log line to check
 * @returns {boolean} True if line indicates port went UP
 */
export const isPortUpEvent = (line) => {
	if (!line) return false;
	const hasUpCid = line.includes(`CID=${INTERFACE_STATE_PATTERNS.UP.cid}`);
	const hasAlarmId = line.includes(`alarmID=${INTERFACE_STATE_PATTERNS.alarmId}`);
	const hasClearType = line.includes('clearType=service_resume');
	return hasUpCid && hasAlarmId && hasClearType;
};

/**
 * Checks if a log line is a port DOWN event
 * @param {string} line - Log line to check
 * @returns {boolean} True if line indicates port went DOWN
 */
export const isPortDownEvent = (line) => {
	if (!line) return false;
	const hasDownCid = line.includes(`CID=${INTERFACE_STATE_PATTERNS.DOWN.cid}`);
	const hasAlarmId = line.includes(`alarmID=${INTERFACE_STATE_PATTERNS.alarmId}`);
	// DOWN event should NOT have clearType
	const noClearType = !line.includes('clearType=');
	return hasDownCid && hasAlarmId && noClearType;
};

/**
 * Checks if a log line matches interface state change (UP or DOWN)
 * @param {string} line - Log line to check
 * @returns {boolean} True if line is a port state change event
 */
export const matchesInterfaceStateFilter = (line) => {
	return isPortUpEvent(line) || isPortDownEvent(line);
};

/**
 * Filters log lines to keep only interface state changes (UP or DOWN)
 * @param {string[]} lines - Array of log lines
 * @returns {string[]} Filtered log lines matching UP or DOWN events
 */
export const filterInterfaceStateLines = (lines) => {
	if (!Array.isArray(lines)) return [];
	return lines.filter(line => matchesInterfaceStateFilter(line));
};

/**
 * Filters log lines that are newer than a given timestamp
 * @param {string[]} lines - Array of log lines
 * @param {number} afterTimestamp - Only keep lines after this timestamp
 * @returns {string[]} Lines newer than the timestamp
 */
export const filterLinesAfterTimestamp = (lines, afterTimestamp) => {
	if (!Array.isArray(lines) || !afterTimestamp) return lines;

	return lines.filter(line => {
		const lineTime = extractDateFromLine(line);
		return lineTime && lineTime > afterTimestamp;
	});
};

/**
 * Gets the timestamp of the first (most recent) log line
 * @param {string[]} lines - Array of log lines (newest first)
 * @returns {number|null} Timestamp of first line or null
 */
export const getLatestLogTimestamp = (lines) => {
	if (!Array.isArray(lines) || lines.length === 0) return null;
	return extractDateFromLine(lines[0]);
};

/**
 * Gets the timestamp of the last (oldest) log line
 * @param {string[]} lines - Array of log lines (newest first)
 * @returns {number|null} Timestamp of last line or null
 */
export const getOldestLogTimestamp = (lines) => {
	if (!Array.isArray(lines) || lines.length === 0) return null;
	return extractDateFromLine(lines[lines.length - 1]);
};

/**
 * Extracts log lines from collapsible content span
 * @param {string} output - HTML output containing collapsible content
 * @returns {string[]} Array of trimmed log lines
 */
export const extractCollapsibleContent = (output) => {
	if (typeof output !== 'string' || output.length === 0) {
		return [];
	}

	const match = output.match(COLLAPSIBLE_CONTENT_REGEX);

	if (!match) {
		return [];
	}

	return match[1]
		.replace(/\r\n/g, '\n')
		.replace(/\n{2,}/g, '\n')
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean);
};

/**
 * Extracts port identifier from a log line
 * @param {string} line - Log line
 * @returns {string|null} Port identifier like "3/1/17" or null
 */
export const extractPortFromLine = (line) => {
	if (!line) return null;
	// Match port patterns like "3/1/17", "2/1/5", "1/1/18" at the end of line
	const match = line.match(/(\d+\/\d+\/\d+)\s*$/);
	return match ? match[1] : null;
};

/**
 * Parses interface state from a filtered log line
 * @param {string} line - Filtered log line
 * @returns {Object} Parsed state info with timestamp, state, port, and raw line
 */
export const parseInterfaceState = (line) => {
	const state = isPortUpEvent(line) ? 'UP' : isPortDownEvent(line) ? 'DOWN' : 'UNKNOWN';
	const port = extractPortFromLine(line);
	const timestamp = extractDateFromLine(line);

	return {
		timestamp,
		date: timestamp ? new Date(timestamp).toISOString() : null,
		state,
		port,
		raw: line
	};
};

/**
 * Groups parsed events by port
 * @param {Array<Object>} parsedEvents - Array of parsed interface state events
 * @returns {Object} Events grouped by port { "3/1/17": [...events], "2/1/5": [...events] }
 */
export const groupEventsByPort = (parsedEvents) => {
	const grouped = {};

	for (const event of parsedEvents) {
		if (!event.port) continue;
		if (!grouped[event.port]) {
			grouped[event.port] = [];
		}
		grouped[event.port].push(event);
	}

	// Sort events within each port by timestamp (newest first)
	for (const port of Object.keys(grouped)) {
		grouped[port].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
	}

	return grouped;
};

/**
 * Converts raw API JSON into a clean structure grouped by router and port
 * @param {Object} data - Raw API response data
 * @param {number|null} lastFetchTimestamp - Timestamp of last fetch to filter newer logs
 * @returns {Object} Structured data with routers -> ports -> events hierarchy
 */
export const parseLogJson = (data, lastFetchTimestamp = null) => {
	const resultArray = Array.isArray(data?.result) ? data.result : [];

	// Structure: { routers: { routerName: { routerId, ports: { portId: [events] } } } }
	const result = {
		totalEvents: 0,
		totalPorts: 0,
		routers: {}
	};

	for (const item of resultArray) {
		// Extract all log lines
		const allLogs = extractCollapsibleContent(item?.output);

		// Filter to only interface state changes (UP or DOWN)
		const filteredLogs = filterInterfaceStateLines(allLogs);

		// If we have a last fetch timestamp, only get newer logs
		const newLogs = lastFetchTimestamp
			? filterLinesAfterTimestamp(filteredLogs, lastFetchTimestamp)
			: filteredLogs;

		if (newLogs.length === 0) continue;

		// Parse each log line
		const parsedEvents = newLogs.map(parseInterfaceState);

		// Group by port
		const portGroups = groupEventsByPort(parsedEvents);

		// Get router info
		const routerName = Array.isArray(item?.mts_router_switch_id)
			? item.mts_router_switch_id[1]
			: 'Unknown Router';
		const routerId = Array.isArray(item?.mts_router_switch_id)
			? item.mts_router_switch_id[0]
			: null;

		// Add to result
		if (!result.routers[routerName]) {
			result.routers[routerName] = {
				routerId,
				ports: {}
			};
		}

		// Merge port data
		for (const [port, events] of Object.entries(portGroups)) {
			if (!result.routers[routerName].ports[port]) {
				result.routers[routerName].ports[port] = [];
				result.totalPorts++;
			}
			result.routers[routerName].ports[port].push(...events);
			result.totalEvents += events.length;
		}
	}

	// Sort events within each port by timestamp (newest first)
	for (const router of Object.values(result.routers)) {
		for (const port of Object.keys(router.ports)) {
			router.ports[port].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
		}
	}

	return result;
};

/**
 * Merges new log entries with existing stored logs
 * Deduplicates based on timestamp and raw content
 * @param {string[]} existingLogs - Previously stored logs
 * @param {string[]} newLogs - Newly fetched logs
 * @returns {string[]} Merged and deduplicated logs
 */
export const mergeLogEntries = (existingLogs, newLogs) => {
	const existing = Array.isArray(existingLogs) ? existingLogs : [];
	const incoming = Array.isArray(newLogs) ? newLogs : [];

	// Use Set for deduplication based on exact line content
	const combined = new Set([...incoming, ...existing]);

	// Convert back to array and sort by timestamp (newest first)
	return Array.from(combined).sort((a, b) => {
		const timeA = extractDateFromLine(a) || 0;
		const timeB = extractDateFromLine(b) || 0;
		return timeB - timeA;
	});
};
