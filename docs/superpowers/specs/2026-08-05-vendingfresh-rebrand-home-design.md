# VendingFresh — Rebrand + nowy Home (design)

> Etap 1 z wieloetapowego planu przebudowy VendingFresh w kierunku pełnego serwisu firmowego
> (Apple/Stripe/Tesla/Notion). Realizuje rebranding z `docs/brand/2026-08-05-brandbook.md`
> oraz nową strukturę strony głównej dostarczoną przez użytkownika 2026-08-05. Kolejne etapy
> (architektura wielostronicowa, podstrony oferty, realizacje, o nas, blog, lokalne SEO) mają
> własne specy, tworzone osobno.

## Kontekst

Obecna strona to jednostronicowy Vite + TypeScript + Three.js scaffold: pełnoekranowe Hero
z automatem 3D reagującym na scroll (tilt), 4 sekcje (`produkt`, `funkcje`, `kontakt`),
paleta zielono-złoto-kremowa (Montserrat). Brandbook z 2026-08-05 ustalił nowy kierunek
(granat + zielony akcent, Manrope) i wprost odłożył wdrożenie na "osobny projekt zaraz po
zmergowaniu hero" — hero zostało zmergowane (`856e02d`), więc to ten moment.

## Cel

Przebudować stronę główną w nowej palecie i strukturze, w stylu dużo białej przestrzeni /
duże zdjęcia / mało tekstu / mocne CTA — "nie vending z 2018 roku". Ustanowić komponenty
(przyciski, karty, ikony, nav), z których skorzystają przyszłe podstrony.

## Poza zakresem tego etapu

Świadomie pomijamy sekcje/elementy wymagające danych, których jeszcze nie ma — żeby nie
publikować fikcyjnych treści:
- Sekcja **"Zaufało nam"** (loga klientów / liczby) — brak realnych danych.
- Sekcja **"Nasze realizacje"** (prawdziwe zdjęcia z montaży) — brak zdjęć.
- Sekcja **"Opinie"** (testimoniale klientów) — brak treści.
- Pasek zaufania w Hero (★★★★★, "100+ klientów" itd.) — brak potwierdzonych liczb.
- Nav items `Realizacje` / `O nas` / `Blog` — brak stron, do których miałyby prowadzić
  (wracają w etapie 2+, razem z architekturą wielostronicową).

Te elementy wracają jako osobne zadania, gdy będą realne materiały.

## Fundament: design tokens

1:1 z `docs/brand/2026-08-05-brandbook.md` — `:root` CSS variables (`--primary: #59B52C`,
`--secondary: #102235`, tło `#F8FAFB`, promienie 12/20/28px, cień `0 8px 30px rgba(16,34,53,.08)`),
font Manrope (Google Fonts, wagi 400/600/700) zamiast Montserrat.

## Sprzątanie istniejącego kodu

Hero przestaje być 3D/interaktywne (patrz sekcja Hero) — usuwamy cały mechanizm, który je
obsługiwał, zamiast zostawiać martwy kod obok nowego:
- Usunąć: `src/hero3d.ts`, `src/heroConfig.ts`, `src/heroFallback.ts`, `src/heroError.ts`,
  `src/imageCutout.ts`, `src/imageCutout.test.ts`, zależność `three` z `package.json`.
- `src/main.ts` zredukowany do: obsługi mobilnego menu (dropdown "Oferta") i FAQ (jeśli
  natywny `<details>` nie wystarczy do potrzebnej animacji — patrz niżej, domyślnie bez JS).

## Nawigacja

`Home` · `Oferta ▾` (dropdown, 6 pozycji, każda → kotwica `#oferta`) · `Kontakt` (→ kotwica
sekcji CTA). Logo w nav: `vendingfresh_logo_full.png` (nowe, granat+zielony) zamiast
obecnego ikona + tekstu w dwóch kolorach. Mobile: hamburger, dropdown rozwija się jako
lista pod "Oferta".

## Hero

Układ dwukolumnowy (desktop), pełna szerokość, dużo światła wokół:

- **Lewo:** eyebrow "ŚWIEŻOŚĆ. JAKOŚĆ. ZAUFANIE.", H1 "Nowoczesne automaty vendingowe dla
  firm.", podtytuł "Świeże produkty. Pełny serwis. Nowoczesne technologie.", CTA primary
  **Zamów wycenę** (→ kotwica `#kontakt`, czyli sekcja CTA na dole strony — patrz niżej —
  która zawiera właściwy przycisk `mailto:`), CTA secondary **Zobacz ofertę** (→ `#oferta`).
- **Prawo:** `vendingfresh_machine.webp` jako statyczne zdjęcie, zaokrąglenie 24px, delikatny
  cień z brandbooka. Bez 3D/tilt/scroll-interakcji (usunięte — patrz Sprzątanie).
- Mobile: kolumny w pionie, zdjęcie pod tekstem.

## Dlaczego VendingFresh

Siatka 2×3 (nie 2×2), większe ikony outline 2px (styl Lucide/Heroicons):
1. Świeże produkty — precyzyjne chłodzenie utrzymuje temperaturę przez cały czas
2. Wysoka jakość — solidne materiały i staranne wykonanie
3. Nowoczesne technologie — płatności bezgotówkowe, zdalny monitoring
4. Zaufanie i wsparcie — obecni na każdym etapie, od wdrożenia po serwis
5. Elastyczna oferta — dopasowanie automatu do branży i lokalizacji
6. Zdalny monitoring — podgląd stanu i sprzedaży 24/7

