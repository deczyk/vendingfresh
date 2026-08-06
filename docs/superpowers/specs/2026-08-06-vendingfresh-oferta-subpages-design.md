# VendingFresh — Oferta Subpages (Design Spec)

Date: 2026-08-06
Status: Approved by user, ready for implementation planning.

## Context

Etap 1 (rebrand + Home v2) and the multi-page architecture foundation
(`docs/superpowers/specs/2026-08-06-vendingfresh-multipage-architecture-design.md`)
are both complete and merged to `main`. The foundation gives every future
page a shared `nav`/`footer` (via `partials/nav.html`/`partials/footer.html`
and the `html-include` Vite plugin), a shared TS bootstrap
(`initSharedPage()`), and an established recipe for adding a flat `.html`
page registered in `vite.config.ts`.

Today, nav's "Oferta" dropdown has 6 items, all pointing to `/#oferta` on
Home. Home's `oferta` section has a 6-card grid, each card linking to
`#kontakt`. This project replaces both with 6 real dedicated subpages —
the first production use of the multi-page foundation.

## Goal

Give each of the 6 offer categories its own page with real (if general)
marketing content, wire nav's dropdown and Home's offer cards to link to
them, and validate the "add a new page" recipe from the architecture spec
end to end.

## 1. Scope — page list

All 6 categories get a subpage (not just the 4 with product photos) —
confirmed by the user: nav consistency matters more than photo
availability, and premium/dzierżawa get descriptive content instead of a
product photo.

Flat `.html` files, kebab-case, `oferta-` prefix (consistent with the
existing `polityka.html`/`rodo.html` convention):

| File | Category | Image |
|---|---|---|
| `oferta-chlodnicze.html` | Automaty chłodnicze | `/vendingfresh_machine.webp` |
| `oferta-przekaskowe.html` | Automaty przekąskowe | `/offer-przekaskowe.png` |
| `oferta-napoje.html` | Automaty z napojami | `/offer-napoje-fk.png` |
| `oferta-kawa.html` | Automaty kawowe | `/offer-kawa-siamonie-series.png` |
| `oferta-premium.html` | Automaty premium | none — reuses the existing SVG icon from Home's offer-card |
| `oferta-dzierzawa.html` | Dzierżawa automatów | none — reuses the existing SVG icon from Home's offer-card |

Where a category has more than one product photo available in `public/`
(napoje: 2, kawa: 3), the subpage uses only the same single photo Home's
card already shows today — confirmed by the user, to avoid introducing an
un-designed gallery layout for a decision that can wait.

## 2. Shared page structure

Every subpage: `nav` (include) → **offer hero** → **benefits section** →
**CTA** → `footer` (include).

- **Offer hero** (`.offer-hero`, one new CSS component in `src/style.css`,
  shared by all 6 pages): eyebrow "Oferta", `<h1>` with the category name,
  a 2-3 sentence marketing description, a `btn btn--primary` linking to
  `#kontakt` (same-page anchor — the CTA section further down). Photo on
  the opposite side for the 4 photographed categories; for premium/
  dzierżawa, the same SVG icon block style already used on their Home
  offer-cards, instead of a photo. Visually echoes Home's hero
  (text + image composition) but smaller and single-column on mobile.
- **Benefits section**: 3 short cards (icon + heading + one sentence),
  reusing the visual pattern of Home's "Dlaczego VendingFresh" why-cards
  and their existing icon set. Content is general marketing copy
  consistent with the brandbook's tone — no invented technical specs,
  capacities, or prices.
- **CTA**: the exact same `cta` section markup already at the bottom of
  Home (heading + `mailto:` button + contact details) — copied as-is, so
  every subpage ends with an identical call to action.

## 3. Content — final copy per page

No fabricated technical data (capacity, dimensions, model numbers,
pricing) — confirmed by the user. Copy below extends the existing short
Home card descriptions into fuller marketing text, consistent with the
brandbook's established voice (already used across Home, FAQ, and the
brand direction doc).

