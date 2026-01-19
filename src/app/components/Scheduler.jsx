import { useState } from "react";
import Select from "./Select";
import { FREQUENCIES } from "@/constants/frequencies";

export default function Scheduler() {
	const [frequency, setFrequency] = useState(60);
	const [schedulerEnabled, setSchedulerEnabled] = useState(false);

	return (
		<section className="p-3 border-b border-gray-200">
			<div className="flex justify-between items-center mb-3">
				<span className="font-semibold text-primary">Schedule</span>
				<div className="flex items-center gap-3">
					<span className={`text-xs text-primary font-medium ${!schedulerEnabled && "hidden"}`}>
						00:00:00
					</span>
					<label className="relative inline-block w-[46px] h-[22px]">
						<input
							type="checkbox"
							checked={schedulerEnabled}
							onChange={(e) => setSchedulerEnabled(e.target.checked)}
							className="opacity-0 w-0 h-0"
						/>
						<span
							className={`absolute cursor-pointer inset-0 rounded-full transition-colors duration-300 ${
								schedulerEnabled ? "bg-primary" : "bg-gray-300"
							}`}
						>
							<span
								className={`absolute h-4 w-4 left-[3px] bottom-[3px] bg-white rounded-full transition-transform duration-300 ${
									schedulerEnabled && "translate-x-[22px]"
								}`}
							/>
						</span>
					</label>
				</div>
			</div>
			<Select
				value={frequency}
				onChange={setFrequency}
				options={FREQUENCIES}
			/>
		</section>
	);
}
