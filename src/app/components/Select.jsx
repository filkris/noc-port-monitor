export default function Select({ value, onChange, options, className = "", disabled = false }) {
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className={className}
			disabled={disabled}
		>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
}
