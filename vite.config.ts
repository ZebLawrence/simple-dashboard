import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2021',
    outDir: 'dist',
  },
  server: {
    port: 3000,
    host: true,
  },
});
