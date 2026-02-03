import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      'spatial-navigation': path.resolve(__dirname, '../src/spatial-navigation.ts')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
});