## Nasza oferta

6 dużych, klikalnych kafli (karta: zdjęcie/ikona + tytuł + 1 zdanie opisu), wszystkie
prowadzące do wspólnej sekcji `#oferta` niżej na tej samej stronie (osobna podstrona per
kategoria to etap 3). Treści poniżej są draftem do korekty użytkownika przed publikacją —
nie są to zweryfikowane dane firmy, tylko przepisany/ulepszony materiał marketingowy.

| Kategoria | Wizualizacja | Opis (draft) |
|---|---|---|
| Automaty chłodnicze | `vendingfresh_machine.webp` | Świeże produkty od lokalnych producentów — jaja, nabiał, miód, przetwory — dostępne 24h, bez obsługi i kolejki. |
| Automaty przekąskowe | `offer-przekaskowe.png` | Chipsy, batony i przekąski w zasięgu ręki — w biurze, szkole czy zakładzie pracy. |
| Automaty z napojami | `offer-napoje-fk.png` (główne), `offer-napoje-siline-gf.png` (galeria etap 3) | Zimne napoje, woda, soki — schłodzone i gotowe do wydania w każdej chwili. |
| Automaty kawowe | `offer-kawa-siamonie-series.png` (główne), `offer-kawa-siamonie-smart.png` + `offer-kawa-siline-hg-ts27.png` (galeria etap 3) | Świeżo parzona kawa i gorące napoje — jakość kawiarni bez baristy. |
| Automaty premium | brak zdjęcia — ikona | Rozbudowane konfiguracje dla lokalizacji o dużym natężeniu ruchu. |
| Dzierżawa automatów | brak zdjęcia — ikona | Zero inwestycji początkowej — automat, montaż i serwis w jednym abonamencie. |

Zdjęcia produktowe (`offer-*.png`) pochodzą z materiałów producenta (Sielaff) — logo
producenta widoczne celowo, zgodnie z decyzją użytkownika (VendingFresh jako
dealer/instalator tego sprzętu).

Opis kategorii "Automaty chłodnicze" oparty na treści z `sklepzastodola.pl/automat-chlodniczy.html`
(materiał własny użytkownika, inna jego strona w tej samej niszy — produkty z gospodarstwa),
przepisany pod głos marki VendingFresh, nie skopiowany 1:1.

## Jak wygląda współpraca

5 kroków w poziomie (desktop) / pionie (mobile), numerowane, ze strzałkami:
`Kontakt → Analiza → Dobór automatu → Montaż → Serwis`, jedno zdanie opisu pod każdym
krokiem (bez konkretnych czasów/liczb, żeby nie zmyślać zobowiązań).

## FAQ

Akordeon na natywnym `<details>/<summary>` (dostępny, bez JS), ostylowany pod design
system. Pytania — draft do korekty przed publikacją:
1. Jak długo trwa montaż automatu?
2. Czy potrzebuję własnego przyłącza prądu?
3. Jakie produkty można sprzedawać w automacie?
4. Czy oferujecie tylko zakup, czy też dzierżawę?
5. Jak wygląda serwis i co w razie awarii?

## CTA

Sekcja z `id="kontakt"` (cel kotwic z nav i Hero powyżej): "Gotowy na automat w swojej
firmie?" + przycisk primary **Umów rozmowę** → `mailto:kontakt@vendingfresh.pl`, plus
widoczny numer telefonu `+48 690 000 923` jako alternatywa dla osób wolących zadzwonić.

## Footer

- Logo + tagline "ŚWIEŻOŚĆ. JAKOŚĆ. ZAUFANIE."
- Menu: Home / Oferta / Kontakt (zgodnie z obecnym nav tego etapu)
- Kontakt: `kontakt@vendingfresh.pl`, `+48 690 000 923`
- Godziny: Pon–Pt 7:00–18:00
- Social media: ikony Facebook/LinkedIn jako placeholdery — bez działającego `href` (albo
  `href="#"` + komentarz `TODO: podmienić na realny link`), do podmiany gdy użytkownik
  poda profile.
- Polityka / RODO: linki do nowych, płaskich statycznych stron `polityka.html` i `rodo.html`
  z treścią "Strona w przygotowaniu — wróć wkrótce" + link powrotny do Home. To wyjątek od
  zasady "brak nowych podstron w tym etapie" — to dwa trywialne, beztreściowe pliki bez
  routingu/szablonów, nie wymagają decyzji architektonicznej z etapu 2.

## Testy

Istniejące testy Vitest dla `imageCutout.ts` znikają razem z plikiem (funkcjonalność
usunięta). Nowych testów jednostkowych nie przewidujemy dla samego HTML/CSS — ewentualny
JS (mobile menu toggle) dostaje prosty test, jeśli logika przekroczy trywialny toggle
klasy.

## Ryzyka / otwarte kwestie

- Wybór zdjęcia głównego dla "Automaty z napojami" i "Automaty kawowe" to propozycja
  projektanta (bardziej nowoczesny wygląd z ekranem) — użytkownik może zmienić priorytet
  zdjęć bez wpływu na resztę designu.
- Treści oferty/FAQ to draft marketingowy, nie zweryfikowane fakty firmy — wymagają
  przeczytania przez użytkownika przed deployem na produkcję.
