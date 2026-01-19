import { useState, useEffect } from "react";
import { formatDate } from "@/utils/helpers";

export default function Footer() {
	const [status, setStatus] = useState({ type: null, message: "" });
	const [lastScan, setLastScan] = useState(null);

	useEffect(() => {
		const handleStorageChange = (changes, area) => {
			if (area !== "local") return;

			if (changes.scanningRouter) {
				if (changes.scanningRouter.newValue) {
					setStatus({ type: "loading", message: `Scanning ${changes.scanningRouter.newValue}...` });
				} else {
					setStatus({ type: null, message: "" });
				}
			}

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

	const displayText = status.message || (lastScan ? `Last scan: ${formatDate(new Date(lastScan))}` : "");

	return (
		<footer className="fixed bottom-0 left-0 right-0 p-2 bg-gray-100 border-t border-gray-200 text-xs text-gray-600">
			<span>{displayText}</span>
		</footer>
	);
}
