# VendingFresh — Brandbook (2026-08-05)

> Nowy kierunek wizualny marki, dostarczony przez użytkownika 2026-08-05. **Wdrożony
> na stronie głównej 2026-08-05** — zobacz
> `docs/superpowers/specs/2026-08-05-vendingfresh-rebrand-home-design.md` i
> `docs/superpowers/plans/2026-08-05-vendingfresh-rebrand-home.md`. Kolejne etapy
> (architektura wielostronicowa, podstrony oferty, realizacje, o nas, blog, lokalne SEO)
> mają własne, osobne specy.

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

## Decyzja dot. kolejności prac (2026-08-05, zamknięte 2026-08-06)
Hero photo (canvas cutout + tilt) zostało zmergowane, a następnie zastąpione statycznym
zdjęciem w ramach rebrandingu (mechanizm 3D/cutout został usunięty), jednym przejściem przez
całe `style.css` i `index.html`, zgodnie z powyższym planem. Etap 1
(rebrand + Home) jest zamknięty. Kolejne etapy — architektura wielostronicowa, podstrony
oferty, realizacje, o nas, blog, lokalne SEO — to osobne projekty z własnym
spec+planem, uruchamiane przez `superpowers:brainstorming` gdy przyjdzie ich kolej.

**Status na 2026-08-06: wszystkie etapy zaimplementowane.**
- Architektura wielostronicowa — gotowe (`docs/superpowers/specs/2026-08-06-vendingfresh-multipage-architecture-design.md`): wspólny nav/footer przez plugin `html-include`, konwencja `/#kotwica` i `/plik.html`.
- Podstrony oferty — gotowe (`docs/superpowers/specs/2026-08-06-vendingfresh-oferta-subpages-design.md`): 6 stron `oferta-*.html`.
- O nas — gotowe (`docs/superpowers/specs/2026-08-06-vendingfresh-o-nas-realizacje-design.md`): `o-nas.html` z realną treścią. **Realizacje wycofane 2026-08-06** — decyzja klienta: nie ma case studies i nie będzie ich fabrykować, strona `realizacje.html` i wszystkie jej wpięcia w nav/footer/`vite.config.ts` usunięte (nie zostaje jako "wkrótce").
- Blog / lokalne SEO — gotowe (`docs/superpowers/specs/2026-08-06-vendingfresh-blog-lokalne-seo-design.md`): `blog.html` jako placeholder, `robots.txt`/`sitemap.xml`, meta/canonical/noindex na stronach, podświetlanie aktywnej strony w nav. **Lokalne SEO domknięte 2026-08-06**: prawdziwy adres potwierdzony przez klienta (ten sam co „Sklep za Stodołą" — zweryfikowany po zgodnym numerze telefonu +48 690 000 923) — `ul. Warszawska 40-2A, 40-008 Katowice`, dodany do stopki i jako JSON-LD `LocalBusiness` na Home. Domena `https://vendingfresh.pl` potwierdzona przez klienta.

**Otwarte pozycje wymagające danych od klienta (nie do zmyślenia przez Claude'a):**
- Realne treści `polityka.html`/`rodo.html` (obecnie "w przygotowaniu", a strona już zbiera kontakt — realne pod RODO).
