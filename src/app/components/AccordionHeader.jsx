import { ChevronDown } from "lucide-react";
import Status from "./Status";
import Badge from "./Badge";

export default function AccordionHeader({ name, isOpen, onClick, status = "gray", affectedPorts = 0, showBadge = false }) {
	return (
		<div
			className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
			onClick={onClick}
		>
			<div className="flex items-center gap-2">
				<Status color={status} />
				<span className="font-medium">{name}</span>
				{showBadge && <Badge>NEW</Badge>}
			</div>
			<div className="flex items-center gap-4">
				<span className="text-xs text-gray-500">{affectedPorts}</span>
				<ChevronDown
					className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
				/>
			</div>
		</div>
	);
}
