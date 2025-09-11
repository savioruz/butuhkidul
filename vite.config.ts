import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		// Optimize bundle splitting
		rollupOptions: {
			output: {
				manualChunks: {
					// Split UI components
					ui: ['lucide-svelte']
				}
			}
		},
		// Enable minification
		minify: 'esbuild',
		// Optimize chunk size
		chunkSizeWarningLimit: 1000
	},
	// Optimize dependency pre-bundling
	optimizeDeps: {
		include: ['lucide-svelte']
	}
});
