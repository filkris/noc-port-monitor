import Tag from "./Tag";

export default function AccordionSubheader({ router }) {
	return (
		<div className="flex gap-2 px-3 pb-2">
			<Tag variant="vendor">{router.vendor}</Tag>
			<Tag variant="type">{router.type}</Tag>
			<Tag variant="model">{router.model}</Tag>
			<Tag variant="ip">{router.ip_address}</Tag>
		</div>
	);
}
