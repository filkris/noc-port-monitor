import { formatDate } from "@/utils/helpers";

function Event({ event }) {
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

export default function Port({ portId, events }) {
	return (
		<div className="mb-3">
			<div className="text-xs font-semibold text-gray-700 mb-1">Port #{portId}</div>
			<div className="pl-2 border-l-2 border-gray-200">
				{events.map((event, index) => (
					<Event key={index} event={event} />
				))}
			</div>
		</div>
	);
}
