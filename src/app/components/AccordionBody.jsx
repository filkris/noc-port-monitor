import Port from "./Port";

export default function AccordionBody({ ports = {} }) {
	const portEntries = Object.entries(ports);

	if (portEntries.length === 0) {
		return <div className="p-3 text-xs text-center text-gray-400">Nothing to show here...</div>;
	}

	return (
		<div className="p-3">
			{portEntries.map(([portId, events]) => (
				<Port key={portId} portId={portId} events={events} />
			))}
		</div>
	);
}
