// settings.js - User settings storage functions

/**
 * Storage keys
 */
export const StorageKeys = {
	ROUTER_ID: 'routerId',
	SESSION_ID: 'sessionId',
	FIELDS: 'fields'
};

/**
 * Loads settings from Chrome storage
 * @returns {Promise<Object>} Stored settings
 */
export const loadSettings = () => {
	return new Promise((resolve) => {
		chrome.storage.local.get(
			[StorageKeys.ROUTER_ID, StorageKeys.SESSION_ID, StorageKeys.FIELDS],
			(result) => resolve(result)
		);
	});
};

/**
 * Saves settings to Chrome storage
 * @param {Object} settings - Settings to save
 * @returns {Promise<void>}
 */
export const saveSettings = (settings) => {
	return new Promise((resolve) => {
		chrome.storage.local.set(settings, resolve);
	});
};

/**
 * Creates a save settings handler
 * @param {Object} elements - DOM elements containing values to save
 * @returns {Function} Save handler function
 */
export const createSaveHandler = (elements) => {
	const { routerSelect, sessionIdInput, fieldsInput } = elements;

	return () => {
		saveSettings({
			[StorageKeys.ROUTER_ID]: routerSelect.value,
			[StorageKeys.SESSION_ID]: sessionIdInput.value,
			[StorageKeys.FIELDS]: fieldsInput.value
		});
	};
};

/**
 * Applies loaded settings to DOM elements
 * @param {Object} settings - Loaded settings
 * @param {Object} elements - DOM elements
 * @param {Function} onRouterChange - Callback for router change
 */
export const applySettings = (settings, elements, onRouterChange) => {
	const { routerSelect, sessionIdInput, fieldsInput } = elements;

	if (settings[StorageKeys.ROUTER_ID]) {
		routerSelect.value = settings[StorageKeys.ROUTER_ID];
		onRouterChange?.();
	}

	if (settings[StorageKeys.SESSION_ID]) {
		sessionIdInput.value = settings[StorageKeys.SESSION_ID];
	}

	if (settings[StorageKeys.FIELDS]) {
		fieldsInput.value = settings[StorageKeys.FIELDS];
	}
};
