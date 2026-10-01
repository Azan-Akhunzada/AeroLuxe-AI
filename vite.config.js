import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The React app runs on :5173 and proxies every /api call to the Express agent
// server on :8787. In production (`npm run build` + `npm run prod`) Express
// serves the compiled `dist/` folder itself, so no proxy is involved.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Left off deliberately: auto-open spawns `xdg-open`, which floods the log
    // with errors in headless/container environments. Vite prints the URL below.
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        // Server-Sent Events must not be buffered by the proxy.
        ws: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
