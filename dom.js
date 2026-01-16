// ui.js - DOM manipulation and UI functions

import { StatusType, REQUIRED_ELEMENT_IDS } from './config.js';

export { StatusType };

/**
 * Sets the status message and style
 * @param {HTMLElement} statusElement - The status element
 * @param {string} type - Status type (loading, success, warning, error)
 * @param {string} message - Status message
 */
export const setStatus = (statusElement, type, message) => {
	statusElement.className = type;
	statusElement.textContent = message;
};

/**
 * Shows the response data in the response element
 * @param {HTMLElement} responseElement - The response element
 * @param {Object} data - Data to display
 */
export const showResponse = (responseElement, data) => {
	responseElement.style.display = 'block';
	responseElement.textContent = JSON.stringify(data, null, 2);
};

/**
 * Clears the response element
 * @param {HTMLElement} responseElement - The response element
 */
export const clearResponse = (responseElement) => {
	responseElement.style.display = 'block';
	responseElement.textContent = '';
};

/**
 * Appends a line to the response element
 * @param {HTMLElement} responseElement - The response element
 * @param {string} text - Text to append
 */
export const appendResponse = (responseElement, text) => {
	responseElement.style.display = 'block';
	responseElement.textContent += text + '\n';
};

/**
 * Formats parsed log data into a readable hierarchical display
 * @param {Object} parsedData - Parsed data with routers and ports
 * @returns {string} Formatted output string
 */
export const formatParsedOutput = (parsedData) => {
	if (!parsedData || !parsedData.routers || Object.keys(parsedData.routers).length === 0) {
		return 'No port state changes found.';
	}

	const lines = [];
	lines.push('='.repeat(60));
	lines.push('PORT STATE CHANGES');
	lines.push('='.repeat(60));
	lines.push(`Total: ${parsedData.totalEvents} events across ${parsedData.totalPorts} ports`);
	lines.push('');

	for (const [routerName, routerData] of Object.entries(parsedData.routers)) {
		lines.push(`Router: ${routerName}`);
		lines.push('-'.repeat(50));

		for (const [port, events] of Object.entries(routerData.ports)) {
			lines.push(`  Port ${port}:`);

			for (const event of events) {
				const stateIcon = event.state === 'UP' ? '[UP]  ' : '[DOWN]';
				const dateStr = event.date ? event.date.replace('T', ' ').substring(0, 19) : 'Unknown time';
				lines.push(`    ${stateIcon} ${dateStr}`);
			}
			lines.push('');
		}
		lines.push('');
	}

	return lines.join('\n');
};

/**
 * Toggles visibility of an element
 * @param {Event} event - Click event
 * @param {HTMLElement} element - Element to toggle
 */
export const toggleVisibility = (event, element) => {
	event.preventDefault();
	element.classList.toggle('show');
};

/**
 * Shows an element with the 'show' class
 * @param {HTMLElement} element - Element to show
 */
export const showElement = (element) => {
	element.classList.add('show');
};

/**
 * Hides an element by removing the 'show' class
 * @param {HTMLElement} element - Element to hide
 */
export const hideElement = (element) => {
	element.classList.remove('show');
};

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<void>}
 * @throws {Error} If clipboard access is denied
 */
export const copyToClipboard = async (text) => {
	try {
		await navigator.clipboard.writeText(text);
	} catch (error) {
		throw new Error('Failed to copy to clipboard. Please check browser permissions.');
	}
};

/**
 * Disables a button element
 * @param {HTMLButtonElement} button - Button to disable
 */
export const disableButton = (button) => {
	button.disabled = true;
};

/**
 * Enables a button element
 * @param {HTMLButtonElement} button - Button to enable
 */
export const enableButton = (button) => {
	button.disabled = false;
};

/**
 * Gets element by ID with type safety
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
export const getElementById = (id) => document.getElementById(id);

/**
 * Initializes all DOM element references
 * @returns {Object} Object containing all DOM element references
 * @throws {Error} If any required element is missing
 */
export const initializeDOMElements = () => {
	// Validate all required elements exist
	const missing = REQUIRED_ELEMENT_IDS.filter(id => !document.getElementById(id));
	if (missing.length > 0) {
		throw new Error(`Missing required DOM elements: ${missing.join(', ')}`);
	}

	return {
		// Router elements
		routerSelect: getElementById('routerSelect'),
		routerInfo: getElementById('routerInfo'),
		routerType: getElementById('routerType'),
		routerModel: getElementById('routerModel'),
		routerIP: getElementById('routerIP'),

		// Session elements
		sessionIdInput: getElementById('sessionId'),
		sessionStatus: getElementById('sessionStatus'),
		refreshSessionBtn: getElementById('refreshSessionBtn'),
		showInstructions: getElementById('showInstructions'),
		sessionInstructions: getElementById('sessionInstructions'),

		// Action elements
		fieldsInput: getElementById('fields'),
		sendBtn: getElementById('sendBtn'),
		copyBtn: getElementById('copyBtn'),
		statusDiv: getElementById('status'),
		responseDiv: getElementById('response')
	};
};
