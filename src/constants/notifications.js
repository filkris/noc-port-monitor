export const NOTIFICATION_TYPES = Object.freeze({
	loading: "bg-blue-100 text-blue-700",
	success: "bg-green-100 text-green-700",
	error: "bg-red-100 text-red-700",
});

export const NOTIFICATION_MESSAGES = Object.freeze({
	UPDATING_SCHEDULER: "Updating scheduler...",
	SCHEDULER_ENABLED: "Scheduler enabled",
	SCHEDULER_DISABLED: "Scheduler disabled",
	SCHEDULER_FAILED: "Failed to update scheduler",
	UPDATING_FREQUENCY: "Updating frequency...",
	FREQUENCY_UPDATED: "Frequency updated",
	FREQUENCY_FAILED: "Failed to update frequency",
	NO_SESSION: "No session - open NOC Portal first",
	SCANNING_ALL: "Scanning all routers...",
	SCAN_COMPLETED: "Scan completed",
	SCAN_FAILED: "Scan failed",
});
