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
        rozwiazaniaPieczywo: resolve(__dirname, 'rozwiazania/pieczywo.html'),
        rozwiazaniaJajka: resolve(__dirname, 'rozwiazania/jajka.html'),
        rozwiazaniaSery: resolve(__dirname, 'rozwiazania/sery.html'),
        rozwiazaniaZiemniakiWarzywa: resolve(__dirname, 'rozwiazania/ziemniaki-warzywa.html'),
        rozwiazaniaBioLokalne: resolve(__dirname, 'rozwiazania/bio-lokalne.html'),
        rozwiazaniaMiesoDania: resolve(__dirname, 'rozwiazania/mieso-dania.html'),
        rozwiazaniaNapoje: resolve(__dirname, 'rozwiazania/napoje.html'),
        jakDzialamy: resolve(__dirname, 'jak-dzialamy.html'),
        oferta: resolve(__dirname, 'oferta.html'),
        finansowanie: resolve(__dirname, 'finansowanie.html'),
        automatySielaff: resolve(__dirname, 'automaty-sielaff.html'),
        poradnik: resolve(__dirname, 'poradnik.html'),
        poradnikJajka: resolve(__dirname, 'poradnik/ile-kosztuje-automat-na-jajka.html'),
        poradnikChleb: resolve(__dirname, 'poradnik/automat-na-chleb-jak-dziala.html'),
        poradnikPrzepisy: resolve(__dirname, 'poradnik/sprzedaz-zywnosci-z-automatu-przepisy.html'),
      },
    },
  },
});
