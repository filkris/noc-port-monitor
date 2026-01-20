import { useEffect } from "react";
import { formatDate } from "@/utils/helpers";
import { setNotifyCallback } from "@/utils/notify";
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

	return (
		<footer className="bg-gray-100 border-t border-gray-200">
			<div className="p-2 text-xs text-gray-600">
				<span>{displayText}</span>
			</div>
		</footer>
	);
}
