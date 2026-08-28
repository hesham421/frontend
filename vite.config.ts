import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200,
    strictPort: true,
    open: true
  },
  preview: {
    port: 4200,
    strictPort: true
  }
});
