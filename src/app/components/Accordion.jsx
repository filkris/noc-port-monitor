import { ROUTERS } from "@/constants/routers";
import AccordionItem from "./AccordionItem";

export default function Accordion({ routerData = {} }) {
	return (
		<div className="accordion">
			{ROUTERS.map((router) => (
				<AccordionItem key={router.id} router={router} data={routerData[router.id]} />
			))}
		</div>
	);
}
