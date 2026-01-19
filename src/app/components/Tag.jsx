import { TAG_COLORS } from "@/constants/tags";

export default function Tag({ children, variant = "ip" }) {
	return (
		<span className={`px-2 py-0.5 text-[10px] rounded ${TAG_COLORS[variant]}`}>
			{children}
		</span>
	);
}
