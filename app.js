// app.js - Popup UI Controller

import * as countdown from './modules/countdown.js';

const elements = {};
let state = {};

document.addEventListener('DOMContentLoaded', init);

async function init() {
	cacheElements();
	bindEvents();
	await tryDetectSession();
	await loadState();
	render();
}

function cacheElements() {
	elements.authScreen = document.getElementById('authScreen');
	elements.authMessage = document.getElementById('authMessage');
	elements.mainContent = document.getElementById('mainContent');
	elements.schedulerToggle = document.getElementById('schedulerToggle');
	elements.frequencySelect = document.getElementById('frequencySelect');
	elements.scanRouterSelect = document.getElementById('scanRouterSelect');
	elements.scanBtn = document.getElementById('scanBtn');
	elements.countdown = document.getElementById('countdown');
	elements.statusBar = document.getElementById('statusBar');
	elements.routerAccordion = document.getElementById('routerAccordion');

	// Templates
	elements.routerItemTemplate = document.getElementById('routerItemTemplate').innerHTML;
	elements.portGroupTemplate = document.getElementById('portGroupTemplate').innerHTML;
	elements.eventTemplate = document.getElementById('eventTemplate').innerHTML;
}

function bindEvents() {
	elements.schedulerToggle.addEventListener('change', handleSchedulerToggle);
	elements.frequencySelect.addEventListener('change', handleFrequencyChange);
	elements.scanBtn.addEventListener('click', handleScan);
	elements.routerAccordion.addEventListener('click', handleAccordionClick);
}

async function tryDetectSession() {
	try {
		const tabs = await chrome.tabs.query({ url: '*://nocportal.telekom.rs/*' });
		if (tabs.length > 0) {
			const cookies = await chrome.cookies.getAll({ domain: 'nocportal.telekom.rs' });
			const sessionCookie = cookies.find(c => c.name === 'session_id');
			if (sessionCookie?.value) {
				await chrome.runtime.sendMessage({
					action: 'sessionDetected',
					sessionId: sessionCookie.value
				});
			}
		}
	} catch (e) {
		// Cookies API may not be available
	}
}

async function loadState() {
	state = await chrome.runtime.sendMessage({ action: 'getState' });
}

function render() {
	// Check auth state - only block if explicitly logged out
	if (state.authState === 'logged_out') {
		showAuthScreen('Please login to NOC Portal');
		return;
	}

	// If we have a session, show main content regardless of authState
	if (state.sessionId) {
		elements.authScreen.classList.add('hidden');
		elements.mainContent.classList.remove('hidden');
		renderMainContent();
		return;
	}

	// No session - show appropriate message
	showAuthScreen('Open NOC Portal to detect session');
}

function renderMainContent() {
	// Render scheduler
	elements.schedulerToggle.checked = state.schedulerEnabled;
	elements.frequencySelect.value = state.schedulerFrequency || '1h';
	elements.frequencySelect.disabled = !state.schedulerEnabled;

	// Render router select
	renderRouterSelect();

	// Render footer status
	renderFooterStatus();

	// Render countdown
	if (state.schedulerEnabled) {
		const baseTime = state.lastScan || state.schedulerStartTime;
		if (baseTime) {
			countdown.start(elements.countdown, baseTime, state.schedulerFrequency);
		}
	} else {
		countdown.stop();
	}

	// Render accordion
	renderAccordion();
}

function showAuthScreen(message) {
	elements.authScreen.classList.remove('hidden');
	elements.mainContent.classList.add('hidden');
	elements.authMessage.textContent = message;
}

function renderRouterSelect() {
	const select = elements.scanRouterSelect;
	select.innerHTML = '<option value="all">All Routers</option>';

	if (state.routers) {
		for (const router of state.routers) {
			const option = document.createElement('option');
			option.value = router.id;
			option.textContent = router.name;
			select.appendChild(option);
		}
	}
}

