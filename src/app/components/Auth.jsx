import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { STORAGE_KEYS } from "@/constants/storage";
import { API_BASE } from "@/constants/api";
import Button from "./Button";

export default function Auth() {
	const [authState, setAuthState] = useState(null);
	const [sessionId, setSessionId] = useState(null);

	useEffect(() => {
		chrome.storage.local.get([STORAGE_KEYS.AUTH_STATE, STORAGE_KEYS.SESSION_ID]).then((data) => {
			setAuthState(data[STORAGE_KEYS.AUTH_STATE]);
			setSessionId(data[STORAGE_KEYS.SESSION_ID]);
		});

		const handleStorageChange = (changes, area) => {
			if (area !== "local") return;

			if (changes[STORAGE_KEYS.AUTH_STATE]) {
				setAuthState(changes[STORAGE_KEYS.AUTH_STATE].newValue);
			}
			if (changes[STORAGE_KEYS.SESSION_ID]) {
				setSessionId(changes[STORAGE_KEYS.SESSION_ID].newValue);
			}
		};

		chrome.storage.onChanged.addListener(handleStorageChange);
		return () => chrome.storage.onChanged.removeListener(handleStorageChange);
	}, []);

	const handleOpenPortal = () => {
		chrome.tabs.create({ url: API_BASE });
	};

	const isLoggedOut = authState === "logged_out";
	const hasSession = !!sessionId;

	if (hasSession && !isLoggedOut) return null;

	const message = isLoggedOut ? "Please login to NOC Portal" : "Open NOC Portal to detect session";

	return (
		<div className="flex flex-col items-center justify-center flex-1 p-6 text-gray-500">
			<Lock className="w-12 h-12 mb-4" />
			<p className="text-sm text-center mb-4">{message}</p>
			<Button onClick={handleOpenPortal}>Open NOC Portal</Button>
		</div>
	);
}
