import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		port: 3000,
		open: true
	},
	build: {
		outDir: 'dist',
		sourcemap: true,
		rollupOptions: {
			output: {
				assetFileNames: 'assets/[name]-[hash][extname]',
				chunkFileNames: 'assets/[name]-[hash].js',
				entryFileNames: 'assets/[name]-[hash].js'
			}
		}
	},
	base: './' // Важно для GitHub Pages
});
