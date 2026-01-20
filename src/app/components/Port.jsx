import Event from "./Event";

export default function Port({ portId, events }) {
	return (
		<div>
			<div className="font-semibold text-xs text-primary mb-1.5 pb-1 border-b border-gray-200">
				Port #{portId}
			</div>
			<div className="flex flex-col gap-1">
				{events.map((event, index) => (
					<Event key={index} event={event} />
				))}
			</div>
		</div>
	);
}
