import { useState, useCallback } from "react";

export function useAsyncAction() {
	const [isLoading, setIsLoading] = useState(false);

	const execute = useCallback(async (asyncFn) => {
		setIsLoading(true);
		try {
			return await asyncFn();
		} finally {
			setIsLoading(false);
		}
	}, []);

	return { isLoading, execute };
}
