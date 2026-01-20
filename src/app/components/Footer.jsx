import { useEffect } from "react";
import { formatDate } from "@/utils/helpers";
import { setNotifyCallback } from "@/utils/notify";
import { NOTIFICATION_TYPES } from "@/constants/notifications";
import { STORAGE_KEYS } from "@/constants/storage";
import { useChromeStorage, useNotification } from "@/hooks";

export default function Footer() {
	const lastCheck = useChromeStorage(STORAGE_KEYS.LAST_CHECK, null);
	const { notification, showNotification } = useNotification();

	useEffect(() => {
		setNotifyCallback(showNotification);
		return () => setNotifyCallback(null);
	}, [showNotification]);

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
