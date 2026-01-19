import { ROUTERS } from "@/constants/routers";
import AccordionItem from "./AccordionItem";

export default function Accordion() {
	return (
		<div className="accordion">
			{ROUTERS.map((router) => (
				<AccordionItem key={router.id} router={router} />
			))}
		</div>
	);
}
