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
        polityka: resolve(__dirname, 'polityka.html'),
        rodo: resolve(__dirname, 'rodo.html'),
        ofertaChlodnicze: resolve(__dirname, 'oferta-chlodnicze.html'),
        ofertaPrzekaskowe: resolve(__dirname, 'oferta-przekaskowe.html'),
        ofertaNapoje: resolve(__dirname, 'oferta-napoje.html'),
        ofertaKawa: resolve(__dirname, 'oferta-kawa.html'),
        ofertaPremium: resolve(__dirname, 'oferta-premium.html'),
        ofertaDzierzawa: resolve(__dirname, 'oferta-dzierzawa.html'),
        oNas: resolve(__dirname, 'o-nas.html'),
        realizacje: resolve(__dirname, 'realizacje.html'),
        blog: resolve(__dirname, 'blog.html'),
      },
    },
  },
});
