import Scheduler from "./Scheduler";
import Manual from "./Manual";

export default function Header() {
	return (
		<header className="border-t-2 border-primary bg-white">
			<Scheduler />
			<Manual />
		</header>
	);
}
