// api.js - API calls, payloads, and response handling

import { UID, API_BASE, API_TIMEOUT_MS, VALID_FIELD_PATTERN } from './config.js';

export { API_ENDPOINTS } from './config.js';

/**
 * Generates a random request ID
 * @returns {number} Random ID for JSON-RPC request
 */
const generateRequestId = () => Math.floor(Math.random() * 1000000000);

/**
 * Builds the context object for API requests
 * @param {Object} router - The router object
 * @returns {Object} Context object
 */
export const buildContext = (router) => ({
	bin_size: true,
	lang: 'sr@latin',
	tz: 'Europe/Belgrade',
	uid: UID,
	allowed_company_ids: [1],
	full_width: true,
	default_mts_router_switch_id: parseInt(router.id, 10),
	default_mts_router_switch_name: router.name
});

/**
 * Builds payload for creating a wizard
 * @param {Object} router - The router object
 * @returns {Object} Create wizard payload
 */
export const buildCreatePayload = (router) => ({
	jsonrpc: '2.0',
	method: 'call',
	params: {
		args: [{
			mts_router_switch_id: parseInt(router.id, 10),
			interface: 'GigabitEthernet'
		}],
		model: 'mts.router.switch.command.wizard',
		method: 'create',
		kwargs: { context: buildContext(router) }
	},
	id: generateRequestId()
});

/**
 * Builds payload for action_log (executes the log command)
 * @param {Object} router - The router object
 * @param {number} wizardId - The wizard ID
 * @returns {Object} Action log payload
 */
export const buildActionLogPayload = (router, wizardId) => ({
	jsonrpc: '2.0',
	method: 'call',
	params: {
		args: [[wizardId]],
		model: 'mts.router.switch.command.wizard',
		method: 'action_log',
		kwargs: {
			context: {
				lang: 'sr@latin',
				tz: 'Europe/Belgrade',
				uid: UID,
				allowed_company_ids: [1],
				full_width: true,
				active_model: 'mts.router.switch.command.wizard',
				active_id: wizardId,
				active_ids: [wizardId]
			}
		}
	},
	id: generateRequestId()
});

/**
 * Builds payload for reading wizard result
 * @param {Object} router - The router object
 * @param {number} wizardId - The wizard ID
 * @param {string[]} fields - Fields to read
 * @returns {Object} Read payload
 */
export const buildReadPayload = (router, wizardId, fields) => ({
	jsonrpc: '2.0',
	method: 'call',
	params: {
		args: [[wizardId], fields],
		model: 'mts.router.switch.command.wizard',
		method: 'read',
		kwargs: { context: buildContext(router) }
	},
	id: generateRequestId()
});

/**
 * Parses and validates fields string into array
 * @param {string} fieldsStr - Comma-separated fields string
 * @returns {string[]} Array of validated field names
 */
export const parseFields = (fieldsStr) => {
	if (!fieldsStr || typeof fieldsStr !== 'string') {
		return [];
	}

	return fieldsStr
		.split(',')
		.map(f => f.trim())
		.filter(f => f && VALID_FIELD_PATTERN.test(f));
};

/**
 * Makes an API call to the backend with timeout
 * @param {string} endpoint - API endpoint
 * @param {Object} payload - Request payload
 * @param {string} sessionId - Session ID
 * @param {number} [timeout=API_TIMEOUT_MS] - Request timeout in milliseconds
 * @returns {Promise<Object>} API response data
 * @throws {Error} If API returns an error or request times out
 */
export const apiCall = async (endpoint, payload, sessionId, timeout = API_TIMEOUT_MS) => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(`${API_BASE}${endpoint}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: `session_id=${sessionId}`
			},
			body: JSON.stringify(payload),
			credentials: 'include',
			signal: controller.signal
		});

		const data = await response.json();

		if (data.error) {
			const errorMessage = data.error.message || data.error.data?.message || 'API Error';
			throw new Error(errorMessage);
		}

		return data;
	} catch (error) {
		if (error.name === 'AbortError') {
			throw new Error('Request timed out. Please try again.');
		}
		throw error;
	} finally {
		clearTimeout(timeoutId);
	}
};

/**
 * Checks if the API response has valid output
 * @param {Object} result - API response result
 * @returns {boolean} True if output is present and valid
 */
export const hasValidOutput = (result) => {
	const output = result?.result?.[0]?.output;
	return output && output !== false && output !== '<p><br></p>';
};

/**
 * Generates all payloads for clipboard copy
 * @param {Object} router - The router object
 * @param {string[]} fields - Fields to read
 * @returns {Object} All payloads with instructions
 */
export const generateAllPayloads = (router, fields) => ({
	step1_create: buildCreatePayload(router),
	step2_action_log: buildActionLogPayload(router, '<WIZARD_ID>'),
	step3_read: buildReadPayload(router, '<WIZARD_ID>', fields),
	note: 'Execute in order: create → action_log (via /web/dataset/call_button) → read'
});
