export const INTERFACE_STATE_PATTERNS = Object.freeze({
	DOWN_ALARM_IDS: ["0x0813005b", "0x081300a8", "0x0813007c", "0x09110000"],
	FAILURE_ALARM_IDS: ["0x08130059"],
	CLEAR_TYPE: "service_resume",
});

export const LOG_PATTERNS = Object.freeze({
	PORT_VLAN: /(\d+\/\d+\/\d+\.\d+)\s*$/,
	PORT: /(\d+\/\d+\/\d+)\s*$/,
	DATE: /^(\w{3}\s+\d{1,2}\s+\d{4}\s+\d{1,2}:\d{2})/,
	BR_TAG: /<br\s*\/?>/gi,
	HTML_TAG: /<[^>]+>/g,
});

export const EMPTY_OUTPUT = "<p><br></p>";
