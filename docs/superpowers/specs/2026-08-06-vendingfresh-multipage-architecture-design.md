# VendingFresh — Multi-page Architecture Foundation (Design Spec)

Date: 2026-08-06
Status: Approved by user, ready for implementation planning.

## Context

Etap 1 rebrandingu (Home v2 + Polityka/RODO placeholders) jest zamknięty
(`docs/brand/2026-08-05-brandbook.md`, sekcja "Decyzja dot. kolejności prac").
Kolejne etapy — architektura wielostronicowa (ten projekt), podstrony oferty,
realizacje, o nas, blog, lokalne SEO — to osobne projekty z własnym
spec+planem.

Ten projekt dostarcza **wyłącznie fundament**: mechanizm współdzielenia
nav/footer między stronami, konwencje URL, i działającą nawigację
międzystronicową. Żadna z przyszłych podstron (oferta, realizacje, o nas,
blog) nie jest tworzona w tym projekcie — ich treść to osobne specy.

Obecny stan repo: Vite multi-entry build (`vite.config.ts`:
`index.html`, `polityka.html`, `rodo.html`), zwykłe pliki `.html` + TS +
jeden globalny `src/style.css`, bez frameworka i bez SSG. Pełny `nav` +
`footer` markup istnieje dziś tylko w `index.html`; `polityka.html` i
`rodo.html` mają uproszczony layout (logo + tekst + link powrotny, bez
nav/footer). Linki nav używają kotwic (`#oferta`, `#kontakt`, `#top`),
które działają tylko na stronie, na której się znajdują.

## Cel

Umożliwić dodawanie kolejnych pełnowartościowych stron bez kopiowania
markupu nav/footer do każdego pliku i bez linków nav, które łamią się
poza stroną główną.

## 1. Architektura ogólna

- `partials/nav.html` i `partials/footer.html` — wyciągnięte 1:1 z
  obecnego `index.html`, jedno źródło prawdy dla nav/footera.
- Każdy plik strony zawiera znaczniki `<!-- include:nav.html -->` /
  `<!-- include:footer.html -->` w miejscu, gdzie ma się pojawić
  nav/footer.
- Custom plugin Vite (`vite-plugins/html-include.ts`, hook
  `transformIndexHtml`) podmienia znaczniki na zawartość partiali w
  czasie `npm run dev` i `npm run build` (ten sam hook uruchamia się w
  obu trybach dla każdego skonfigurowanego wpisu HTML).
- Błąd hard-fail: brakujący partial albo nierozpoznany znacznik include
  przerywa build z czytelnym komunikatem (nazwa pliku + znacznik) —
  nigdy nie zostawiamy surowego znacznika w wyjściowym HTML.
- Partiale nie mogą zagnieżdżać kolejnych include (jeden poziom,
  bez rekurencji) — świadome ograniczenie, unikamy pętli i
  niepotrzebnej złożoności.

### Przepis na dodanie nowej strony (dla przyszłych projektów)

1. Utwórz `<slug>.html` w katalogu głównym repo (płaskie pliki, zgodnie
   z konwencją URL poniżej), z markerami include na nav/footer.
2. Zarejestruj plik w `vite.config.ts` → `build.rollupOptions.input`
   (ręcznie — bez automatycznego globowania, żeby zestaw stron
   pozostał jawny i kontrolowany).
3. Podłącz skrypt TS wejściowy: `placeholder.ts` (tylko `initSharedPage()`)
   dla prostych stron, albo nowy dedykowany entry, jeśli strona
   potrzebuje własnej logiki (analogicznie do `main.ts` dla Home).

## 2. Konwencja URL i linków

- **Płaskie pliki `.html`** w katalogu głównym (np. przyszłe
  `oferta-kawa.html`, `realizacje.html`, `o-nas.html`) — zgodne z
  istniejącym wzorcem (`polityka.html`, `rodo.html`), zero dodatkowej
  konfiguracji Vite/Vercel.
- **Linki do realnych stron zawsze bezwzględne**: `/plik.html`
  (już stosowane dla `/polityka.html`, `/rodo.html` w footerze —
  potwierdzamy jako konwencję na przyszłość, bez zmian).
- **Linki nav do sekcji na Home zawsze `/#kotwica`** (bezwzględna
  ścieżka + hash) zamiast samego `#kotwica`:
  - Z dowolnej podstrony: nawigacja wraca na `/` i przewija do sekcji.
  - Z samej Home (`/`): przeglądarka traktuje to jako nawigację w
    obrębie dokumentu (ścieżka się nie zmienia), więc zachowanie jest
    identyczne jak dziś (bez przeładowania strony).
  - Dotyczy to nav (`nav__links`, dropdown "Oferta") oraz kolumny
    "Menu" w footerze.
- **Podświetlanie aktywnej strony w nav — świadomie pominięte**
  (YAGNI): dziś żaden wpis nav nie wskazuje samodzielnej strony poza
  Home, więc nie ma czego podświetlać. Naturalnie wróci to jako część
  specu pierwszej prawdziwej podstrony z własnym wpisem w nav.

## 3. Współdzielone moduły TS

Dziś `main.ts` (Home) ma logikę nav (toggle hamburgera, toggle
dropdownu), a `placeholder.ts` (polityka/rodo) nie ma nic — bo te
strony nie miały nav. Skoro polityka/rodo dostają pełny nav (patrz
sekcja 4), ta logika musi być współdzielona.

- **`src/nav.ts`** (nowy) — eksportuje `initNav()`, wycięte 1:1 z
  obecnego `main.ts`: toggle hamburgera, toggle dropdownu "Oferta",
  zamykanie menu po kliknięciu linku. Zero zależności od zawartości
  konkretnej strony — działa wyłącznie na ID/klasach zdefiniowanych w
  `partials/nav.html`.
