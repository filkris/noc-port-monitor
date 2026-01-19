import { useState } from "react";
import Select from "./Select";
import Button from "./Button";
import { ROUTERS } from "@/constants/routers";

const ROUTER_OPTIONS = [
	{ value: "all", label: "All Routers" },
	...ROUTERS.map((router) => ({ value: router.id, label: router.name })),
];

export default function Manual() {
	const [selectedRouter, setSelectedRouter] = useState("all");

	return (
		<section className="p-3">
			<div className="mb-3">
				<span className="font-semibold text-primary">Manual</span>
			</div>
			<div className="flex gap-2">
				<Select
					value={selectedRouter}
					onChange={setSelectedRouter}
					options={ROUTER_OPTIONS}
					className="flex-1"
				/>
				<Button>Scan</Button>
			</div>
		</section>
	);
}
