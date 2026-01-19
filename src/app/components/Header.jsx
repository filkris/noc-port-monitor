import Scheduler from "./Scheduler";
import Manual from "./Manual";

export default function Header() {
	return (
		<header>
			<Scheduler />
			<Manual />
		</header>
	);
}