### Automaty chłodnicze
- Eyebrow: `Oferta`
- H1: `Automaty chłodnicze`
- Description: „Świeże produkty od lokalnych producentów — jaja, nabiał,
  miód, przetwory — dostępne 24 godziny na dobę, bez obsługi i bez
  kolejki. Precyzyjne chłodzenie utrzymuje optymalną temperaturę przez
  cały czas, a zdalny monitoring pozwala nam reagować, zanim cokolwiek
  pójdzie nie tak."
- Benefits:
  1. „Świeżość bez kompromisów" — Stała temperatura i kontrola jakości na
     każdym etapie.
  2. „Lokalni producenci" — Wspieramy regionalnych dostawców i naturalne
     produkty.
  3. „Zero obsługi" — Klienci kupują samodzielnie, 24 godziny na dobę.

### Automaty przekąskowe
- Eyebrow: `Oferta`
- H1: `Automaty przekąskowe`
- Description: „Chipsy, batony i przekąski w zasięgu ręki — w biurze,
  szkole czy zakładzie pracy. Szeroki wybór produktów dopasowany do
  miejsca i grupy odbiorców, uzupełniany regularnie, żeby półki nigdy nie
  świeciły pustkami."
- Benefits:
  1. „Szeroki asortyment" — Przekąski słodkie i słone, dopasowane do
     lokalizacji.
  2. „Zawsze zapełnione" — Regularne uzupełnianie na podstawie zdalnego
     monitoringu.
  3. „Płatność bez gotówki" — Karta, telefon lub BLIK — szybko i
     wygodnie.

### Automaty z napojami
- Eyebrow: `Oferta`
- H1: `Automaty z napojami`
- Description: „Zimne napoje, woda i soki — schłodzone i gotowe do
  wydania w każdej chwili. Idealne rozwiązanie dla biur, siłowni i miejsc
  o dużym natężeniu ruchu, gdzie liczy się szybki dostęp do orzeźwienia."
- Benefits:
  1. „Zawsze schłodzone" — Precyzyjna kontrola temperatury niezależnie od
     pory roku.
  2. „Szeroki wybór napojów" — Woda, soki, napoje gazowane i energetyczne.
  3. „Duża pojemność" — Rzadsze uzupełnianie nawet przy intensywnym
     ruchu.

### Automaty kawowe
- Eyebrow: `Oferta`
- H1: `Automaty kawowe`
- Description: „Świeżo parzona kawa i gorące napoje — jakość kawiarni bez
  baristy. Automaty kawowe VendingFresh parzą kawę na bazie świeżych
  ziaren, oferując espresso, cappuccino i inne klasyki na wyciągnięcie
  ręki."
- Benefits:
  1. „Świeżo parzona kawa" — Ziarnista kawa mielona na bieżąco, nie
     rozpuszczalna.
  2. „Szeroki wybór napojów" — Espresso, cappuccino, latte i herbata w
     jednym urządzeniu.
  3. „Idealne do biura" — Podnosi komfort pracy bez budowania firmowej
     kawiarni.

### Automaty premium
- Eyebrow: `Oferta`
- H1: `Automaty premium`
- Description: „Rozbudowane konfiguracje dla lokalizacji o dużym
  natężeniu ruchu — większa pojemność, szerszy asortyment i zaawansowane
  technologie płatności i monitoringu w jednym urządzeniu. Dobieramy
  konfigurację indywidualnie do Twojej lokalizacji."
- Benefits:
  1. „Zwiększona pojemność" — Więcej produktów, rzadsze wizyty
     serwisowe.
  2. „Zaawansowany monitoring" — Pełny wgląd w stan i sprzedaż automatu
     24/7.
  3. „Konfiguracja pod lokalizację" — Dobór asortymentu dopasowany do
     miejsca i klientów.