- **`src/pageInit.ts`** (nowy) — eksportuje `initSharedPage()`: import
  `style.css`, dodanie klasy `js-ready` na `<html>`, wywołanie
  `initNav()`. Wspólny "start" dla każdej strony.
- **`main.ts`** (Home): woła `initSharedPage()`, potem dodatkowo
  `initScrollReveal()` (tylko Home ma sekcje `.reveal`).
- **`placeholder.ts`** (polityka/rodo i przyszłe proste strony): woła
  tylko `initSharedPage()`.

## 4. Migracja istniejących stron

- **`index.html`**: obecny inline nav i footer zostają wycięte i
  przeniesione 1:1 do `partials/nav.html` / `partials/footer.html`, w
  ich miejscu wstawiane są znaczniki include. Reszta strony (hero,
  sekcje) bez zmian. Linki nav/footer zaktualizowane na konwencję z
  sekcji 2.
- **`polityka.html` / `rodo.html`**: dostają te same znaczniki include
  (nav + footer) wokół istniejącej treści `<main class="placeholder-page">`,
  plus przełączenie na wersję `placeholder.ts` wołającą `initSharedPage()`.
  Treść samego placeholdera (logo, nagłówek, link powrotny) bez zmian —
  to wyłącznie dodanie layoutu wokół.
- **CSS**: bez zmian — jeden globalny `src/style.css` dla wszystkich
  stron, tak jak dziś. Nie dzielimy go na pliki per-strona —
  przedwczesne przy 3 stronach.

## 5. Plugin Vite — szczegóły implementacyjne i testy

- **`vite-plugins/html-include.ts`**:
  - Czysta, testowalna funkcja `resolveIncludes(html: string, partials: Map<string, string>): string` —
    szuka znaczników `<!-- include:NAZWA.html -->` (regex), podmienia na
    zawartość z `partials`, rzuca błąd (z nazwą pliku/znacznika) przy
    braku dopasowania w mapie.
  - Sam plugin (`transformIndexHtml` hook) to cienka warstwa I/O: wczytuje
    pliki z `partials/` do `Map<string, string>` i woła `resolveIncludes`.
- **Testy jednostkowe (Vitest, TDD)** dla `resolveIncludes`:
  - podmiana pojedynczego markera,
  - podmiana kilku markerów w jednym dokumencie,
  - brak markera w wejściowym HTML → no-op (dokument bez zmian),
  - marker wskazujący nieznaleziony partial → rzuca błąd z czytelnym
    komunikatem.
  - Testy operują na czystych stringach/Map, bez dotykania systemu
    plików ani serwera dev — szybkie i deterministyczne.
- Sama warstwa I/O pluginu (odczyt plików, rejestracja hooka w Vite)
  weryfikowana ręcznie przez `npm run build` + `npm run dev` (sprawdzenie,
  że wynikowy HTML ma poprawnie wstawiony nav/footer na wszystkich
  trzech stronach) — nie mockujemy Vite'a w unit testach dla tak cienkiej
  warstwy.

## 6. Testowanie i weryfikacja całości

1. `npm run test` — testy jednostkowe `resolveIncludes` (nowe), zielone.
2. `npm run build` — sukces, `dist/index.html`, `dist/polityka.html`,
   `dist/rodo.html` wszystkie zawierają wstawiony nav i footer (bez
   surowych znaczników include).
3. `npm run dev` — ręczna weryfikacja na wszystkich trzech stronach:
   - nav wygląda identycznie (branding, linki, dropdown "Oferta",
     hamburger na mobile),
   - linki `/#oferta`, `/#kontakt` z podstrony (`polityka.html`,
     `rodo.html`) wracają na Home i przewijają do właściwej sekcji,
   - footer wygląda identycznie na wszystkich stronach,
   - `polityka.html`/`rodo.html` zachowują swoją oryginalną treść
     placeholdera wewnątrz nowego layoutu.

## Poza zakresem (świadomie)

- Treść jakiejkolwiek nowej podstrony (oferta, realizacje, o nas, blog,
  lokalne SEO) — osobne przyszłe projekty.
- Podświetlanie aktywnej strony w nav — wraca z pierwszą prawdziwą
  podstrona.
- Czyste URL-e bez `.html` / przepisywanie tras w `vercel.json` —
  odrzucone na rzecz płaskich plików `.html`.
- Podział `style.css` na pliki per-strona.
- Migracja do generatora stron statycznych (Astro/11ty) — rozważona
  jako alternatywne podejście, odrzucona jako nieproporcjonalna do
  zakresu "tylko fundament" (duża migracja świeżo ukończonego
  rebrandingu do innego stacku).

## Self-review

- **Skan placeholderów:** brak TBD/TODO poza świadomie pozostawionym
  komentarzem `<!-- TODO: podmienić na realne linki -->` przy ikonach
  social w `partials/footer.html` (dziedziczone z istniejącego
  `index.html`, poza zakresem tego projektu).
- **Spójność wewnętrzna:** konwencja linków (sekcja 2) jest spójna z
  migracją (sekcja 4) i z istniejącym już wzorcem `/polityka.html`,
  `/rodo.html` w footerze — nie wprowadza sprzeczności.
- **Zakres:** pojedynczy spójny podsystem (mechanizm partiali + moduły
  TS + konwencje), gotowy do jednego planu implementacji — nie wymaga
  dalszej dekompozycji.
- **Jednoznaczność:** wszystkie decyzje (URL, linki, active-state,
  zakres migracji polityka/rodo, mechanizm partiali) zostały
  jawnie wybrane przez użytkownika w toku brainstormingu, żadna nie
  pozostaje otwarta.
