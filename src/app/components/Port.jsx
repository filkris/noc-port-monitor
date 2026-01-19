import Event from "./Event";

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
