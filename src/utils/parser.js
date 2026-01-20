import { INTERFACE_STATE_PATTERNS, LOG_PATTERNS, EMPTY_OUTPUT } from "@/constants/patterns";

function extractLogLines(output) {
	return output
		.replace(LOG_PATTERNS.BR_TAG, "\n")
		.replace(LOG_PATTERNS.HTML_TAG, "")
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

function parseLogLine(line) {
	const hasAlarmId = line.includes(`alarmID=${INTERFACE_STATE_PATTERNS.ALARM_ID}`);
	if (!hasAlarmId) return null;

	const hasClearType = line.includes(`clearType=${INTERFACE_STATE_PATTERNS.CLEAR_TYPE}`);
	const isUp = hasClearType;

	const portMatch = line.match(LOG_PATTERNS.PORT);
	const port = portMatch ? portMatch[1] : null;

	if (!port) return null;

	const dateMatch = line.match(LOG_PATTERNS.DATE);
	let timestamp = null;

	if (dateMatch) {
		const parsed = new Date(dateMatch[1]);
		if (!isNaN(parsed.getTime())) {
			timestamp = parsed.getTime();
		}
	}

	return {
		state: isUp ? "UP" : "DOWN",
		port,
		timestamp,
		date: timestamp ? new Date(timestamp).toISOString() : null,
		raw: line,
	};
}

export function parseRouterLogs(data, router) {
	const resultArray = Array.isArray(data?.result) ? data.result : [];
	const ports = {};
	let totalEvents = 0;

	for (const item of resultArray) {
		const output = item?.output;
		if (!output || output === EMPTY_OUTPUT) continue;

		const lines = extractLogLines(output);

		for (const line of lines) {
			const event = parseLogLine(line);
			if (!event) continue;

			if (!ports[event.port]) {
				ports[event.port] = [];
			}

			ports[event.port].push(event);
			totalEvents++;
		}
	}

	for (const port of Object.keys(ports)) {
		ports[port].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
	}

	const hasIssues = Object.values(ports).some((events) => {
		if (!events || events.length === 0) return false;
		return events[events.length - 1]?.state === "DOWN";
	});

	return {
		routerId: router.id,
		routerName: router.name,
		ports,
		totalEvents,
		affectedPorts: Object.keys(ports).length,
		hasIssues,
		lastUpdated: Date.now(),
	};
}
