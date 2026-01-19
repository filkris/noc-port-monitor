import { LOG_PATTERNS } from "../constants/patterns";

export function extractLogLines(output) {
	return output
		.replace(LOG_PATTERNS.BR_TAG, "\n")
		.replace(LOG_PATTERNS.HTML_TAG, "")
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}
