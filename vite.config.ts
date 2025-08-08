import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		port: 3000,
		open: true
	},
	build: {
		outDir: 'dist',
		sourcemap: false, // Отключаем sourcemap для уменьшения размера
		rollupOptions: {
			output: {
				assetFileNames: 'assets/[name][extname]',
				chunkFileNames: 'assets/[name].js',
				entryFileNames: 'assets/[name].js'
			}
		}
	},
	base: './' // Важно для GitHub Pages
});
