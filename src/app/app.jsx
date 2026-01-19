import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import "./app.css";
import Auth from "./components/Auth";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import { STORAGE_KEYS } from "@/constants/storage";

function App() {
	const [authState, setAuthState] = useState(null);
	const [sessionId, setSessionId] = useState(null);
	const [routerData, setRouterData] = useState({});

	useEffect(() => {
		chrome.storage.local.get([
			STORAGE_KEYS.AUTH_STATE,
			STORAGE_KEYS.SESSION_ID,
			STORAGE_KEYS.ROUTER_DATA,
		]).then((data) => {
			setAuthState(data[STORAGE_KEYS.AUTH_STATE]);
			setSessionId(data[STORAGE_KEYS.SESSION_ID]);
			setRouterData(data[STORAGE_KEYS.ROUTER_DATA] || {});
		});

		const handleStorageChange = (changes, area) => {
			if (area !== "local") return;

			if (changes[STORAGE_KEYS.AUTH_STATE]) {
				setAuthState(changes[STORAGE_KEYS.AUTH_STATE].newValue);
			}
			if (changes[STORAGE_KEYS.SESSION_ID]) {
				setSessionId(changes[STORAGE_KEYS.SESSION_ID].newValue);
			}
			if (changes[STORAGE_KEYS.ROUTER_DATA]) {
				setRouterData(changes[STORAGE_KEYS.ROUTER_DATA].newValue || {});
			}
		};

		chrome.storage.onChanged.addListener(handleStorageChange);
		return () => chrome.storage.onChanged.removeListener(handleStorageChange);
	}, []);

	const isLoggedOut = authState === "logged_out";
	const hasSession = !!sessionId;
	const isAuthenticated = hasSession && !isLoggedOut;

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
