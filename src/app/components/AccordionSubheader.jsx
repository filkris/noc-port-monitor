import Tag from "./Tag";

export default function AccordionSubheader({ router }) {
	return (
		<div className="flex gap-2 px-3 pb-2">
			<Tag>{router.vendor}</Tag>
			<Tag>{router.type}</Tag>
			<Tag>{router.model}</Tag>
			<Tag>{router.ip_address}</Tag>
		</div>
	);
}
