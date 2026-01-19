import { STATUS_COLORS } from "@/constants/status";

export default function Status({ color = "gray" }) {
	return <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[color]}`} />;
}
