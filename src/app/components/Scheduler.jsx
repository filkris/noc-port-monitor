import { useState } from "react";
import Select from "./Select";
import { FREQUENCIES } from "@/constants/frequencies";
import { STORAGE_KEYS } from "@/constants/storage";
import { formatTime } from "@/utils/helpers";
import { notify } from "@/utils/notify";
import { useChromeStorageMulti, useCountdown, useAsyncAction } from "@/hooks";

const STORAGE_CONFIG = [
	{ key: STORAGE_KEYS.SCHEDULER_ENABLED, defaultValue: false },
	{ key: STORAGE_KEYS.SCHEDULER_FREQUENCY, defaultValue: 60 },
	{ key: "schedulerStartTime", defaultValue: null },
];

export default function Scheduler() {
	const storageValues = useChromeStorageMulti(STORAGE_CONFIG);
	const { isLoading, execute } = useAsyncAction();
	const [localFrequency, setLocalFrequency] = useState(null);

	const schedulerEnabled = storageValues[STORAGE_KEYS.SCHEDULER_ENABLED];
	const frequency = localFrequency ?? storageValues[STORAGE_KEYS.SCHEDULER_FREQUENCY];
	const startTime = storageValues["schedulerStartTime"];

	const countdown = useCountdown(startTime, frequency, schedulerEnabled);

	const handleToggle = async (enabled) => {
		await execute(async () => {
			notify("loading", "Updating scheduler...", 0);

			try {
				const result = await chrome.runtime.sendMessage({
					action: "setScheduler",
					enabled,
					frequency,
				});

				if (result.success) {
					notify("success", enabled ? "Scheduler enabled" : "Scheduler disabled");
				} else {
					notify("error", "Failed to update scheduler");
				}
			} catch {
				notify("error", "Failed to update scheduler");
			}
		});
	};

	const handleFrequencyChange = async (newFrequency) => {
		if (!schedulerEnabled) {
			setLocalFrequency(newFrequency);
			return;
		}

		await execute(async () => {
			notify("loading", "Updating frequency...", 0);

			try {
				const result = await chrome.runtime.sendMessage({
					action: "setScheduler",
					enabled: true,
					frequency: newFrequency,
				});

				if (result.success) {
					notify("success", "Frequency updated");
				} else {
					notify("error", "Failed to update frequency");
				}
			} catch {
				notify("error", "Failed to update frequency");
			}
		});
	};

	return (
		<section className="p-3 border-b border-gray-200">
			<div className="flex justify-between items-center mb-3">
				<span className="text-sm font-semibold text-primary">Schedule</span>
				<div className="flex items-center gap-3">
					<span className={`text-xs text-primary font-medium ${!schedulerEnabled && "hidden"}`}>{formatTime(countdown)}</span>
					<label className="relative inline-block w-[46px] h-[22px]">
						<input
							type="checkbox"
							checked={schedulerEnabled}
							onChange={e => handleToggle(e.target.checked)}
							disabled={isLoading}
							className="opacity-0 w-0 h-0"
						/>
						<span
							className={`absolute cursor-pointer inset-0 rounded-full transition-colors duration-300 ${
								schedulerEnabled ? "bg-primary" : "bg-gray-300"
							}`}>
							<span
								className={`absolute h-4 w-4 left-[3px] bottom-[3px] bg-white rounded-full transition-transform duration-300 ${
									schedulerEnabled && "translate-x-[22px]"
								}`}
							/>
						</span>
					</label>
				</div>
			</div>
			<Select value={frequency} onChange={handleFrequencyChange} options={FREQUENCIES} disabled={isLoading} />
		</section>
	);
}
