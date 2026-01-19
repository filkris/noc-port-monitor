import { ChevronDown } from "lucide-react";

export default function AccordionHeader({ name, isOpen, onClick }) {
	return (
		<div
			className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
			onClick={onClick}
		>
			<span className="font-medium">{name}</span>
			<ChevronDown
				className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
			/>
		</div>
	);
}
