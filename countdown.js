// countdown.js - Countdown timer module for next scheduled scan

import { FREQUENCY_MAP } from './config.js';

let intervalId = null;
let countdownElement = null;

/**
 * Calculates remaining time until next scan
 * @param {number} lastScan - Timestamp of last scan
 * @param {string} frequency - Frequency key (e.g., '1h', '2h')
 * @returns {number} Remaining milliseconds, or 0 if past due
 */
export const calculateRemaining = (lastScan, frequency) => {
	if (!lastScan || !frequency) return 0;

	const intervalMinutes = FREQUENCY_MAP[frequency];
	if (!intervalMinutes) return 0;

	const intervalMs = intervalMinutes * 60 * 1000;
	const nextScan = lastScan + intervalMs;
	const remaining = nextScan - Date.now();

	return remaining > 0 ? remaining : 0;
};

/**
 * Formats milliseconds into MM:SS or HH:MM:SS string
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time string
 */
export const formatTime = (ms) => {
	if (ms <= 0) return '00:00';

	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const pad = (n) => n.toString().padStart(2, '0');

	if (hours > 0) {
		return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
	}
	return `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Updates the countdown display
 * @param {number} lastScan - Timestamp of last scan
 * @param {string} frequency - Frequency key
 */
const updateDisplay = (lastScan, frequency) => {
	if (!countdownElement) return;

	const remaining = calculateRemaining(lastScan, frequency);

	if (remaining > 0) {
		countdownElement.textContent = `Next scan: ${formatTime(remaining)}`;
		countdownElement.classList.remove('hidden');
	} else {
		countdownElement.textContent = '';
		countdownElement.classList.add('hidden');
	}
};

/**
 * Starts the countdown timer
 * @param {HTMLElement} element - DOM element to display countdown
 * @param {number} lastScan - Timestamp of last scan
 * @param {string} frequency - Frequency key
 */
export const start = (element, lastScan, frequency) => {
	stop();

	countdownElement = element;

	if (!lastScan || !frequency) {
		if (countdownElement) {
			countdownElement.textContent = '';
			countdownElement.classList.add('hidden');
		}
		return;
	}

	updateDisplay(lastScan, frequency);

	intervalId = setInterval(() => {
		updateDisplay(lastScan, frequency);
	}, 1000);
};

/**
 * Stops the countdown timer
 */
export const stop = () => {
	if (intervalId) {
		clearInterval(intervalId);
		intervalId = null;
	}
	if (countdownElement) {
		countdownElement.textContent = '';
		countdownElement.classList.add('hidden');
	}
};

/**
 * Restarts countdown with new values
 * @param {number} lastScan - Timestamp of last scan
 * @param {string} frequency - Frequency key
 */
export const restart = (lastScan, frequency) => {
	if (countdownElement) {
		start(countdownElement, lastScan, frequency);
	}
};
