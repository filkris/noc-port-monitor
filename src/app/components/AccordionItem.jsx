import { useState } from "react";
import AccordionHeader from "./AccordionHeader";
import AccordionSubheader from "./AccordionSubheader";
import AccordionBody from "./AccordionBody";

export default function AccordionItem({ router, data }) {
	const [isOpen, setIsOpen] = useState(false);

	const status = data?.hasIssues ? "red" : data?.lastUpdated ? "green" : "gray";
	const affectedPorts = data?.affectedPorts || 0;
	const showBadge = data?.hasIssues && data?.lastSeenState !== "seen";

	return (
		<div className="border-b border-gray-200">
			<AccordionHeader
				name={router.name}
				isOpen={isOpen}
				onClick={() => setIsOpen(!isOpen)}
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
