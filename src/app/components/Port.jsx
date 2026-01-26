import Event from "./Event";
import { UI_CONFIG } from "@/app/config";

export default function Port({ portId, events }) {
	const needsScroll = events.length > UI_CONFIG.MAX_VISIBLE_EVENTS;

	return (
		<div>
			<div className="font-semibold text-xs text-primary mb-1.5 pb-1 border-b border-gray-200">
				Port #{portId}
			</div>
			<div className={`flex flex-col gap-1 overflow-y-auto [scrollbar-gutter:stable] ${needsScroll ? "max-h-91" : ""}`}>
				{events.map((event, index) => (
					<Event key={index} event={event} />
				))}
			</div>
		</div>
	);
}
