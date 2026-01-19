export default function Select({ value, onChange, options, className = "" }) {
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className={className}
		>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
}
