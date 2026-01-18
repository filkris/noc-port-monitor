import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
	plugins: [react()],
	root: resolve(__dirname, "src"),
	publicDir: resolve(__dirname, "public"),
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
	build: {
		outDir: resolve(__dirname, "dist"),
		emptyOutDir: true,
		rollupOptions: {
			input: {
				app: resolve(__dirname, "src/app/index.html"),
				background: resolve(__dirname, "src/background.js"),
				content: resolve(__dirname, "src/content.js"),
			},
			output: {
				entryFileNames: chunk => {
					if (chunk.name === "background") return "background.js";
					if (chunk.name === "content") return "content.js";
					return "assets/[name]-[hash].js";
				},
			},
		},
	},
});
