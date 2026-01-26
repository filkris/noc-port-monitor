import { formatDate } from "@/utils/helpers";

const STATE_CONFIG = {
	UP: { text: "[UP]", class: "bg-green-50 border border-green-200", textClass: "text-green-600" },
	DOWN: { text: "[DOWN]", class: "bg-red-50 border border-red-200", textClass: "text-red-600" },
	FAILURE: { text: "[FAILURE]", class: "bg-orange-50 border border-orange-300", textClass: "text-orange-600" },
	RESUME: { text: "[RESUME]", class: "bg-blue-50 border border-blue-300", textClass: "text-blue-600" },
};

export default function Event({ event }) {
	const config = STATE_CONFIG[event.state] || STATE_CONFIG.DOWN;
	const timestamp = event.timestamp ? formatDate(new Date(event.timestamp)) : "Unknown time";

	const baseClass = "flex items-center gap-2 px-2 py-1 rounded text-[11px] font-mono";

	return (
		<div className={`${baseClass} ${config.class}`}>
			<span className={`w-16 font-bold ${config.textClass}`}>{config.text}</span>
			<span>{timestamp}</span>
		</div>
	);
}
