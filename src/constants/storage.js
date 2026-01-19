export const STORAGE_KEYS = Object.freeze({
	LAST_CHECK: "lastCheck",
	AUTH_STATE: "authState",
	SESSION_ID: "sessionId",
	ROUTER_DATA: "routerData",
	SIDE_PANEL_MODE: "sidePanelMode",
	SCHEDULER_ENABLED: "schedulerEnabled",
	SCHEDULER_FREQUENCY: "schedulerFrequency",
});

export const ALARM_NAME = "portMonitorScan";

export const STORAGE_DEFAULTS = Object.freeze({
	[STORAGE_KEYS.SCHEDULER_ENABLED]: false,
	[STORAGE_KEYS.SCHEDULER_FREQUENCY]: 60,
	[STORAGE_KEYS.SESSION_ID]: null,
	[STORAGE_KEYS.ROUTER_DATA]: {},
	[STORAGE_KEYS.LAST_CHECK]: null,
	[STORAGE_KEYS.AUTH_STATE]: "unknown",
});
