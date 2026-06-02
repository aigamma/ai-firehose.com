import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static React + Vite site. The Fly.io worker writes precomputed JSON into
// public/data, which Vite copies to the deploy root and serves at /data/*.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
