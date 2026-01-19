let notifyCallback = null;

export const setNotifyCallback = (callback) => {
	notifyCallback = callback;
};

export const notify = (type, message, duration = 3000) => {
	if (notifyCallback) {
		notifyCallback(type, message, duration);
	}
};
