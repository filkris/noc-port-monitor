import { useMemo } from "react";

export function usePortStatus(ports) {
	return useMemo(() => {
		if (!ports || Object.keys(ports).length === 0) {
			return "gray";
		}

		const portEntries = Object.values(ports);
		const hasDown = portEntries.some((events) => {
			if (!events || events.length === 0) return false;
			return events[0]?.state === "DOWN";
		});

		if (hasDown) return "red";

		const allUp = portEntries.every((events) => {
			if (!events || events.length === 0) return false;
			return events[0]?.state === "UP";
		});

		if (allUp) return "green";

		return "gray";
	}, [ports]);
}
