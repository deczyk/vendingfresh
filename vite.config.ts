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
        blog: resolve(__dirname, 'blog.html'),
        kontakt: resolve(__dirname, 'kontakt.html'),
        blogZakupCzyDzierzawa: resolve(__dirname, 'blog/zakup-czy-dzierzawa-automatu-vendingowego.html'),
        blogIleKosztuje: resolve(__dirname, 'blog/ile-kosztuje-automat-vendingowy.html'),
        blogJakZarabiac: resolve(__dirname, 'blog/jak-zarabiac-na-automacie-vendingowym.html'),
        blogLokalizacja: resolve(__dirname, 'blog/jak-wybrac-lokalizacje-pod-vending.html'),
        blogAutomatNaJajka: resolve(__dirname, 'blog/automat-na-jajka-oplacalnosc.html'),
        blogAutomatChlodniczy: resolve(__dirname, 'blog/automat-chlodniczy-do-sprzedazy-zywnosci.html'),
      },
    },
  },
});
