import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `format: 'iife'` keeps the build free of ES modules so the single-file build
// (tools/bundle-single.mjs) also runs straight off the filesystem.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'assets/app.js', assetFileNames: 'assets/[name][extname]' },
    },
  },
});
