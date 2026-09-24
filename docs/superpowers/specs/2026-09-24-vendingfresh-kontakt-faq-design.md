# VendingFresh — `/kontakt` i `/faq`

Data: 2026-09-24

## Kontekst

Drugi etap budowy VendingFresh (po etapie 1: struktura, strona główna, konfigurator — zmergowanym do `main`). Dodaje dwie proste, samodzielne podstrony korzystające z istniejącego design systemu (partiale, `style.css`, `main.ts`).

## `/kontakt` (`kontakt.html`)

- Hero: nadtytuł "Kontakt", H1 "Porozmawiajmy o Twoim automacie."
- Formularz ogólny (osobny kanał niż konfigurator — idzie przez Formspree, nie przez `/api/konfigurator`): imię, telefon, e-mail, wiadomość (textarea), zgoda RODO. `action="https://formspree.io/f/xqpalbpj"`, `method="POST"`.
- Obok formularza: blok z danymi kontaktowymi (telefon `+48 735 115 427`, e-mail `kontakt@vendingfresh.pl` — te same wartości co w stopce) i CTA "Wolisz od razu dobrać automat? → Przejdź do konfiguratora".
- Bez mapy/adresu fizycznego — firma działa serwisowo w całej Polsce, bez stacjonarnego biura.
- SEO: canonical `/kontakt`, meta description, OG tagi, w `vercel.json` rewrite `/kontakt` → `/kontakt.html`, dopisany do `vite.config.ts` rollupOptions.input i do `public/sitemap.xml`.

## `/faq` (`faq.html`)

- Hero: nadtytuł "FAQ", H1 "Najczęstsze pytania."
- 8 pytań/odpowiedzi w stylu akordeonu (klik nagłówka rozwija/zwija odpowiedź), oparte na już ustalonych faktach biznesowych z briefu VendingFresh:
  1. Czym różni się VendingFresh od zwykłego automatu vendingowego? (konfiguracja pod produkt, nie automat z półki)
  2. Ile kosztuje automat? (wycena zawsze indywidualna, bez cen na stronie)
  3. Ile trwa realizacja od zapytania do uruchomienia? (konfigurator → wycena 24-48h → montaż → start)
  4. Czy muszę mieć własną lokalizację? (nie — pomoc w doborze miejsca, automat w budynku/pod wiatą/na zewnątrz)
  5. Jak wygląda serwis i awarie? (montaż i serwis w całej Polsce, telemetria jako opcja)
  6. Czy można sfinansować automat w leasingu albo z dotacji? (leasing — domyślna ścieżka; dotacje ARiMR — głównie rolnicy, link do poradnika na sklepzastodola.pl)
  7. Jakie produkty mogę sprzedawać? (pieczywo, jajka, sery, warzywa, bio/lokalne, mięso/dania, napoje — link do `/rozwiazania/*` gdy powstaną)
  8. Czy VendingFresh współpracuje tylko z rolnikami? (nie — też piekarnie, serowarnie, sklepy, gminy, inwestorzy pod lokalizację)
- CTA na końcu: "Nie znalazłeś odpowiedzi? → Napisz do nas" (link do `/kontakt`).
- SEO: canonical `/faq`, JSON-LD `FAQPage` (odwzorowujący te same 8 par pytanie/odpowiedź — realny wymóg z oryginalnego briefu), meta description, OG tagi, rewrite w `vercel.json`, wpis w `vite.config.ts` i `sitemap.xml`.

## Techniczne

- Nowy plik `src/faq.ts` — czysta funkcja `initAccordion()` (guard na brak elementów, jak reszta kodu), analogicznie do wzorca w `main.ts`. Bez logiki wymagającej testów jednostkowych (proste toggle klasy `is-open`), spójnie z tym, że `main.ts` też nie ma testów DOM-wiring.
- `kontakt.html` nie wymaga własnego JS poza `main.ts`/`cookies.ts` — formularz to zwykły natywny submit do Formspree, bez JS.
- Obie strony dodają `<!-- include:cookie-banner.html -->` (wzorzec ustalony w etapie 1 dla wszystkich stron).

## Poza zakresem

Walidacja/testy formularza Formspree (Formspree waliduje po swojej stronie), dodatkowe pytania FAQ specyficzne dla `/rozwiazania/*` (dojdą przy tamtych podstronach).
