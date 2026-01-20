import AccordionHeader from "./AccordionHeader";
import AccordionSubheader from "./AccordionSubheader";
import AccordionBody from "./AccordionBody";
import { useToggle, usePortStatus } from "@/hooks";

export default function AccordionItem({ router, data }) {
	const [isOpen, toggle] = useToggle(false);

	const status = usePortStatus(data?.ports);
	const affectedPorts = data?.affectedPorts || 0;
	const showBadge = data?.lastSeenState !== "seen" && affectedPorts > 0;

	const handleClick = () => {
		toggle();
		if (showBadge) {
			chrome.runtime.sendMessage({
				action: "updateRouterSeen",
				routerId: router.id,
				lastSeenState: "seen",
			});
		}
	};

	return (
		<div className="border-b border-gray-200">
			<AccordionHeader
				name={router.name}
				isOpen={isOpen}
				onClick={handleClick}
				status={status}
				affectedPorts={affectedPorts}
				showBadge={showBadge}
			/>
			{isOpen && (
				<>
					<AccordionSubheader router={router} />
					<AccordionBody ports={data?.ports} />
				</>
			)}
		</div>
	);
}
