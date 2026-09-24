# VendingFresh rebuild — Etap 1: struktura, strona główna, konfigurator

Data: 2026-09-24

## Kontekst

Repo `vendingfresh` zostało wyczyszczone do zera (zachowany tylko `polityka.html`) w ramach pełnego przebudowania strony VendingFresh — drugiej marki spółki Sklep za Stodołą Sp. z o.o. (obok sklepzastodola.pl). VendingFresh sprzedaje automaty chłodnicze Sielaff konfigurowane pod konkretny produkt klienta (pieczywo, jajka, sery/nabiał, ziemniaki/warzywa, bio/lokalne, mięso/dania gotowe, napoje). VendingFresh jest **partnerem** Sielaff (nie dystrybutorem/przedstawicielem). Wycena zawsze indywidualna — bez cen/widełek na stronie.

Docelowa struktura serwisu (pełny zakres, budowany etapami):

```
/                                Start
/konfigurator                    wieloetapowy formularz leadowy
/rozwiazania/pieczywo
/rozwiazania/jajka
/rozwiazania/sery
/rozwiazania/ziemniaki-warzywa
/rozwiazania/bio-lokalne
/rozwiazania/mieso-dania
/rozwiazania/napoje
/automaty-sielaff
/jak-dzialamy
/finansowanie
/poradnik                        lista + pojedyncze artykuły
/faq
/kontakt
/polityka                        już istnieje, bez zmian
```

**Ten etap obejmuje tylko:** szkielet repo zdolny pomieścić powyższą strukturę bez przebudowy, `index.html` (pełna strona główna), `/konfigurator` (formularz leadowy). Pozostałe podstrony — kolejne etapy, każdy z własnym krótkim brainstormingiem tam, gdzie brakuje treści/zdjęć (automaty Sielaff, realizacje, artykuły poradnika).

Linki na stronie głównej do podstron spoza tego etapu (`/rozwiazania/*`, `/automaty-sielaff`, `/finansowanie`, `/poradnik`, `/faq`, `/kontakt`) będą już mieć docelowe, czyste URL-e i będą prowadzić do 404 do czasu zbudowania tamtych stron — akceptowalne przy budowie etapami, nie wymaga późniejszych poprawek linków.

## Design system

Paleta (zamiast zielono-kremowej z sklepzastodola.pl — chłodniejsza, morska, wybrana i zatwierdzona w wizualnym porównaniu):

```css
--color-primary: #008B8B;   /* DarkCyan — hero, nagłówki, stopka */
--color-secondary: #20B2AA; /* LightSeaGreen — tła sekcji, hover, akcent drugorzędny */
--color-accent: #D4F26A;    /* limonka — CTA, nadtytuły (.eyebrow), wyróżnienia */
--color-ink: #0A2E2E;       /* tekst na jasnym tle */
--color-bg: #FFFFFF;
```

Logo dostarczone przez klienta i zapisane w `public/`:
- `vendingfresh_logo.png` — pozioma wersja z przezroczystym tłem, użyta w nav (jasne tło).
- `vendingfresh_icon.png` — kwadratowa ikona z własnym tealowym tłem, działa na jasnym i ciemnym tle; użyta w stopce (ciemne tło) i jako favicon (`<link rel="icon">`).
- `vendingfresh_logo_white_bg.png` — wersja zapasowa z białym tłem, nieużywana na starcie.

Komponenty współdzielone (rodzina sklepzastodola.pl, przeniesiona 1:1 pod nową paletę): pasek przewijany (marquee) u góry strony, `.eyebrow` (nadtytuł uppercase w kolorze akcentu), H2 z `<em>` kursywą w drugiej części zdania, `.tiles` (kafelki), `.steps` (kroki klikane), `.slider-group` (suwaki kalkulatora).

Pasek przewijany, treść dosłowna: „Partner Sielaff • Konfiguracja pod Twój produkt • Sprzedaż 24/7 • Chłodzenie i wersje outdoor • Płatność kartą, BLIK i gotówką • Montaż i serwis w całej Polsce • Wycena indywidualna”.

## Struktura plików (ten etap)

```
index.html
konfigurator.html
polityka.html              (bez zmian)
partials/
  nav.html                  logo + linki (Realizacje NIE wchodzi do menu na starcie)
  footer.html                marka SzS, partner Sielaff, dane kontaktowe (placeholder),
                              ikony FB/IG VendingFresh (linki placeholder), link do
                              sklepzastodola.pl z dopiskiem "Mlekomaty BRUNIMAT", link /polityka
src/
  main.ts                   nav toggle, scroll spy, init cookie bannera
  konfigurator.ts            logika 9-krokowego formularza + submit
  calculator.ts               logika kalkulatora opłacalności (czyste funkcje, testowalne)
  cookies.ts                  banner cookies, gate na Meta Pixel
  style.css
api/
  konfigurator.js             Vercel Function: zapis do Neon Postgres + Telegram webhook
public/
  robots.txt
  sitemap.xml                 na razie: /, /konfigurator, /polityka
  vendingfresh_logo.png
  vendingfresh_icon.png
  vendingfresh_logo_white_bg.png
vite-plugins/
  html-include.ts              bez zmian z poprzedniej wersji repo
vercel.json                    rewrites dla czystych URL (bez redirectów) + cache headers
package.json / vite.config.ts / tsconfig.json / vitest.config.ts
```

