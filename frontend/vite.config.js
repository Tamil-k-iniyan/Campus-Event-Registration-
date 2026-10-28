import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/Campus-Event-Registration-/' : '/'),
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  }
});
