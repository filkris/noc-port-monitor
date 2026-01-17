// config.js - Application configuration

/**
 * User ID for API requests
 * @type {number}
 */
export const UID = 370;

/**
 * Base URL for API endpoints
 * @type {string}
 */
export const API_BASE = 'https://nocportal.telekom.rs';

/**
 * Default timeout for API calls (30 seconds)
 * @type {number}
 */
export const API_TIMEOUT_MS = 30000;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
	CREATE_WIZARD: '/web/dataset/call_kw/mts.router.switch.command.wizard/create',
	CALL_BUTTON: '/web/dataset/call_button',
	READ_WIZARD: '/web/dataset/call_kw/mts.router.switch.command.wizard/read'
};

/**
 * Valid field name pattern (alphanumeric, underscores, dots)
 * @type {RegExp}
 */
export const VALID_FIELD_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_.]*$/;

/**
 * Alarm name for scheduler
 * @type {string}
 */
export const ALARM_NAME = 'portMonitorScan';

/**
 * Storage keys for extension state
 */
export const STORAGE_KEYS = {
	SCHEDULER_ENABLED: 'schedulerEnabled',
	SCHEDULER_FREQUENCY: 'schedulerFrequency',
	SESSION_ID: 'sessionId',
	ROUTER_DATA: 'routerData',
	LAST_SCAN: 'lastScan',
	AUTH_STATE: 'authState'
};

/**
 * Frequency map for scheduler (in minutes)
 */
export const FREQUENCY_MAP = {
	'1h': 60,
	'2h': 120,
	'3h': 180,
	'6h': 360
};

/**
 * Filter configuration for interface state changes
 */
export const INTERFACE_STATE_PATTERNS = Object.freeze({
	alarmId: '0x0813005b',
	clearType: 'service_resume'
});

/**
 * Status types for display
 */
export const StatusType = {
	LOADING: 'loading',
	SUCCESS: 'success',
	WARNING: 'warning',
	ERROR: 'error'
};

/**
 * NOC Portal domain
 * @type {string}
 */
export const NOC_PORTAL_DOMAIN = 'nocportal.telekom.rs';

/**
 * Required DOM element IDs
 * @type {string[]}
 */
export const REQUIRED_ELEMENT_IDS = [
	'routerSelect', 'routerInfo', 'routerType', 'routerModel', 'routerIP',
	'sessionId', 'sessionStatus', 'refreshSessionBtn', 'showInstructions', 'sessionInstructions',
	'fields', 'sendBtn', 'copyBtn', 'status', 'response'
];

/**
 * Regex pattern for extracting collapsible content
 * @type {RegExp}
 */
