# VendingFresh — Brandbook (2026-08-05)

> Nowy kierunek wizualny marki, dostarczony przez użytkownika 2026-08-05. **Nie jest jeszcze
> wdrożony** — obecny kod (`src/style.css`, `index.html`) wciąż używa starszej palety ze
> spec `docs/superpowers/specs/2026-08-03-vendingfresh-landing-design.md` (zielony
> ciemny/złoto/kremowy, Montserrat). Ten dokument to materiał źródłowy do przyszłego
> osobnego projektu rebrandingu (spec + plan), nie do miksowania z bieżącym planem hero
> (`docs/superpowers/plans/2026-08-05-vendingfresh-hero-photo.md`).

## Paleta kolorów

**Kolor główny (Fresh Green)** — odpowiada za "Fresh".
- HEX: `#59B52C` | RGB: 89, 181, 44
- Zielony ciemniejszy (Hover): HEX `#479822` | RGB: 71, 152, 34

**Granat (główny kolor marki)** — kolor automatu oraz napisu "Vending".
- HEX: `#102235` | RGB: 16, 34, 53
- Granat jaśniejszy (ikony, hovery, gradienty): `#1B3550`

**Pozostałe:**
- Tło strony (nie czyste białe, lekko złamane): `#F8FAFB`
- Kolor kart: `#FFFFFF`
- Obramowania: `#E6EAEE`
- Jasny szary: `#F2F4F6`
- Tekst główny: `#1B2733`
- Tekst pomocniczy: `#687583`
- Gradient firmowy: `#59B52C → #83D33A` lub `#102235 → #1B3550`

## Kolor przycisków

**Primary Button** (poprawione — decyzja Kuby):
- Tło: `#59B52C`
- Tekst: `#102235` (był `#FFFFFF` — kontrast 6.2:1 zamiast 2.6:1, spełnia standardy czytelności)
- Hover: tło `#102235`, tekst `#FFFFFF`

**Secondary Button:**
- Tło: `#FFFFFF`, Border: `#102235`, Tekst: `#102235`
- Hover: tło `#102235`, tekst `#FFFFFF`

## Akcenty
Sukces `#38A169` · Ostrzeżenie `#F6AD55` · Błąd `#E53E3E` · Informacja `#3182CE`

## Typografia
🥇 **Manrope** (rekomendacja) · alternatywy: Plus Jakarta Sans, DM Sans, Inter
Nagłówki 700 · Tekst 400 · Przyciski 600

## Styl ikon
Outline, zaokrąglone rogi, grubość 2px, bez cieni, minimalistyczne — np. Lucide Icons albo Heroicons.

## Zaokrąglenia
Przyciski 12px · Karty 20px · Inputy 12px · Zdjęcia 20–24px

## Cienie
Delikatne: `0 8px 30px rgba(16,34,53,.08)` · Hover: `0 12px 40px rgba(16,34,53,.12)`

## Styl zdjęć
Jasne, dużo bieli, naturalne światło, świeże produkty, nowoczesne automaty, biura, siłownie,
szkoły, firmy, dużo zieleni.

## Styl całej strony
Hasła przewodnie: nowocześnie, premium, czysto, ekologicznie, profesjonalnie, bez zbędnych
ozdobników, dużo białej przestrzeni, duże zdjęcia, zielone akcenty, delikatne animacje.

## CSS Variables (dostarczone)

```css
:root{
  --primary:#59B52C;
  --primary-dark:#479822;

  --secondary:#102235;
  --secondary-light:#1B3550;

  --background:#F8FAFB;
  --surface:#FFFFFF;

  --border:#E6EAEE;

  --text:#1B2733;
  --text-light:#687583;

  --success:#38A169;
  --warning:#F6AD55;
  --danger:#E53E3E;
  --info:#3182CE;

  --radius-sm:12px;
  --radius-md:20px;
  --radius-lg:28px;

  --shadow:0 8px 30px rgba(16,34,53,.08);
}
```

## Kierunek wizualny
Coś pomiędzy Apple, Stripe i Notion, ale z zielonym charakterem nawiązującym do świeżych
produktów. Duże, czytelne nagłówki, dużo światła, proste sekcje i wyraźne przyciski. Marka
może wyglądać jak firma znacznie większa niż lokalny operator vendingowy.

## Decyzja dot. kolejności prac (2026-08-05)
Dokończamy najpierw plan hero photo na obecnej (starej) palecie — to zmiana czysto
techniczna (canvas cutout + tilt), niezależna od kolorów. Rebranding wg tego brandbooka
robimy jako osobny projekt zaraz po zmergowaniu hero (nowy spec przez
`superpowers:brainstorming`, potem plan), obejmujący całe `style.css` i `index.html`
jednym przejściem — nie łatamy koloru po kolorze przy okazji innych zadań.
