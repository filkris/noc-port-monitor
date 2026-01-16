// session.js - Session management functions

import { SessionStatus, STATUS_MESSAGES } from './config.js';

export { SessionStatus };

/**
 * Updates the session status display
 * @param {HTMLElement} statusElement - The status element to update
 * @param {string} status - The status type
 * @param {string} [customText] - Optional custom text override
 */
export const updateSessionStatus = (statusElement, status, customText = null) => {
	statusElement.className = `session-status ${status}`;
	statusElement.textContent = customText ?? STATUS_MESSAGES[status] ?? status;
};

/**
 * Retrieves session from Chrome cookies
 * @param {string} domain - The cookie domain
 * @param {string} cookieName - The cookie name to find
 * @returns {Promise<string|null>} The session value or null
 */
const getSessionFromCookies = (domain, cookieName) => {
	return new Promise((resolve) => {
		if (!chrome?.cookies) {
			resolve(null);
			return;
		}

		chrome.cookies.getAll({ domain }, (cookies) => {
			const sessionCookie = cookies.find(c => c.name === cookieName);
			resolve(sessionCookie?.value ?? null);
		});
	});
};

/**
 * Retrieves session from Chrome storage
 * @param {string} key - The storage key
 * @returns {Promise<string|null>} The stored session value or null
 */
const getSessionFromStorage = (key) => {
	return new Promise((resolve) => {
		chrome.storage.local.get([key], (result) => {
			resolve(result[key] ?? null);
		});
	});
};

/**
 * Auto-detects session from cookies or storage
 * @param {HTMLInputElement} sessionInput - The session input element
 * @param {HTMLElement} statusElement - The status element
 * @param {Function} onSave - Callback to save settings
 */
export const autoDetectSession = async (sessionInput, statusElement, onSave) => {
	updateSessionStatus(statusElement, SessionStatus.CHECKING);

	const cookieSession = await getSessionFromCookies('nocportal.telekom.rs', 'session_id');

	if (cookieSession) {
		sessionInput.value = cookieSession;
		updateSessionStatus(statusElement, SessionStatus.CONNECTED);
		onSave?.();
		return;
	}

	const storedSession = await getSessionFromStorage('sessionId');

	if (storedSession) {
		sessionInput.value = storedSession;
		updateSessionStatus(statusElement, SessionStatus.SAVED);
		return;
	}

	const message = chrome?.cookies ? STATUS_MESSAGES[SessionStatus.DISCONNECTED] : STATUS_MESSAGES.MANUAL;
	updateSessionStatus(statusElement, SessionStatus.DISCONNECTED, message);
};

/**
 * Validates if a session ID is present
 * @param {string} sessionId - The session ID to validate
 * @throws {Error} If session ID is missing
 */
export const validateSession = (sessionId) => {
	if (!sessionId?.trim()) {
		throw new Error('Session ID is required. Please login to NOC Portal first.');
	}
};