function renderAccordion() {
	const accordion = elements.routerAccordion;

	// Preserve open state
	const openRouterIds = new Set(
		Array.from(accordion.querySelectorAll('.accordion-item.open'))
			.map(item => item.dataset.routerId)
	);

	accordion.innerHTML = '';

	if (!state.routers) return;

	for (const router of state.routers) {
		const routerData = state.routerData?.[router.id];
		const html = renderRouterItem(router, routerData, openRouterIds.has(router.id));
		accordion.insertAdjacentHTML('beforeend', html);
	}
}

function renderRouterItem(router, data, isOpen = false) {
	let indicatorClass = 'gray';
	let affectedPorts = 0;
	let portContent = '<div class="no-data">No data yet</div>';

	if (data && data.ports && Object.keys(data.ports).length > 0) {
		affectedPorts = data.affectedPorts || 0;
		// Check if any port's last event is DOWN
		const hasDownPort = Object.values(data.ports).some(events =>
			events.length > 0 && events[0].state === 'DOWN'
		);
		indicatorClass = hasDownPort ? 'red' : 'green';

		if (data.ports && Object.keys(data.ports).length > 0) {
			portContent = renderPorts(data.ports);
		}
	}

	const newBadge = hasNewChanges(router.id) ? '<span class="badge-new">new</span>' : '';

	return elements.routerItemTemplate
		.replace('{{openClass}}', isOpen ? 'open' : '')
		.replace('{{routerId}}', router.id)
		.replace('{{indicatorClass}}', indicatorClass)
		.replace('{{routerName}}', router.name)
		.replace('{{newBadge}}', newBadge)
		.replace('{{affectedPorts}}', affectedPorts)
		.replace('{{vendor}}', router.vendor)
		.replace('{{type}}', router.type)
		.replace('{{model}}', router.model)
		.replace('{{ip}}', router.ip_address)
		.replace('{{portContent}}', portContent);
}

function renderPorts(ports) {
	let html = '';

	for (const [portId, events] of Object.entries(ports)) {
		const eventsHtml = events.map(event => renderEvent(event)).join('');

		html += elements.portGroupTemplate
			.replace('{{portId}}', portId)
			.replace('{{events}}', eventsHtml);
	}

	return html;
}

function renderEvent(event) {
	const eventClass = event.state === 'UP' ? 'up' : 'down';
	const stateText = event.state === 'UP' ? '[UP]' : '[DOWN]';
	const timestamp = event.timestamp
		? formatDate(new Date(event.timestamp))
		: 'Unknown time';

	return elements.eventTemplate
		.replace('{{eventClass}}', eventClass)
		.replace('{{state}}', stateText)
		.replace('{{timestamp}}', timestamp);
}

function formatDate(date) {
	const pad = n => n.toString().padStart(2, '0');
	const day = pad(date.getDate());
	const month = pad(date.getMonth() + 1);
	const year = date.getFullYear();
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());
	return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

async function handleSchedulerToggle(e) {
	const enabled = e.target.checked;
	const frequency = elements.frequencySelect.value;

	setStatus('loading', 'Updating scheduler...');

	const result = await chrome.runtime.sendMessage({
		action: 'setScheduler',
		enabled,
		frequency
	});

	if (result.success) {
		state.schedulerEnabled = enabled;
		state.schedulerStartTime = result.schedulerStartTime;
		elements.frequencySelect.disabled = !enabled;
		setStatus('success', enabled ? 'Scheduler enabled' : 'Scheduler disabled');
		renderMainContent();
	} else {
		setStatus('error', 'Failed to update scheduler');
		e.target.checked = !enabled;
	}

	clearStatusAfterDelay();
}

async function handleFrequencyChange(e) {
	const frequency = e.target.value;
	const enabled = elements.schedulerToggle.checked;

	if (!enabled) return;

	setStatus('loading', 'Updating frequency...');

	const result = await chrome.runtime.sendMessage({
		action: 'setScheduler',
		enabled,
		frequency
	});

	if (result.success) {
		state.schedulerFrequency = frequency;
		setStatus('success', 'Frequency updated');
	} else {
		setStatus('error', 'Failed to update frequency');
	}

	clearStatusAfterDelay();
}

