import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('axios')) return 'axios-vendor';
          if (id.includes('socket.io-client')) return 'socket-vendor';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['stark-h310.onrender.com'],
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['stark-h310.onrender.com'],
  },
});
