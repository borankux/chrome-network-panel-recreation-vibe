import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'table': ['@tanstack/react-table', '@tanstack/react-virtual'],
          'ui': ['@radix-ui/react-dropdown-menu', '@radix-ui/react-context-menu', '@radix-ui/react-tooltip'],
        },
      },
    },
  },
});
