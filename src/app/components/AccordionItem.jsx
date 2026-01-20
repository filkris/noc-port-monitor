import AccordionHeader from "./AccordionHeader";
import AccordionSubheader from "./AccordionSubheader";
import AccordionBody from "./AccordionBody";
import { useToggle } from "@/hooks";

export default function AccordionItem({ router, data }) {
	const [isOpen, toggle] = useToggle(false);

	const status = data?.hasIssues ? "red" : data?.lastUpdated ? "green" : "gray";
	const affectedPorts = data?.affectedPorts || 0;
	const showBadge = data?.hasIssues && data?.lastSeenState !== "seen";

	return (
		<div className="border-b border-gray-200">
			<AccordionHeader
				name={router.name}
				isOpen={isOpen}
				onClick={toggle}
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
