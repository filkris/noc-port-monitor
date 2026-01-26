import { useMemo } from "react";

export function usePortStatus(ports) {
	return useMemo(() => {
		if (!ports || Object.keys(ports).length === 0) {
			return "gray";
		}

		const portEntries = Object.values(ports);
		const latestStates = portEntries
			.filter((events) => events && events.length > 0)
			.map((events) => events[0]?.state);

		if (latestStates.length === 0) return "gray";
		if (latestStates.includes("DOWN")) return "red";
		if (latestStates.includes("FAILURE")) return "orange";
		if (latestStates.includes("RESUME")) return "blue";
		if (latestStates.every((state) => state === "UP")) return "green";

		return "gray";
	}, [ports]);
}
