import { useState, useEffect, useCallback } from "react";
import { NOTIFICATION_TYPES } from "@/constants/notifications";

let notifyGlobal = null;

export const notify = (type, message, duration = 3000) => {
	if (notifyGlobal) {
		notifyGlobal(type, message, duration);
	}
};

export default function Notification() {
	const [notification, setNotification] = useState(null);

	const showNotification = useCallback((type, message, duration = 3000) => {
		setNotification({ type, message });
		if (duration > 0) {
			setTimeout(() => setNotification(null), duration);
		}
	}, []);

	useEffect(() => {
		notifyGlobal = showNotification;
		return () => {
			notifyGlobal = null;
		};
	}, [showNotification]);

	useEffect(() => {
		const handleStorageChange = (changes, area) => {
			if (area !== "local") return;

			if (changes.scanningRouter) {
				if (changes.scanningRouter.newValue) {
					showNotification("loading", `Scanning ${changes.scanningRouter.newValue}...`, 0);
				} else {
					setNotification(null);
				}
			}
		};

		chrome.storage.onChanged.addListener(handleStorageChange);
		return () => chrome.storage.onChanged.removeListener(handleStorageChange);
	}, [showNotification]);

	if (!notification) return null;

	return (
		<div className={`p-2 text-xs ${NOTIFICATION_TYPES[notification.type]}`}>
			{notification.message}
		</div>
	);
}
