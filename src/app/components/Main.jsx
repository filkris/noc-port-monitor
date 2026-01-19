import Accordion from "./Accordion";

export default function Main({ routerData }) {
	return (
		<main className="flex-1 overflow-y-auto">
			<Accordion routerData={routerData} />
		</main>
	);
}
