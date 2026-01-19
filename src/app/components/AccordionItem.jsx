import { useState } from "react";
import AccordionHeader from "./AccordionHeader";
import AccordionSubheader from "./AccordionSubheader";
import AccordionBody from "./AccordionBody";

export default function AccordionItem({ router }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="border-b border-gray-200">
			<AccordionHeader
				name={router.name}
				isOpen={isOpen}
				onClick={() => setIsOpen(!isOpen)}
			/>
			{isOpen && (
				<>
					<AccordionSubheader router={router} />
					<AccordionBody />
				</>
			)}
		</div>
	);
}
