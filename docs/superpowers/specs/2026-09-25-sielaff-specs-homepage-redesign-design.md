# Specyfikacje Sielaff + redesign homepage

**Data:** 2026-09-25
**Status:** Zaakceptowany

## Cel

Serwis obecnie opisuje modele Sielaff jednym zdaniem, bez zdjęć i bez realnych parametrów technicznych. Homepage jest zdominowana przez siatki tekstowych kart ("pusty tekst"), bez żadnych zdjęć poza logo. Celem jest:

1. Dodać pełne, realne specyfikacje modeli Sielaff (wymiary, pojemność, temperatura, ekran, płatności, warianty) wraz ze zdjęciami produktowymi.
2. Odchudzić homepage wizualnie — zastąpić kluczowe sekcje tekstowe układem zdjęcie+tekst, a sekcję "Rozwiązania" (pieczywo/jajka/sery/...) karuzelą zdjęć.

## Źródło danych

Serwis to statyczny multi-page Vite (patrz `vite.config.ts`) — każda strona to osobny plik HTML z treścią wpisaną wprost (partials tylko dla nav/footer/cookie-banner przez `vite-plugins/html-include`). Nie ma warstwy renderującej HTML z danych w buildzie, więc specyfikacje modeli wpisujemy bezpośrednio w markup `automaty-sielaff.html` i `rozwiazania/*.html` — bez pośredniego pliku `.ts`/`.json`, żeby nie zostawiać martwego kodu, którego nic nie czyta. Ten dokument (sekcja "Zebrane specyfikacje" poniżej) jest źródłem prawdy dla wartości liczbowych, żeby nie rozjeżdżały się między stronami.

Pola opisujące model (spójne dla każdej karty): nazwa, kategoria, wymiary/pojemność, zakres temperatur (jeśli dotyczy — w tym dwustrefowe, np. SN48 2T LM: górna strefa ~10–15°C, dolna strefa ≤4°C), ekran, dodatkowe cechy, warianty, krótki opis.

Modele do pokrycia z pełnymi kartami: **SiLine Snack & Combi, SN48, SiLine GF, Robimat X series, seria FK, Siamonie series, SiLine HG TS27 / SiVend HG 15 TT, SiLine/SiVend Outdoor, SiLine Public, SiOne**. **SiLoop (CO2)** to funkcja/moduł doczepiany do automatów na napoje (nie osobna maszyna z własnym zdjęciem) — dostaje krótką wzmiankę bez pełnej karty.

Jeśli dla któregoś modelu nie da się znaleźć konkretnej wartości liczbowej (np. producent nie podaje wymiarów publicznie), pole zostaje pominięte zamiast wypełnione zgadywaną wartością — nie zmyślamy specyfikacji technicznych.

### Zebrane specyfikacje (źródło: sielaff.de, pobrane 2026-09-25)

**SiLine® Snack & Combi** — szerokość 780 lub 990 mm; dwie strefy temperatur w jednej maszynie, granica między nimi przesuwalna między półkami; hermetyczny system chłodzenia z elektronicznie sterowanym agregatem typu push-in; ekran 7" LED, dotykowy, 800×480 px; oprogramowanie "FoodSafety" monitorujące temperaturę w strefie świeżych produktów; opcjonalna winda (lift system) do delikatnych produktów (jajka, szkło, napoje gazowane).

**SN48** — jeden rozmiar obudowy, 5 lub 6 półek, 8 spiral w wielu rozmiarach; warianty: Snack / Combi / Fresh food / 2T LM (dwustrefowy); w wersji 2T LM górne półki ~10–15°C, dolna strefa (LM) ≤4°C, monitorowana przez oprogramowanie FoodSafety; obudowa nitowana, półki i spirale metalowe malowane proszkowo, agregat push-in, sterownik SMD.

**SiLine® GF** — do 72 wyborów na 8 półkach; butelki szklane/PET i puszki 0,2–0,6 l, maks. wysokość butelki 270 mm; hermetyczne chłodzenie, agregat push-in; wspólny dla serii SiLine ekran dotykowy.

**Robimat X series (XS/XM/XL)** — dostawa produktu ramieniem robota (nie spiralą); butelki/puszki 0,2–0,6 l, maks. wysokość 270 mm, produkty 200–910 g, średnica do 72 mm; XM: 5 półek, 35 wyborów, ok. 315 napojów (PET 0,6 l); XL: 5 półek, 45 wyborów, ok. 405 napojów; konstrukcja modułowa, w pełni serwisowalna i podlegająca recyklingowi, oświetlenie LED, szklenie izolacyjne.

