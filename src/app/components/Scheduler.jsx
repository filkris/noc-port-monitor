import { useState, useEffect, useRef } from "react";
import Select from "./Select";
import { FREQUENCIES } from "@/constants/frequencies";
import { STORAGE_KEYS } from "@/constants/storage";
import { formatTime } from "@/utils/helpers";
import { notify } from "@/utils/notify";

export default function Scheduler() {
	const intervalRef = useRef(null);
	const [countdown, setCountdown] = useState(0);
	const [frequency, setFrequency] = useState(60);
	const [schedulerEnabled, setSchedulerEnabled] = useState(false);
	const [startTime, setStartTime] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		chrome.storage.local.get([
			STORAGE_KEYS.SCHEDULER_ENABLED,
			STORAGE_KEYS.SCHEDULER_FREQUENCY,
			"schedulerStartTime",
		]).then((data) => {
			setSchedulerEnabled(data[STORAGE_KEYS.SCHEDULER_ENABLED] ?? false);
			setFrequency(data[STORAGE_KEYS.SCHEDULER_FREQUENCY] ?? 60);
			setStartTime(data.schedulerStartTime ?? null);
		});

		const handleStorageChange = (changes, area) => {
			if (area !== "local") return;

			if (changes[STORAGE_KEYS.SCHEDULER_ENABLED]?.newValue !== undefined) {
				setSchedulerEnabled(changes[STORAGE_KEYS.SCHEDULER_ENABLED].newValue);
			}
			if (changes[STORAGE_KEYS.SCHEDULER_FREQUENCY]?.newValue !== undefined) {
				setFrequency(changes[STORAGE_KEYS.SCHEDULER_FREQUENCY].newValue);
			}
			if (changes.schedulerStartTime?.newValue !== undefined) {
				setStartTime(changes.schedulerStartTime.newValue);
			}
		};

		chrome.storage.onChanged.addListener(handleStorageChange);
		return () => chrome.storage.onChanged.removeListener(handleStorageChange);
	}, []);

	useEffect(() => {
		if (schedulerEnabled && startTime) {
			const calculateCountdown = () => {
				const elapsed = Math.floor((Date.now() - startTime) / 1000);
				const total = frequency * 60;
				const remaining = total - (elapsed % total);
				return remaining;
			};

			setCountdown(calculateCountdown());
			intervalRef.current = setInterval(() => {
				setCountdown(calculateCountdown());
			}, 1000);
		} else {
			setCountdown(0);
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [schedulerEnabled, frequency, startTime]);

	const handleToggle = async (enabled) => {
		setIsLoading(true);
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
		} finally {
			setIsLoading(false);
		}
	};

	const handleFrequencyChange = async (newFrequency) => {
		if (!schedulerEnabled) {
			setFrequency(newFrequency);
			return;
		}

		setIsLoading(true);
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
		} finally {
			setIsLoading(false);
		}
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
