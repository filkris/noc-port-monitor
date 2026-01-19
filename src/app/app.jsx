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

	const isLoggedOut = authState === "logged_out";
	const hasSession = !!sessionId;
	const isAuthenticated = hasSession && !isLoggedOut;

	return (
		<div className="flex flex-col h-screen">
			{isAuthenticated ? (
				<>
					<Header />
					<Main />
					<Footer />
				</>
			) : (
				<Auth />
			)}
		</div>
	);
}

createRoot(document.getElementById("app")).render(<App />);
