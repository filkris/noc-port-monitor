import { useState, useEffect } from "react";

export function useChromeStorage(storageKey, defaultValue = null) {
	const [value, setValue] = useState(defaultValue);

	useEffect(() => {
		chrome.storage.local.get(storageKey).then((data) => {
			setValue(data[storageKey] ?? defaultValue);
		});

		const handleStorageChange = (changes, area) => {
			if (area !== "local") return;
			if (changes[storageKey]?.newValue !== undefined) {
				setValue(changes[storageKey].newValue);
			}
		};

		chrome.storage.onChanged.addListener(handleStorageChange);
		return () => chrome.storage.onChanged.removeListener(handleStorageChange);
	}, [storageKey, defaultValue]);

	return value;
}

export function useChromeStorageMulti(keys) {
	const [values, setValues] = useState(() => {
		const initial = {};
		for (const { key, defaultValue } of keys) {
			initial[key] = defaultValue;
		}
		return initial;
	});

	useEffect(() => {
		const storageKeys = keys.map((k) => k.key);

		chrome.storage.local.get(storageKeys).then((data) => {
			const result = {};
			for (const { key, defaultValue } of keys) {
				result[key] = data[key] ?? defaultValue;
			}
			setValues(result);
		});

		const handleStorageChange = (changes, area) => {
			if (area !== "local") return;

			setValues((prev) => {
				const updated = { ...prev };
				let hasChanges = false;

				for (const { key } of keys) {
					if (changes[key]?.newValue !== undefined) {
						updated[key] = changes[key].newValue;
						hasChanges = true;
					}
				}

				return hasChanges ? updated : prev;
			});
		};

		chrome.storage.onChanged.addListener(handleStorageChange);
		return () => chrome.storage.onChanged.removeListener(handleStorageChange);
	}, [keys]);

	return values;
}
