// modules/parser.js - Log parsing utilities

import { INTERFACE_STATE_PATTERNS } from './constants.js';

function extractLogLines(output) {
	return output
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean);
}

function parseLogLine(line) {
	const hasAlarmId = line.includes(`alarmID=${INTERFACE_STATE_PATTERNS.alarmId}`);
	if (!hasAlarmId) return null;

	const hasClearType = line.includes(`clearType=${INTERFACE_STATE_PATTERNS.clearType}`);
	const isUp = hasClearType;

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

export function parseRouterLogs(data, router) {
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
