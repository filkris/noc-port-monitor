import { useState, useEffect, useCallback } from "react";

export function useNotification() {
	const [notification, setNotification] = useState(null);

	const showNotification = useCallback((type, message, duration = 3000) => {
		setNotification({ type, message });
		if (duration > 0) {
			setTimeout(() => setNotification(null), duration);
		}
	}, []);

	const clearNotification = useCallback(() => {
		setNotification(null);
	}, []);

	return { notification, showNotification, clearNotification };
}
