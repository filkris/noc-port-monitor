export const INTERFACE_STATE_PATTERNS = Object.freeze({
	ALARM_ID: "0x0813005b",
	CLEAR_TYPE: "service_resume",
});

export const LOG_PATTERNS = Object.freeze({
	PORT: /(\d+\/\d+\/\d+)\s*$/,
	DATE: /^(\w{3}\s+\d{1,2}\s+\d{4}\s+\d{1,2}:\d{2})/,
	BR_TAG: /<br\s*\/?>/gi,
	HTML_TAG: /<[^>]+>/g,
});

export const EMPTY_OUTPUT = "<p><br></p>";
