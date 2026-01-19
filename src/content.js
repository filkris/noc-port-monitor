(function () {
	"use strict";

	function init() {
		detectSession();
		detectAuthState();
		observeAuthChanges();
	}

	function detectAuthState() {
		const isLoggedIn = checkLoginState();
		chrome.runtime.sendMessage({
			action: "authStateChanged",
			isLoggedIn,
		});
	}

	function checkLoginState() {
		const hasLogoutButton = !!document.querySelector('[data-menu="logout"], .o_user_menu, .oe_topbar_name');
		const hasLoginForm = !!document.querySelector('.oe_login_form, [action*="login"]');
		const hasSessionCookie = document.cookie.includes("session_id=");

		return hasLogoutButton || (hasSessionCookie && !hasLoginForm);
	}

	function detectSession() {
		const sessionId = getSessionFromCookie();

		if (sessionId) {
			chrome.runtime.sendMessage({
				action: "sessionDetected",
				sessionId,
			});
		}
	}

	function getSessionFromCookie() {
		const cookies = document.cookie.split(";");

		for (const cookie of cookies) {
			const [name, value] = cookie.trim().split("=");
			if (name === "session_id" && value) {
				return value;
			}
		}

		return null;
	}

	function observeAuthChanges() {
		const observer = new MutationObserver(mutations => {
			let shouldCheck = false;

			for (const mutation of mutations) {
				if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
					for (const node of mutation.addedNodes) {
						if (node.nodeType === Node.ELEMENT_NODE) {
							if (
								node.matches?.('.oe_login_form, .o_user_menu, [data-menu="logout"]') ||
								node.querySelector?.('.oe_login_form, .o_user_menu, [data-menu="logout"]')
							) {
								shouldCheck = true;
								break;
							}
						}
					}
				}
			}

			if (shouldCheck) {
				detectSession();
				detectAuthState();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		let lastUrl = location.href;
		const urlObserver = new MutationObserver(() => {
			if (location.href !== lastUrl) {
				lastUrl = location.href;
				detectSession();
				detectAuthState();
			}
		});

		urlObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}

	setInterval(() => {
		detectSession();
	}, 10000);
})();
