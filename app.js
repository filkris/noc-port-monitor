// popup.js - Popup UI Controller

import * as countdown from './countdown.js';

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
	elements.rebootBtn = document.getElementById('rebootBtn');
	elements.resizeBtn = document.getElementById('resizeBtn');
	elements.lastScan = document.getElementById('lastScan');
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
	elements.rebootBtn.addEventListener('click', handleReboot);
	elements.resizeBtn.addEventListener('click', handleResizeToggle);
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

	// Render last scan
	if (state.lastScan) {
		const date = new Date(state.lastScan);
		elements.lastScan.textContent = `Last scan: ${date.toLocaleString()}`;
	} else {
		elements.lastScan.textContent = '';
	}

	// Render countdown
	if (state.schedulerEnabled && state.lastScan) {
		countdown.start(elements.countdown, state.lastScan, state.schedulerFrequency);
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
	accordion.innerHTML = '';

	if (!state.routers) return;

	for (const router of state.routers) {
		const routerData = state.routerData?.[router.id];
		const html = renderRouterItem(router, routerData);
		accordion.insertAdjacentHTML('beforeend', html);
	}
}

function renderRouterItem(router, data) {
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

	return elements.routerItemTemplate
		.replace('{{routerId}}', router.id)
		.replace('{{indicatorClass}}', indicatorClass)
		.replace('{{routerName}}', router.name)
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
		elements.frequencySelect.disabled = !enabled;
		setStatus('success', enabled ? 'Scheduler enabled' : 'Scheduler disabled');
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

async function handleReboot() {
	if (!confirm('This will clear all data and reset the extension. Continue?')) {
		return;
	}

	setStatus('loading', 'Rebooting extension...');

	const result = await chrome.runtime.sendMessage({ action: 'reboot' });

	if (result.success) {
		setStatus('success', 'Extension rebooted');
		await loadState();
		render();
	} else {
		setStatus('error', 'Reboot failed');
	}

	clearStatusAfterDelay();
}

function handleAccordionClick(e) {
	const header = e.target.closest('.accordion-header');
	if (!header) return;

	const item = header.closest('.accordion-item');
	item.classList.toggle('open');
}

let resizeEnabled = false;

function handleResizeToggle() {
	resizeEnabled = !resizeEnabled;
	document.body.classList.toggle('resizable', resizeEnabled);
	elements.resizeBtn.classList.toggle('active', resizeEnabled);
}

function setStatus(type, message) {
	elements.statusBar.className = `status-bar ${type}`;
	elements.statusBar.textContent = message;
}

function clearStatusAfterDelay(delay = 3000) {
	setTimeout(() => {
		elements.statusBar.className = 'status-bar';
		elements.statusBar.textContent = '';
	}, delay);
}

// Listen for storage changes to update UI
chrome.storage.onChanged.addListener((changes, area) => {
	if (area === 'local') {
		loadState().then(render);
	}
});
