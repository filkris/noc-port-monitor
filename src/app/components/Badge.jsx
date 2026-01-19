export default function Badge({ children }) {
	return (
		<span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-white rounded">
			{children}
		</span>
	);
}
