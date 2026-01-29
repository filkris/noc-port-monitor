import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import "./app.css";
import Auth from "./components/Auth";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import { STORAGE_KEYS } from "@/constants/storage";
import { useChromeStorageMulti } from "@/hooks";
import { DEBUG_MODE } from "@/app/config";

const STORAGE_CONFIG = [
	{ key: STORAGE_KEYS.AUTH_STATE, defaultValue: null },
	{ key: STORAGE_KEYS.SESSION_ID, defaultValue: null },
	{ key: STORAGE_KEYS.ROUTER_DATA, defaultValue: {} },
];

function App() {
	const storageValues = useChromeStorageMulti(STORAGE_CONFIG);
	const [fallbackChecked, setFallbackChecked] = useState(false);

	const authState = storageValues[STORAGE_KEYS.AUTH_STATE];
	const sessionId = storageValues[STORAGE_KEYS.SESSION_ID];
	const routerData = storageValues[STORAGE_KEYS.ROUTER_DATA] || {};

	useEffect(() => {
		if (fallbackChecked) return;

		async function checkCookieFallback() {
			if (!sessionId) {
				try {
					const cookies = await chrome.cookies.getAll({ domain: "nocportal.telekom.rs" });
					const sessionCookie = cookies.find((c) => c.name === "session_id");
					if (sessionCookie?.value) {
						await chrome.storage.local.set({
							[STORAGE_KEYS.SESSION_ID]: sessionCookie.value,
							[STORAGE_KEYS.AUTH_STATE]: "logged_in",
						});
					}
				} catch {
					// Cookies API may fail
				}
			}
			setFallbackChecked(true);
		}

		checkCookieFallback();
	}, [sessionId, fallbackChecked]);

	const isLoggedOut = authState === "logged_out";
	const hasSession = !!sessionId;
	const isAuthenticated = DEBUG_MODE || (hasSession && !isLoggedOut);

	if (!isAuthenticated) {
		return (
			<div className="flex flex-col h-screen">
				<Auth />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen">
			<Header />
			<Main routerData={routerData} />
			<Footer />
		</div>
	);
}

createRoot(document.getElementById("app")).render(<App />);