**Routing bez przekierowań:** Vite multi-page build (`vite.config.ts` `rollupOptions.input`) produkuje `dist/konfigurator.html` z `dist/index.html`. `vercel.json` mapuje `/konfigurator` → `/konfigurator.html` przez **rewrite** (nie redirect) — adres w pasku przeglądarki zostaje czysty i Google indeksuje `/konfigurator` bezpośrednio, bez łańcucha przekierowań. Ten sam wzorzec obowiązuje wszystkie przyszłe podstrony (unika problemu z indeksacją, który wystąpił wcześniej na sklepzastodola.pl).

## Strona główna (`index.html`)

13 sekcji zgodnie z briefem klienta, w tej kolejności: pasek przewijany → hero (nadtytuł „Partner Sielaff”, H1 „Automat 24/7 zaprojektowany *pod Twój produkt.*”, CTA „Skonfiguruj automat →” / „Zobacz rozwiązania”, 7 kafelków produktów 🍞🥚🧀🥔🌱🥩🧃 → `/rozwiazania/*`) → problem/rozwiązanie (3 kolumny: sklep zamyka się o 18 / targ to cały dzień stania / pracownik za ladą kosztuje nawet gdy nikt nie przychodzi) → „Nie sprzedajemy automatów z półki” (6 warstw konfiguracji: produkt i opakowanie, temperatura, sposób wydawania, miejsce, płatności, wygląd; CTA do konfiguratora) → rozwiązania wg produktu (7 kafelków: dla kogo / co sprzedaje / na co uważać) → jak to działa (6 kroków klikanych: rozmowa i konfigurator → projekt i wycena indywidualna → finansowanie → dostawa i montaż → szkolenie i start → opieka po starcie) → kalkulator opłacalności → „Czy to ma sens u Ciebie?” (checklista 5 punktów + puenta) → automaty Sielaff skrót (4 rodziny: SiLine Snack & Combi, SiLine GF, Outdoor, SiLine Public + link „Zobacz wszystkie modele”) → dlaczego my (6 punktów z checkmarkami) → słowo od właściciela (cytat, placeholder tekstu i inicjałów do uzupełnienia) → poradnik (3 kafelki z tytułami artykułów z briefu, linki do `/poradnik/...`) → CTA końcowe → stopka.

Obrazy inne niż logo (automat, ikony produktów, zdjęcie właściciela) — placeholdery (`.placeholder` z opisem czego brakuje) do czasu dostarczenia materiałów przez klienta.

## Konfigurator (`konfigurator.html` + `src/konfigurator.ts`)

9 kroków (jeden ekran na krok, pasek postępu, Wstecz/Dalej):
1. Kim jesteś? (rolnik / piekarnia / serowarnia / sklep / gmina lub KGW / inwestor pod lokalizację / inne)
2. Co chcesz sprzedawać? (multi-select + pole tekstowe "inne")
3. Jak to jest zapakowane? (worek/wytłaczanka/słoik/butelka/pudełko/luzem) + orientacyjne wymiary i waga
4. Temperatura: chłodzenie / pokojowa / mieszane
5. Wolumen: ile dziennie/tygodniowo, ile różnych produktów
6. Lokalizacja: w budynku / pod wiatą / na zewnątrz przy drodze / miejsce publiczne + miasto/wieś
7. Płatności i dodatki: karta+BLIK, gotówka, oklejenie w barwach firmy, ekran z logo, telemetria
8. Finansowanie: gotówka / leasing / szukam dotacji / nie wiem
9. Kontakt: imię, telefon, email, miejscowość, zgoda RODO (wymagana do submitu)

Stan formularza w jednym obiekcie JS, walidacja przed przejściem do kolejnego kroku (krok 9 wymaga telefonu lub email + zgody RODO).

**Ekran wyniku** — reguła mapująca odpowiedzi na sugerowany kierunek, bez cen, np.: temperatura=chłodzenie + produkt sery/nabiał/mięso → „SiLine Combi/GF z chłodzeniem”; wydawanie delikatne (jajka) → dopisek „z windą”; miejsce=zewnątrz/przy drodze → „wersja outdoor”; płatności=karta+BLIK → „płatności bezgotówkowe”. Zawsze kończy się zdaniem: „Wycena jest zawsze indywidualna — przygotujemy ją pod Twój projekt w 24–48 h.”

**Zapis danych — Neon Postgres** (zamiast jsonbin.io, decyzja klienta): `/api/konfigurator.js` (Vercel Function) zapisuje rekord przez `@neondatabase/serverless`, zmienna środowiskowa `DATABASE_URL` (placeholder, do uzupełnienia w Vercel env). Schemat tabeli:

