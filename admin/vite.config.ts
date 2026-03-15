import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: '/admin/',
  build: {
    outDir: '../server/static/admin',
    emptyOutDir: true,
  },
});
