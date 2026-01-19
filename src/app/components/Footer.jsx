import { useState, useEffect } from "react";
import { formatDate } from "@/utils/helpers";
import Notification from "./Notification";

export default function Footer() {
	const [lastScan, setLastScan] = useState(null);

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

	return (
		<footer className="bg-gray-100 border-t border-gray-200">
			<Notification />
			<div className="p-2 text-xs text-gray-600">
				<span>{defaultText}</span>
			</div>
		</footer>
	);
}
