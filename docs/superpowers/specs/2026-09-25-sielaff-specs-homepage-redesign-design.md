# Specyfikacje Sielaff + redesign homepage

**Data:** 2026-09-25
**Status:** Zaakceptowany

## Cel

Serwis obecnie opisuje modele Sielaff jednym zdaniem, bez zdjęć i bez realnych parametrów technicznych. Homepage jest zdominowana przez siatki tekstowych kart ("pusty tekst"), bez żadnych zdjęć poza logo. Celem jest:

1. Dodać pełne, realne specyfikacje modeli Sielaff (wymiary, pojemność, temperatura, ekran, płatności, warianty) wraz ze zdjęciami produktowymi.
2. Odchudzić homepage wizualnie — zastąpić kluczowe sekcje tekstowe układem zdjęcie+tekst, a sekcję "Rozwiązania" (pieczywo/jajka/sery/...) karuzelą zdjęć.

## Źródło danych

Nowy plik `src/data/sielaff-models.ts` — jeden obiekt na model. To jedyne miejsce, z którego czytają zarówno `automaty-sielaff.html`, jak i karty "polecany model" na stronach `rozwiazania/*`. Pola na model:

- `slug`, `name`, `category` (świeże produkty / napoje / gorące napoje / outdoor / dodatki-kawa / zwroty opakowań)
- `dimensions` (szer./wys./głęb.), `capacity` (opis pojemności — liczba spiral/półek/pojemników)
- `tempRange` (jeśli dotyczy — w tym dwustrefowe, np. SN48 2T LM: górna strefa ~10–15°C, dolna strefa ≤4°C)
- `screen` (przekątna, rozdzielczość, typ)
- `payment` (obsługiwane metody)
- `variants` (lista dostępnych wersji, np. Snack/Combi/Fresh food/2T LM dla SN48)
- `shortDescription`, `longDescription`
- `images: { product: string; lifestyle?: string }` — ścieżki względne do `public/sielaff/<slug>/`

Modele do pokrycia: **SiLine Snack & Combi, SN48, SiLine GF, Robimat X, seria FK, Siamonie, SiLine HG/SiVend HG, SiLine Outdoor/SiVend Outdoor, SiLine Public, SiLoop, SiOne**. Realne wartości specyfikacji (wymiary, pojemność, zakresy temperatur) są dociągane z sielaff.de podczas implementacji — część już potwierdzona (SN48, SiLine Snack & Combi), reszta wymaga doczytania podstron produktowych i/lub kart PDF.

Jeśli dla któregoś modelu nie da się znaleźć konkretnej wartości liczbowej (np. producent nie podaje wymiarów publicznie), pole zostaje pominięte w renderze zamiast wypełnione zgadywaną wartością — nie zmyślamy specyfikacji technicznych.

## Zdjęcia

Pobierane bezpośrednio z sielaff.de (potwierdzona dostępność, np. `/fileadmin/Produkte/.../Produktbild_neben_Text_SN48.png`) i zapisywane lokalnie w `public/sielaff/<slug>/`:
- `product.jpg|png` — czyste zdjęcie produktowe na białym/neutralnym tle, używane w kartach specyfikacji.
- `lifestyle.jpg` (gdzie dostępne) — zdjęcie kontekstowe/banerowe, używane w sekcjach homepage i karuzeli.

Brak zdjęcia dla modelu = karta bez zdjęcia (fallback na istniejący styl `family-card`), nie placeholder ani obce zdjęcie.

## Strony

### `automaty-sielaff.html`
Każda karta modelu (obecnie `family-card` z jednym zdaniem) zamieniana na `model-card--photo`: zdjęcie produktowe + tabela specyfikacji (`spec-table`) + opis. Struktura sekcji (świeże produkty / napoje / outdoor / dodatki) zostaje bez zmian.

### `rozwiazania/*.html` (7 stron)
Każda strona dostaje sekcję "Polecany model" — kartę ze zdjęciem, 4–5 kluczowymi parametrami (nie pełną tabelę) i linkiem `Zobacz pełną specyfikację →` do kotwicy na `automaty-sielaff.html`. Przypisanie modeli:

| Strona | Model |
|---|---|
| pieczywo | SiLine Snack & Combi |
| jajka | SiLine Snack & Combi (opcja windy dla delikatnych produktów) |
| sery | SN48 — wersja Fresh food / 2T LM |
| mieso-dania | SN48 — wersja Fresh food / 2T LM |
| ziemniaki-warzywa | SiLine Snack & Combi |
| bio-lokalne | SiLine Snack & Combi |
| napoje | SiLine GF / Robimat X / seria FK (bez zmian co do wyboru, tylko dodane zdjęcia+specyfikacja) |

### Homepage (`index.html`)
- Sekcja "Rozwiązania" (obecna siatka 7 kart pieczywo/jajka/sery/warzywa/bio/mięso/napoje) zastąpiona karuzelą **Wariant B (flat peek)** zatwierdzoną w mockupie: środkowa karta pełnej wielkości, sąsiednie karty przyciemnione/pomniejszone bez obrotu 3D, podpis (nazwa + 1 zdanie) pojawia się na aktywnej karcie, nawigacja kropkami + klik na boczną kartę.
- Sekcje "Dlaczego automat", "Jak pracujemy" i "Automaty Sielaff" — nowy układ `.split-section` (50/50 zdjęcie+tekst, na mobile pod sobą). Reszta sekcji (kalkulator, checklist, finansowanie, opinia właściciela, poradnik, CTA) zostaje bez zmian układu.

## Nowe komponenty CSS
- `.split-section` — dwukolumnowy layout zdjęcie+tekst, warianty lewo/prawo, responsywny (pod sobą < 760px).
- `.spec-table` — lista parametr:wartość w karcie modelu.
- `.model-card--photo` — karta modelu ze zdjęciem, rozszerzenie istniejącego `.family-card`.
- `.carousel` (+ towarzyszący JS) — karuzela flat-peek z homepage, klikalne boczne karty, kropki nawigacyjne, klawiatura (strzałki) dla dostępności.

## Poza zakresem
- Nie zmieniamy kolejności ani treści sekcji niezwiązanych ze sprzętem/zdjęciami (kalkulator, finansowanie, FAQ, poradnik).
- Nie dodajemy zdjęć do stopki ani innych podstron (kontakt, FAQ, poradnik) — poza zakresem tej prośby.
- Nie tworzymy nowego systemu CMS/danych z bazy — `sielaff-models.ts` to statyczny plik w repo.

## Weryfikacja
Dev server + przegląd w przeglądarce: homepage (karuzela + split-sections), `automaty-sielaff.html` (pełne specyfikacje), min. 2 strony `rozwiazania/*` (karta polecanego modelu). Sprawdzenie responsywności (mobile) i braku błędów 404 dla obrazów.