```sql
create table leads (
  id bigserial primary key,
  marka text not null,        -- 'vendingfresh' / 'sklepzastodola'
  typ text not null,          -- 'konfigurator' / 'kontakt'
  payload jsonb not null,     -- wszystkie pola formularza
  created_at timestamptz not null default now()
);
```
Do wyrównania ze schematem w repo sklepzastodola.pl, jeśli tam też jest/będzie Postgres. Samo podłączenie integracji Neon na Vercelu (utworzenie bazy, pobranie `DATABASE_URL`) odbywa się przez oficjalny flow Vercel Marketplace na etapie implementacji, nie ręcznym wklejaniem connection stringa.

Po zapisie do bazy handler wysyła wiadomość Telegram (ten sam bot co sklepzastodola.pl) z prefiksem `[VendingFresh]` na `TELEGRAM_WEBHOOK_ENDPOINT` (placeholder do podmiany).

GA4 event `konfigurator_wyslany` po udanym submicie (gtag stub, `G-REPLACE_ME` do podmiany).

Formularz kontaktowy na `/kontakt` (późniejszy etap) idzie przez Formspree — inny kanał niż konfigurator, zgodnie z briefem.

## Kalkulator opłacalności (sekcja na stronie głównej)

Suwaki: transakcje dziennie (1–200), średnia wartość koszyka (3–50 zł), marża na produkcie (5–70%), wartość inwestycji (5 000–150 000 zł), koszty miesięczne łącznie (100–3 000 zł).

Wzory:
```
przychód_miesięczny = transakcje_dziennie × wartość_koszyka × 30
zysk_miesięczny = przychód_miesięczny × (marża / 100) − koszty_miesięczne
zwrot_w_miesiącach = inwestycja / zysk_miesięczny   (jeśli zysk ≤ 0 → "—")
przychód_roczny = przychód_miesięczny × 12
```

4 presety (klikalne, wypełniają suwaki):

| Preset | transakcje/dz. | koszyk | marża | inwestycja | koszty/mies. |
|---|---|---|---|---|---|
| Piekarnia przy osiedlu | 40 | 12 zł | 35% | 35 000 zł | 400 zł |
| Ferma jaj przy drodze | 20 | 15 zł | 40% | 30 000 zł | 250 zł |
| Serowarnia rzemieślnicza | 15 | 25 zł | 45% | 40 000 zł | 350 zł |
| Sklep bio 24/7 | 60 | 20 zł | 30% | 60 000 zł | 700 zł |

Disclaimer pod wynikiem: „To szacunek orientacyjny, nie gwarancja wyniku — zależy od cen, kosztów i ruchu klientów.”

Logika kalkulatora jako czyste funkcje w `src/calculator.ts`, pokryte testem Vitest.

## SEO i tracking (ten etap)

- Każda strona: canonical tag, meta description, Open Graph + Twitter Card, favicon z `vendingfresh_icon.png`.
- JSON-LD `Organization` na stronie głównej (nazwa VendingFresh, marka Sklep za Stodołą Sp. z o.o., partner Sielaff, dane kontaktowe placeholder). `Product`/`FAQPage` JSON-LD dopisywane na podstronach, które faktycznie je mają, w kolejnych etapach.
- `sitemap.xml` — na razie 3 wpisy (`/`, `/konfigurator`, `/polityka`), rozrasta się z każdą kolejną podstroną; docelowe URL-e od razu, bez przekierowań.
- Frazy SEO wplecione naturalnie w treść: automat na jajka, jajomat, automat do chleba, automat na pieczywo, ziemniakomat, automat na sery, regiomat, automat vendingowy z żywnością, automat chłodniczy Sielaff, sklep samoobsługowy 24/7.
- GA4 (`G-REPLACE_ME` placeholder) + event `konfigurator_wyslany`.
- Meta Pixel ładowany dopiero po zgodzie w bannerze cookies (wzorem sklepzastodola.pl — pixel zablokowany do kliknięcia „Akceptuję”).

## Testy i weryfikacja

- Vitest: test `html-include` (bez zmian z poprzedniej wersji repo), nowy test dla `calculator.ts` (czyste funkcje) i walidacji kroków `konfigurator.ts`.
- Po implementacji: `npm run dev`, ręczne przejście całego konfiguratora krok po kroku w przeglądarce, sprawdzenie kalkulatora na wszystkich 4 presetach — przed zgłoszeniem zadania jako gotowego.

## Poza zakresem tego etapu

`/rozwiazania/*` (7 podstron), `/automaty-sielaff`, `/jak-dzialamy`, `/finansowanie`, `/poradnik` (lista + artykuły), `/faq`, `/kontakt`, sekcja „Realizacje” (celowo ukryta do pierwszych wdrożeń), rzeczywiste zdjęcia automatów/właściciela, docelowe dane kontaktowe, docelowe endpointy Neon/Telegram/GA4/Meta Pixel/Formspree.