**Seria FK** — klasyczny automat zsypowy na napoje w butelkach/puszkach 0,2–2,0 l; wiele rozmiarów obudowy, wariantów drzwi i szerokości/głębokości zsypów; elastyczny system zsypów (standardowe i wąskie w dowolnej kombinacji); kompaktowy agregat elektroniczny typu slide-in, dostawa wózkiem paletowym bez palety; wersje wysokiego bezpieczeństwa (poza FK170); FK280 dostępny w wersji outdoor IP24; klasa energetyczna A+ lub lepsza.

**Siamonie series** (kawa) — wymiary 710 × 450 × 570 mm, waga 68 kg; do 250 kubków/h; pojemność półki ok. 15 kubków kawy / 25 espresso / 15 szklanek latte macchiato, górna szklana półka ok. 12 kubków; pojemnik na ziarna 1,2 kg (wariant Mono), uzupełnianie po 1 kg; zasilanie 230 V/50 Hz/16 A, pobór mocy 2,9 kW; 10 przycisków bezpośredniego wyboru, do 20 produktów.

**SiLine® HG TS27 / SiVend HG 15 TT** (gorące napoje) — TS27: bojler 2,0 kW + dogrzewanie zależne od przepływu, temperatura ustawiana per produkt/składnik, pełnopowierzchniowy dotykowy wyświetlacz za szkłem; HG 15 TT: profil premium (kawa specialty); pokrewny model HG20 Trend: do 20 napojów gorących, podajnik kubków (bucket elevator) 520×70 mm i 375×80 mm, kubki 150 ml (70 mm) / 240–300 ml (80 mm), dozowanie gorącej wody.

**SiLine® / SiVend® Outdoor series** — klasa szczelności IP24, odporność na warunki do -20°C; niezależnie testowane, oznaczenie GS; przeznaczone na lokalizacje zewnętrzne o dużym ruchu pieszym.

**SiLine® Public series** — spirale i popychacze na słodycze, przekąski, świeże produkty, napoje i produkty niespożywcze; panel antywandalowy z poliwęglanu 12 mm, wzmocniona falista blokada dźwigni; telemetria, pobór danych przez USB/MDB; oprogramowanie monitorujące chłodzenie i zużycie energii, zgłasza usterki przy otwarciu drzwi; koszyk do 5 produktów, funkcja zestawów ("deal"); miejsce na informacje o alergenach/składnikach i banery reklamowe.

**SiOne series** (zwrot opakowań) — rozpoznawanie kodów kreskowych do 10 000 pozycji; prędkość przyjmowania do 30 opakowań/min; pojemność do 600 butelek PET 0,5 l lub 700 puszek; wersja wolnostojąca lub naścienna; kolory RAL 9010 / RAL 9006 / RAL 9005; opcje: drugi hopper na monety, separacja na 2 frakcje, kontener na rolki, drukarka paragonów, dodatkowa ochrona, zabezpieczenie antyoszustwowe, rozpoznawanie produktu.

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

## Sygnał "dowolny produkt"

Cała obecna IA serwisu (nav, hero tiles, sekcja "Rozwiązania", karuzela) komunikuje wyłącznie żywność. Realny core USP VendingFresh to konfiguracja automatu pod dowolny produkt (żywność, ale też np. biżuteria, kosmetyki, szczoteczki) — nie tylko przygotowane z góry kategorie spożywcze. Pełna przebudowa IA pod branże pozażywnościowe jest poza zakresem tej pracy (osobny temat na przyszłość), ale w ramach karuzeli na homepage dodajemy jedną dodatkową kartę na końcu: "Twoja branża?" — krótki tekst o konfiguracji pod dowolny produkt/opakowanie, z linkiem do konfiguratora. Bez zdjęcia produktowego (nie mamy go) — neutralne tło marki (kolor `--color-primary` + ikona z konfiguratora).

## Poza zakresem
- Nie zmieniamy kolejności ani treści sekcji niezwiązanych ze sprzętem/zdjęciami (kalkulator, finansowanie, FAQ, poradnik).
- Nie dodajemy zdjęć do stopki ani innych podstron (kontakt, FAQ, poradnik) — poza zakresem tej prośby.
- Nie tworzymy nowego systemu CMS/danych ani warstwy szablonów — specyfikacje wpisujemy wprost w HTML, zgodnie z istniejącą konwencją repo.

## Weryfikacja
Dev server + przegląd w przeglądarce: homepage (karuzela + split-sections), `automaty-sielaff.html` (pełne specyfikacje), min. 2 strony `rozwiazania/*` (karta polecanego modelu). Sprawdzenie responsywności (mobile) i braku błędów 404 dla obrazów.
