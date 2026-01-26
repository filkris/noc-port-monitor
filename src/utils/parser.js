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
	const isDownAlarm = INTERFACE_STATE_PATTERNS.DOWN_ALARM_IDS.some((id) => line.includes(`alarmID=${id}`));
	const isFailedAlarm = INTERFACE_STATE_PATTERNS.FAILURE_ALARM_IDS.some((id) => line.includes(`alarmID=${id}`));

	if (!isDownAlarm && !isFailedAlarm) return null;

	const hasClearType = line.includes(`clearType=${INTERFACE_STATE_PATTERNS.CLEAR_TYPE}`);

	let state;
	if (isDownAlarm) {
		state = hasClearType ? "UP" : "DOWN";
	} else {
		state = hasClearType ? "RESUME" : "FAILURE";
	}

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
		state,
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
		ports[port].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
	}

	const hasIssues = Object.values(ports).some((events) => {
		if (!events || events.length === 0) return false;
		const latestState = events[0]?.state;
		return latestState === "DOWN" || latestState === "FAILURE";
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
