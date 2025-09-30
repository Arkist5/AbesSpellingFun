import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/AbesSpellingFun/',
  plugins: [react()],
  server: {
    host: true
  }
});