async function handleScan() {
	const routerId = elements.scanRouterSelect.value;
	elements.scanBtn.disabled = true;

	// Try to detect session again before scanning
	await tryDetectSession();
	await loadState();

	if (!state.sessionId) {
		setStatus('error', 'No session - open NOC Portal first');
		elements.scanBtn.disabled = false;
		clearStatusAfterDelay();
		return;
	}

	if (routerId === 'all') {
		setStatus('loading', 'Scanning all routers...');
		const result = await chrome.runtime.sendMessage({ action: 'scanAll' });

		if (result.success) {
			state.routerData = result.results;
			state.lastScan = Date.now();
			setStatus('success', 'Scan completed');
			render();
		} else {
			setStatus('error', result.error || 'Scan failed');
		}
	} else {
		const router = state.routers.find(r => r.id === routerId);
		setStatus('loading', `Scanning ${router?.name || routerId}...`);

		const result = await chrome.runtime.sendMessage({
			action: 'scanRouter',
			routerId
		});

		if (result.success) {
			if (!state.routerData) state.routerData = {};
			state.routerData[routerId] = result.result;
			state.lastScan = Date.now();
			setStatus('success', 'Scan completed');
			render();
		} else {
			setStatus('error', result.error || 'Scan failed');
		}
	}

	elements.scanBtn.disabled = false;
	clearStatusAfterDelay();
}

function handleAccordionClick(e) {
	const header = e.target.closest('.accordion-header');
	if (!header) return;

	const item = header.closest('.accordion-item');
	const routerId = item.dataset.routerId;

	// Remove badge and mark seen when clicking anywhere on header
	const badge = item.querySelector('.badge-new');
	if (badge) {
		badge.remove();
		markRouterSeen(routerId);
	}

	item.classList.toggle('open');
}

function markRouterSeen(routerId) {
	if (state.routerData?.[routerId]) {
		// Update local state immediately to prevent badge reappearing on re-render
		state.routerData[routerId].lastSeenState = getCurrentPortStates(routerId);
		// Persist to storage asynchronously (don't await)
		chrome.runtime.sendMessage({
			action: 'updateRouterSeen',
			routerId,
			lastSeenState: state.routerData[routerId].lastSeenState
		});
	}
}

function getCurrentPortStates(routerId) {
	const data = state.routerData?.[routerId];
	if (!data?.ports) return {};
	const states = {};
	for (const [port, events] of Object.entries(data.ports)) {
		if (events.length > 0) states[port] = events[0].state;
	}
	return states;
}

function hasNewChanges(routerId) {
	const data = state.routerData?.[routerId];
	if (!data?.ports || !data.lastSeenState) return Object.keys(data?.ports || {}).length > 0;
	const current = getCurrentPortStates(routerId);
	for (const [port, state] of Object.entries(current)) {
		if (data.lastSeenState[port] !== state) return true;
	}
	return false;
}

let activeStatus = null;

function renderFooterStatus() {
	if (activeStatus) return;
	if (state.lastScan) {
		const date = new Date(state.lastScan);
		elements.statusBar.textContent = `Last scan: ${formatDate(date)}`;
	} else {
		elements.statusBar.textContent = '';
	}
}

function setStatus(type, message) {
	activeStatus = { type, message };
	elements.statusBar.textContent = message;
}

function clearStatusAfterDelay(delay = 3000) {
	setTimeout(() => {
		activeStatus = null;
		renderFooterStatus();
	}, delay);
}

// Listen for storage changes to update UI
chrome.storage.onChanged.addListener((changes, area) => {
	if (area === 'local') {
		// Update scanning status in footer
		if (changes.scanningRouter) {
			if (changes.scanningRouter.newValue) {
				setStatus('loading', `Scanning ${changes.scanningRouter.newValue}...`);
			} else {
				activeStatus = null;
				renderFooterStatus();
			}
		}
		// Skip re-render if only routerData changed (from our own updateRouterSeen)
		const isOnlyRouterDataChange = Object.keys(changes).length === 1 && changes.routerData;
		if (!isOnlyRouterDataChange) {
			loadState().then(render);
		}
	}
});
