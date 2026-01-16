// router.js - Router-related functions

import { ROUTERS } from './config.js';

/**
 * Populates the router dropdown with options
 * @param {HTMLSelectElement} selectElement - The select element to populate
 */
export const populateRouterDropdown = (selectElement) => {
	ROUTERS.forEach(router => {
		const option = document.createElement('option');
		option.value = router.id;
		option.textContent = router.name;
		option.dataset.type = router.type;
		option.dataset.model = router.model;
		option.dataset.ip = router.ip_address;
		option.dataset.name = router.name;
		selectElement.appendChild(option);
	});
};

/**
 * Gets the selected router from the dropdown
 * @param {string} routerId - The router ID
 * @returns {Object|undefined} The router object or undefined
 */
export const getRouterById = (routerId) => ROUTERS.find(r => r.id === routerId);

/**
 * Extracts router data from selected option
 * @param {HTMLSelectElement} selectElement - The select element
 * @returns {Object|null} Router display data or null
 */
export const getSelectedRouterData = (selectElement) => {
	const selectedOption = selectElement.options[selectElement.selectedIndex];

	if (!selectElement.value) {
		return null;
	}

	return {
		type: selectedOption.dataset.type,
		model: selectedOption.dataset.model,
		ip: selectedOption.dataset.ip,
		name: selectedOption.dataset.name
	};
};

/**
 * Updates the router info display
 * @param {Object} elements - DOM elements for router info
 * @param {HTMLSelectElement} selectElement - The router select element
 */
export const updateRouterInfoDisplay = (elements, selectElement) => {
	const { routerInfo, routerType, routerModel, routerIP } = elements;
	const routerData = getSelectedRouterData(selectElement);

	if (routerData) {
		routerType.textContent = routerData.type;
		routerModel.textContent = routerData.model;
		routerIP.textContent = routerData.ip;
		routerInfo.classList.add('show');
	} else {
		routerInfo.classList.remove('show');
	}
};

/**
 * Validates that a router is selected
 * @param {Object} router - The router object
 * @throws {Error} If no router is selected
 */
export const validateRouter = (router) => {
	if (!router) {
		throw new Error('Please select a router');
	}
};
