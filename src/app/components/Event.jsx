import { formatDate } from "@/utils/helpers";

export default function Event({ event }) {
	const isUp = event.state === "UP";
	const stateClass = isUp ? "text-green-600" : "text-red-600";
	const stateText = isUp ? "[UP]" : "[DOWN]";
	const timestamp = event.timestamp ? formatDate(new Date(event.timestamp)) : "Unknown time";

	return (
		<div className={`text-xs ${stateClass}`}>
			<span className="font-medium">{stateText}</span> {timestamp}
		</div>
	);
}
