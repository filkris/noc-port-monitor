import Port from "./Port";

export default function AccordionBody({ ports = {} }) {
	const portEntries = Object.entries(ports);

	if (portEntries.length === 0) {
		return (
			<div className="px-3 pb-3 text-xs text-gray-400">
				No data yet
			</div>
		);
	}

	return (
		<div className="px-3 pb-3">
			{portEntries.map(([portId, events]) => (
				<Port key={portId} portId={portId} events={events} />
			))}
		</div>
	);
}
