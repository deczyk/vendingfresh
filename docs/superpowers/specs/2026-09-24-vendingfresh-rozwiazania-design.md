# VendingFresh — `/rozwiazania/*` (7 podstron produktowych)

Data: 2026-09-24

## Kontekst

Trzeci etap budowy VendingFresh. Naprawia 7 martwych linków (menu "Rozwiązania", 7 kafelków w hero, sekcja "Rozwiązania wg produktu" na stronie głównej), które od etapu 1 prowadzą do nieistniejących stron.

## Struktura plików

Osobny folder `rozwiazania/` na poziomie roota (analogicznie do jak `blog/` w starym repo), żeby URL-e wychodziły czyste przez `vercel.json` rewrites bez zmian w pluginie `html-include` (partiale rozwiązują się względem stałego `partials/`, niezależnie od położenia strony wywołującej):

```
rozwiazania/pieczywo.html
rozwiazania/jajka.html
rozwiazania/sery.html
rozwiazania/ziemniaki-warzywa.html
rozwiazania/bio-lokalne.html
rozwiazania/mieso-dania.html
rozwiazania/napoje.html
```

`vite.config.ts` dostaje 7 nowych wpisów w `rollupOptions.input`, `vercel.json` 7 rewrite'ów (`/rozwiazania/pieczywo` → `/rozwiazania/pieczywo.html` itd.), `public/sitemap.xml` 7 nowych `<url>`.

## Wspólny szablon (8 sekcji, identyczny na wszystkich 7 stronach)

1. Hero: nadtytuł "Rozwiązanie", H1 "Automat na [produkt] <em>24/7.</em>"
2. Dla kogo — komu ta strona jest dedykowana
3. Jak konfigurujemy automat pod ten produkt — opakowanie, temperatura, sposób wydawania
4. Na co uważać — przepisy, etykiety, rotacja, świeżość
5. Co sprzedawać obok — pomysły na większy koszyk
6. Mini-kalkulator opłacalności — **ponowne użycie istniejącego `src/calculator.ts`** (żadnego nowego JS): te same 5 suwaków i wyniki co na stronie głównej, bez przycisków presetów (calculator.ts iteruje `[data-preset]` przez `querySelectorAll`, więc brak tych przycisków nic nie psuje), z wartościami startowymi dopasowanymi do ekonomiki danego produktu zamiast domyślnych z homepage
7. FAQ dla tego produktu — 3-4 pytania, zwykły blok (bez akordeonu — mniejszy zakres niż `/faq`, nie wymaga JS)
8. CTA do konfiguratora

Każda strona ładuje `/src/main.ts` (nav), `/src/calculator.ts` (mini-kalkulator), `/src/cookies.ts` (banner) — bez nowych plików JS.

## Treść per produkt (z oryginalnego briefu klienta)

- **Pieczywo**: krótka świeżość → codzienna rotacja, temperatura pokojowa (nie chłodzenie), pieczywo w torbach, szczyty sprzedaży rano i wieczorem. Frazy SEO: automat do chleba, automat na pieczywo. Kalkulator: transakcje 40, koszyk 12 zł, marża 35%, inwestycja 35000, koszty 400 (= preset "piekarnia" z homepage).
- **Jajka**: delikatne wydawanie (winda), wytłaczanki, oznakowanie jaj zgodnie z przepisami. Frazy: automat na jajka, jajomat. Kalkulator: 20 / 15 zł / 40% / 30000 / 250 (= preset "jajka").
- **Sery i nabiał**: chłodzenie, różne formaty (kostki, krążki, jogurty), wyższa średnia wartość koszyka. Frazy: automat na sery, regiomat. Kalkulator: 15 / 25 zł / 45% / 40000 / 350 (= preset "serowarnia").
- **Ziemniaki i warzywa**: duże ciężkie opakowania (worki 2,5–5 kg), sezonowość, niska marża → liczy się wolumen. Frazy: ziemniakomat. Kalkulator: 50 / 8 zł / 20% / 30000 / 300.
- **Bio i lokalne**: automat jako mini-sklep z wieloma produktami, ekran z opisami producentów. Frazy: sklep samoobsługowy 24/7. Kalkulator: 60 / 20 zł / 30% / 60000 / 700 (= preset "bio").
- **Mięso, wędliny, dania gotowe**: chłodzenie z kontrolą temperatury, ścisłe wymogi sanitarne, telemetria temperatury. Frazy: automat chłodniczy Sielaff. Kalkulator: 25 / 22 zł / 35% / 45000 / 450.
- **Napoje**: SiLine GF, Robimat X, seria FK, opcja zwrotów (SiLoop). Frazy: automat vendingowy z żywnością. Kalkulator: 45 / 6 zł / 40% / 25000 / 300.

## SEO

Canonical `/rozwiazania/<slug>`, meta description z frazą kluczową danego produktu, OG tagi, bez osobnego JSON-LD (Product schema zostaje na później, gdy będą realne zdjęcia/ceny — a cen nie publikujemy).

## Poza zakresem

Zdjęcia produktów/automatów (placeholder tekstowy jak na reszcie strony), osobne artykuły poradnika per produkt (już zaplanowane w `/poradnik`).
