import { API_BASE, API_ENDPOINTS } from "../constants/api";
import { UID, LOCALE, COMPANY_IDS } from "../config";

const generateRequestId = () => Math.floor(Math.random() * 1000000000);

const buildContext = (router) => ({
	bin_size: true,
	lang: LOCALE.LANG,
	tz: LOCALE.TZ,
	uid: UID,
	allowed_company_ids: [...COMPANY_IDS],
	full_width: true,
	default_mts_router_switch_id: parseInt(router.id, 10),
	default_mts_router_switch_name: router.name,
});

async function apiCall(endpoint, payload, sessionId) {
	const response = await fetch(`${API_BASE}${endpoint}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Cookie: `session_id=${sessionId}`,
		},
		body: JSON.stringify(payload),
		credentials: "include",
	});

	const data = await response.json();

	if (data.error) {
		throw new Error(data.error.message || "API Error");
	}

	return data;
}

export function useApi(sessionId) {
	const fetchRouterLogs = async (router) => {
		const context = buildContext(router);

		// Step 1: Create wizard
		const createPayload = {
			jsonrpc: "2.0",
			method: "call",
			params: {
				args: [{ mts_router_switch_id: parseInt(router.id, 10), interface: "GigabitEthernet" }],
				model: "mts.router.switch.command.wizard",
				method: "create",
				kwargs: { context },
			},
			id: generateRequestId(),
		};

		const createResult = await apiCall(API_ENDPOINTS.CREATE_WIZARD, createPayload, sessionId);
		const wizardId = createResult.result;

		if (!wizardId) {
			throw new Error("Failed to create wizard");
		}

		// Step 2: Execute action_log
		const actionLogPayload = {
			jsonrpc: "2.0",
			method: "call",
			params: {
				args: [[wizardId]],
				model: "mts.router.switch.command.wizard",
				method: "action_log",
				kwargs: {
					context: {
						lang: LOCALE.LANG,
						tz: LOCALE.TZ,
						uid: UID,
						allowed_company_ids: [...COMPANY_IDS],
						full_width: true,
						active_model: "mts.router.switch.command.wizard",
						active_id: wizardId,
						active_ids: [wizardId],
					},
				},
			},
			id: generateRequestId(),
		};

		await apiCall(API_ENDPOINTS.CALL_BUTTON, actionLogPayload, sessionId);

		// Step 3: Read output
		const readPayload = {
			jsonrpc: "2.0",
			method: "call",
			params: {
				args: [[wizardId], ["mts_router_switch_id", "interface", "output"]],
				model: "mts.router.switch.command.wizard",
				method: "read",
				kwargs: { context },
			},
			id: generateRequestId(),
		};

		return apiCall(API_ENDPOINTS.READ_WIZARD, readPayload, sessionId);
	};

	return { fetchRouterLogs };
}
