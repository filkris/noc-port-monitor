import { useState, useEffect } from "react";
import Select from "./Select";
import Button from "./Button";
import { notify } from "@/utils/notify";
import { ROUTERS } from "@/constants/routers";
import { useAsyncAction } from "@/hooks";

export default function Manual() {
	const [selectedRouter, setSelectedRouter] = useState("all");
	const { isLoading, execute } = useAsyncAction();
	const ROUTER_OPTIONS = [
		{ value: "all", label: "All Routers" },
		...ROUTERS.map((router) => ({ value: router.id, label: router.name })),
	];

	useEffect(() => {
		if (!isLoading) return;

		const handleStorageChange = (changes, area) => {
			if (area !== "local") return;
			if (changes.scanningRouter?.newValue) {
				notify("loading", `Checking ${changes.scanningRouter.newValue}...`, 0);
			}
		};

		chrome.storage.onChanged.addListener(handleStorageChange);
		return () => chrome.storage.onChanged.removeListener(handleStorageChange);
	}, [isLoading]);

	const handleCheck = async () => {
		await execute(async () => {
			if (selectedRouter === "all") {
				notify("loading", "Starting check...", 0);
				const result = await chrome.runtime.sendMessage({ action: "fetchAll" });

				if (result.success) {
					notify("success", "Check completed");
				} else {
					notify("error", result.error || "Check failed");
				}
			} else {
				const router = ROUTERS.find((r) => r.id === selectedRouter);
				notify("loading", `Checking ${router?.name || selectedRouter}...`, 0);

				const result = await chrome.runtime.sendMessage({
					action: "fetchRouter",
					routerId: selectedRouter,
				});

				if (result.success) {
					notify("success", "Check completed");
				} else {
					notify("error", result.error || "Check failed");
				}
			}
		});
	};

	return (
		<section className="p-3 border-b border-gray-200">
			<div className="mb-3">
				<span className="text-sm font-semibold text-primary">Manual</span>
			</div>
			<div className="flex gap-2">
				<Select
					value={selectedRouter}
					onChange={setSelectedRouter}
					options={ROUTER_OPTIONS}
					className="flex-1"
				/>
				<Button onClick={handleCheck} disabled={isLoading}>
					Check
				</Button>
			</div>
		</section>
	);
}
