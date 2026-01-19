import { Lock } from "lucide-react";
import { URL_BASE } from "@/app/config";
import Button from "./Button";

export default function Auth() {
	const handleOpenPortal = () => {
		chrome.tabs.create({ url: URL_BASE });
	};

	return (
		<div className="flex flex-col items-center justify-center flex-1 p-6 text-gray-500">
			<Lock className="w-12 h-12 mb-4" />
			<p className="text-sm text-center mb-4">Open NOC Portal to detect session</p>
			<Button onClick={handleOpenPortal}>Open NOC Portal</Button>
		</div>
	);
}
