export default function Button({ children, onClick, disabled = false, className = "" }) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`px-4 py-2 bg-primary text-white rounded-md text-sm font-medium cursor-pointer hover:bg-primary-hover transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${className}`}
		>
			{children}
		</button>
	);
}
