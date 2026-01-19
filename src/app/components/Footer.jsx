import { useState, useEffect } from "react";
import { formatDate } from "@/utils/helpers";
import { setNotifyCallback } from "@/utils/notify";
import { NOTIFICATION_TYPES } from "@/constants/notifications";

export default function Footer() {
	const [lastScan, setLastScan] = useState(null);
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

			if (changes.lastScan?.newValue) {
				setLastScan(changes.lastScan.newValue);
			}
		};

		chrome.storage.onChanged.addListener(handleStorageChange);

		chrome.storage.local.get("lastScan").then(({ lastScan }) => {
			if (lastScan) setLastScan(lastScan);
		});

		return () => chrome.storage.onChanged.removeListener(handleStorageChange);
	}, []);

	const defaultText = lastScan ? `Last scan: ${formatDate(new Date(lastScan))}` : "";
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
