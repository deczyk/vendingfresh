import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { htmlInclude } from './vite-plugins/html-include';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [htmlInclude(resolve(__dirname, 'partials'))],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        konfigurator: resolve(__dirname, 'konfigurator.html'),
        polityka: resolve(__dirname, 'polityka.html'),
        kontakt: resolve(__dirname, 'kontakt.html'),
        faq: resolve(__dirname, 'faq.html'),
      },
    },
  },
});
