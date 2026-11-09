import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Popup, dashboard and service worker. The content script has its own IIFE
// build (vite.content.config.ts) because MV3 content scripts cannot be ES modules.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: 'popup.html',
        dashboard: 'dashboard.html',
        background: 'src/background/index.ts',
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js',
      },
    },
  },
});
