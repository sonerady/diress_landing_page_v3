import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // SPA fallback: all routes serve index.html
    historyApiFallback: true,
  },
  appType: 'spa',
});
