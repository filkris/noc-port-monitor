// modules/constants.js - Application constants and configuration

export const UID = 370;
export const API_BASE = 'https://nocportal.telekom.rs';
export const ALARM_NAME = 'portMonitorScan';

export const API_ENDPOINTS = {
	CREATE_WIZARD: '/web/dataset/call_kw/mts.router.switch.command.wizard/create',
	CALL_BUTTON: '/web/dataset/call_button',
	READ_WIZARD: '/web/dataset/call_kw/mts.router.switch.command.wizard/read'
};

export const STORAGE_KEYS = {
	SCHEDULER_ENABLED: 'schedulerEnabled',
	SCHEDULER_FREQUENCY: 'schedulerFrequency',
	SESSION_ID: 'sessionId',
	ROUTER_DATA: 'routerData',
	LAST_SCAN: 'lastScan',
	AUTH_STATE: 'authState'
};

export const FREQUENCY_MAP = {
	'1h': 60,
	'2h': 120,
	'3h': 180,
	'6h': 360
};

export const INTERFACE_STATE_PATTERNS = Object.freeze({
	alarmId: '0x0813005b',
	clearType: 'service_resume'
});
