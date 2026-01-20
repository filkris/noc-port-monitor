import { useState, useEffect, useRef } from "react";

export function useCountdown(startTime, frequencyMinutes, enabled) {
	const intervalRef = useRef(null);
	const [countdown, setCountdown] = useState(0);

	useEffect(() => {
		if (enabled && startTime) {
			const calculateCountdown = () => {
				const elapsed = Math.floor((Date.now() - startTime) / 1000);
				const total = frequencyMinutes * 60;
				const remaining = total - (elapsed % total);
				return remaining;
			};

			setCountdown(calculateCountdown());
			intervalRef.current = setInterval(() => {
				setCountdown(calculateCountdown());
			}, 1000);
		} else {
			setCountdown(0);
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [enabled, frequencyMinutes, startTime]);

	return countdown;
}
