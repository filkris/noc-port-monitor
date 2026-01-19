import { INTERFACE_STATE_PATTERNS, LOG_PATTERNS } from "../constants/patterns";

export function parseLogLine(line) {
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
