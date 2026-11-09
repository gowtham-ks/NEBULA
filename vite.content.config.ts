import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: 'src/content/index.ts',
      formats: ['iife'],
      name: 'NebulaContent',
      fileName: () => 'content.js',
    },
  },
});