export const COLLAPSIBLE_CONTENT_REGEX = /<span class=['"]collapsible_content['"]>([\s\S]*?)<\/span>/i;

/**
 * Regex pattern for parsing log line date
 * @type {RegExp}
 */
export const LOG_DATE_REGEX = /^(\w{3}\s+\d{1,2}\s+\d{4}\s+\d{1,2}:\d{2})/;

/**
 * Session status types
 */
export const SessionStatus = {
	CHECKING: 'checking',
	CONNECTED: 'connected',
	SAVED: 'saved',
	DISCONNECTED: 'disconnected'
};

/**
 * Session status messages
 */
export const STATUS_MESSAGES = {
	[SessionStatus.CHECKING]: '🔍 Checking...',
	[SessionStatus.CONNECTED]: '✓ Auto-detected',
	[SessionStatus.SAVED]: '⚠ Using saved',
	[SessionStatus.DISCONNECTED]: '✗ Not logged in',
	MANUAL: '✗ Enter manually'
};

/**
 * Storage keys for logs
 */
export const LogStorageKeys = {
	INTERFACE_LOGS: 'interfaceLogs',
	LAST_FETCH_TIME: 'lastFetchTime',
	ROUTER_LOG_PREFIX: 'routerLog_'
};

/**
 * Maximum number of log entries to keep per router
 * @type {number}
 */
export const MAX_LOGS_PER_ROUTER = 5000;

/**
 * Available routers configuration
 * @type {ReadonlyArray<Object>}
 */
export const ROUTERS = Object.freeze([
	{
		id: "1030",
		name: "N-PE_NS_NOVI-SAD-TKC_1",
		vendor: "Huawei",
		type: "TRANSIT",
		model: "NE40E-X16A",
		ip_address: "212.200.16.40",
	},
	{
		id: "1031",
		name: "N-PE_NS_SATELIT1_1",
		vendor: "Huawei",
		type: "TRANSIT",
		model: "NE40E-X16A",
		ip_address: "212.200.16.41",
	},
	{
		id: "1241",
		name: "U-PE_NS_BAC_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X2-M8A",
		ip_address: "212.200.2.71",
	},
	{
		id: "1242",
		name: "U-PE_NS_BACKA-PALANKA_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X16A",
		ip_address: "212.200.233.150",
	},
	{
		id: "1243",
		name: "U-PE_NS_BACKI_PETROVAC_1",
		vendor: "Huawei",
		type: "MAN",
		model: "8000 M14",
		ip_address: "212.200.2.27",
	},
	{
		id: "1244",
		name: "U-PE_NS_BAKIC_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X16A",
		ip_address: "212.200.16.25",
	},
	{
		id: "1245",
		name: "U-PE_NS_BECEJ_1",
		vendor: "Huawei",
		type: "MAN",
		model: "8000 M14",
		ip_address: "212.200.1.110",
	},
	{
		id: "1246",
		name: "U-PE_NS_BEOCIN_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X8A",
		ip_address: "212.200.1.72",
	},
	{
		id: "1247",
		name: "U-PE_NS_DETELINARA_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X8A",
		ip_address: "212.200.16.24",
	},
	{
		id: "1248",
		name: "U-PE_NS_FUTOG_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X2-M8A",
		ip_address: "212.200.2.86",
	},
	{
		id: "1249",
		name: "U-PE_NS_KAC_1",
		vendor: "Huawei",
		type: "MAN",
		model: "8000 M14",
		ip_address: "212.200.2.58",
	},
	{
		id: "1250",
		name: "U-PE_NS_KLISA_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X8A",
		ip_address: "212.200.1.35",
	},
	{
		id: "1251",
		name: "U-PE_NS_LIMAN_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X8",
		ip_address: "212.200.16.42",
	},
	{
		id: "1252",
		name: "U-PE_NS_NOVI-SAD-TKC_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X16A",
		ip_address: "212.200.1.31",
	},
	{
		id: "1253",
		name: "U-PE_NS_NOVI-SAD-TKC_2",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X8",
		ip_address: "212.200.1.32",
	},
	{
		id: "1254",
		name: "U-PE_NS_PETROVARADIN_1",
		vendor: "Huawei",
		type: "MAN",
		model: "8000 M14",
		ip_address: "212.200.1.71",
	},
	{
		id: "1255",
		name: "U-PE_NS_PODBARA_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X2-M8",
		ip_address: "212.200.1.124",
	},
	{
		id: "1256",
		name: "U-PE_NS_SAJKAS_1",
		vendor: "Huawei",
		type: "MAN",
		model: "8000 M14",
		ip_address: "212.200.1.69",
	},
	{
		id: "1257",
		name: "U-PE_NS_SANTIC_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X16A",
		ip_address: "212.200.16.23",
	},
	{
		id: "1258",
		name: "U-PE_NS_SATELIT1_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X16A",
		ip_address: "212.200.1.33",
	},
	{
		id: "1259",
		name: "U-PE_NS_SRBOBRAN_1",
		vendor: "Huawei",
		type: "MAN",
		model: "8000 M14",
		ip_address: "212.200.2.51",
	},
	{
		id: "1260",
		name: "U-PE_NS_SREMSKA-KAMENICA_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X8",
		ip_address: "212.200.1.39",
	},
	{
		id: "1261",
		name: "U-PE_NS_SREMSKI-KARLOVCI_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X2-M8A",
		ip_address: "212.200.2.72",
	},
	{
		id: "1262",
		name: "U-PE_NS_TEMERIN_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X2-M16A",
		ip_address: "212.200.1.111",
	},
	{
		id: "1263",
		name: "U-PE_NS_VETERNIK_1",
		vendor: "Huawei",
		type: "MAN",
		model: "8000 M14",
		ip_address: "212.200.1.112",
	},
	{
		id: "1264",
		name: "U-PE_NS_VRBAS_1",
		vendor: "Huawei",
		type: "MAN",
		model: "NE40E-X8A",
		ip_address: "212.200.1.41",
	},
	{
		id: "1265",
		name: "U-PE_NS_ZABALJ_1",
		vendor: "Huawei",
		type: "MAN",
		model: "8000 M14",
		ip_address: "212.200.1.114",
	},
	{
		id: "1266",
		name: "U-PE_NS_NOVI-LEDINCI_1",
		vendor: "Huawei",
		type: "MAN",
		model: "8000 M8",
		ip_address: "212.200.0.8",
	},
	{
		id: "1340",
		name: "U-PE-MOB_NS_ZELEZNICKA-STANICA_1",
		vendor: "Huawei",
		type: "MOB",
		model: "NE40E-X8A",
		ip_address: "212.200.1.101",
	},
	{
		id: "1409",
		name: "U-PE-MOB_NS_NESTIN_1",
		vendor: "Huawei",
		type: "MOB",
		model: "NE40E-X2-M8A",
		ip_address: "212.200.0.16"
	}
]);
