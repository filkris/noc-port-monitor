import { formatDate } from "@/utils/helpers";

export default function Event({ event }) {
	const isUp = event.state === "UP";
	const stateText = isUp ? "[UP]" : "[DOWN]";
	const timestamp = event.timestamp ? formatDate(new Date(event.timestamp)) : "Unknown time";

	const baseClass = "flex items-center gap-2 px-2 py-1 rounded text-[11px] font-mono";
	const stateClass = isUp
		? "bg-green-50 border border-green-200"
		: "bg-red-50 border border-red-200";

	return (
		<div className={`${baseClass} ${stateClass}`}>
			<span className="w-48">{stateText}</span>
			<span>{timestamp}</span>
		</div>
	);
}
