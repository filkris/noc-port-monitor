import { EMPTY_OUTPUT } from "../constants/patterns";
import { extractLogLines } from "./logExtractor";
import { parseLogLine } from "./logParser";

export function parseRouterLogs(data, router) {
	const resultArray = Array.isArray(data?.result) ? data.result : [];
	const ports = {};
	let totalEvents = 0;
	let hasIssues = false;

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

			if (event.state === "DOWN") {
				hasIssues = true;
			}
		}
	}

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
		lastUpdated: Date.now(),
	};
}