### Dzierżawa automatów
- Eyebrow: `Oferta`
- H1: `Dzierżawa automatów`
- Description: „Zero inwestycji początkowej — automat, montaż i serwis w
  jednym abonamencie. Dzierżawa to sposób na wprowadzenie automatu do
  swojej firmy bez jednorazowego wydatku na zakup urządzenia."
- Benefits:
  1. „Brak inwestycji początkowej" — Płacisz stały abonament zamiast
     jednorazowego zakupu.
  2. „Pełny serwis w cenie" — Montaż, konserwacja i uzupełnianie po
     naszej stronie.
  3. „Elastyczne warunki" — Dopasowujemy model dzierżawy do potrzeb
     Twojej firmy.

Benefit icons reuse the existing outline SVG icon set already defined
inline in `index.html` (Home's why-cards and offer-cards) — the
implementation plan assigns specific existing icons per benefit rather
than designing 18 new ones from scratch (DRY, consistent visual
language).

## 4. Navigation, footer, and Home wiring

- **`partials/nav.html`**: the 6 dropdown `<li><a href="/#oferta">...</a></li>`
  entries are updated to point at their respective subpage
  (`/oferta-chlodnicze.html`, etc.) instead of the shared `/#oferta`
  anchor. Because nav is a shared partial, this one edit updates the
  dropdown identically on every page (Home included).
- **Footer's "Menu" column**: unchanged — its single "Oferta" entry keeps
  linking to `/#oferta` (Home's overview section), not to a specific
  subpage. Keeps the footer short; the overview section is the natural
  hub linking out to all 6 (see below).
- **`index.html`'s `oferta` section**: stays as today's 6-card grid
  (unchanged copy/images), but each card's `href="#kontakt"` becomes the
  matching subpage URL (`href="/oferta-chlodnicze.html"`, etc.) — Home
  becomes the entry point, subpages the deeper content, confirmed by the
  user.

## 5. Build registration

Each of the 6 new `.html` files is added to `vite.config.ts`'s
`build.rollupOptions.input`, following the existing recipe from the
architecture spec (manual registration, no globbing).

## Testing and verification

Same pattern as the architecture-foundation plan: `npm run build`
succeeds with all 9 HTML entries present (`index`, `polityka`, `rodo`,
6× `oferta-*`) and zero leftover `include:` markers; `npm run dev` +
manual spot-check confirms each subpage renders its hero/benefits/CTA
correctly, the nav dropdown links to the right subpage from every page,
and Home's offer-grid cards link to the right subpage. No new automated
tests are needed — this task is markup/content, not logic (mirrors how
Task 2 and Task 4 of the architecture-foundation plan were verified).

## Poza zakresem (świadomie)

- Zdjęcia-galerie dla kategorii z wieloma dostępnymi fotografiami (napoje,
  kawa) — jedno zdjęcie na razie, jak dziś na Home.
- Twarde dane techniczne (pojemność, wymiary, modele, ceny) — do
  uzupełnienia przez użytkownika w przyszłości, nie wymyślane teraz.
- Podświetlanie aktywnej strony w nav — nadal odłożone (jak w spec
  fundamentu), teraz naturalnie mogłoby wrócić skoro istnieją realne
  podstrony, ale to osobna decyzja niepowiązana z tym zakresem.
- Zmiana mechanizmu partiali (wariant B z {{zmiennymi}}) — odrzucona na
  rzecz zwykłych płaskich plików `.html`.

## Self-review

- **Placeholder scan:** no TBD/TODO; all 6 pages have final copy written
  above, not placeholder text.
- **Internal consistency:** section 4's wiring changes (nav, footer,
  Home cards) are consistent with each other and with the architecture
  spec's established `/path.html` convention.
- **Scope:** single cohesive subsystem (6 content pages + their wiring),
  ready for one implementation plan.
- **Ambiguity check:** icon reuse for benefit cards is deliberately left
  to the plan (which icons, from which existing markup) rather than
  specified here — a mechanical decision, not a design one.
