import { useState, useEffect } from "react";
import { formatDate } from "@/utils/helpers";
import { setNotifyCallback } from "@/utils/notify";
import { NOTIFICATION_TYPES } from "@/constants/notifications";
import { STORAGE_KEYS } from "@/constants/storage";

export default function Footer() {
	const [lastCheck, setLastCheck] = useState(null);
	const [notification, setNotification] = useState(null);

	useEffect(() => {
		setNotifyCallback((type, message, duration = 3000) => {
			setNotification({ type, message });
			if (duration > 0) {
				setTimeout(() => setNotification(null), duration);
			}
		});

		return () => setNotifyCallback(null);
	}, []);

	useEffect(() => {
		const handleStorageChange = (changes, area) => {
			if (area !== "local") return;

			if (changes[STORAGE_KEYS.LAST_CHECK]?.newValue) {
				setLastCheck(changes[STORAGE_KEYS.LAST_CHECK].newValue);
			}
		};

		chrome.storage.onChanged.addListener(handleStorageChange);

		chrome.storage.local.get(STORAGE_KEYS.LAST_CHECK).then((data) => {
			if (data[STORAGE_KEYS.LAST_CHECK]) setLastCheck(data[STORAGE_KEYS.LAST_CHECK]);
		});

		return () => chrome.storage.onChanged.removeListener(handleStorageChange);
	}, []);

	const defaultText = lastCheck ? `Last check: ${formatDate(new Date(lastCheck))}` : "";
	const displayText = notification?.message || defaultText;
	const className = notification
		? `p-2 text-xs ${NOTIFICATION_TYPES[notification.type]}`
		: "p-2 text-xs text-gray-600";

	return (
		<footer className="bg-gray-100 border-t border-gray-200">
			<div className={className}>
				<span>{displayText}</span>
			</div>
		</footer>
	);
}
