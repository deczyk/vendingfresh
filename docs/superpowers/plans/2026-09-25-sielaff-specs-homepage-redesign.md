# Specyfikacje Sielaff + redesign homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace one-line, image-free Sielaff model descriptions with real specifications and photos, and visually de-densify the homepage by swapping text-only card grids for a photo carousel and alternating image+text sections.

**Architecture:** This is a static multi-page Vite site (see `vite.config.ts`) — every page is a hand-written `.html` file, partials only cover nav/footer/cookie-banner (`vite-plugins/html-include`). There is no data-driven HTML rendering layer, so specifications and image references are written directly into each page's markup (not a shared `.ts`/`.json` data file — that would be unread dead code in this architecture). New interactive behavior (the carousel) follows the existing pattern in `src/calculator.ts` / `src/main.ts`: a small TypeScript module with pure, unit-tested logic functions plus a DOM-wiring function guarded by `typeof document !== 'undefined'` so it's safely importable under Vitest's `node` test environment (see `vitest.config.ts`).

**Tech Stack:** Vite 5, TypeScript 5, Vitest 2, plain CSS (`src/style.css`, no framework), no build-time templating.

## Global Constraints

- Every spec value written into HTML must be a real, sourced value (see `docs/superpowers/specs/2026-09-25-sielaff-specs-homepage-redesign-design.md`, section "Zebrane specyfikacje") — never invent a number.
- Follow the existing static-HTML-per-page convention. Do not introduce a templating engine, a data file, or client-side rendering of content that's meant to be crawlable — write it into the HTML.
- All new images live under `public/` (Vite's `publicDir`) and are referenced with root-relative paths (`/sielaff/...`, `/kategorie/...`), matching how `public/vendingfresh_icon.png` etc. are referenced today.
- New TS modules follow `src/calculator.ts`'s pattern: pure functions exported and unit-tested with Vitest; DOM wiring wrapped in `if (typeof document !== 'undefined') { document.addEventListener('DOMContentLoaded', initX); }`.
- Polish language for all user-facing copy, matching the rest of the site.

---

## Task 1: Download and commit Sielaff + category image assets

**Files:**
- Create: `public/sielaff/siline-snack-combi/product.png`
- Create: `public/sielaff/sn48/product.png`
- Create: `public/sielaff/siline-gf/product.png`
- Create: `public/sielaff/robimat-x/product.png`
- Create: `public/sielaff/fk-series/product.png`
- Create: `public/sielaff/siamonie/product.png`
- Create: `public/sielaff/siline-hg/product.png`
- Create: `public/sielaff/outdoor/lifestyle.jpg`
- Create: `public/sielaff/siline-public/product.png`
- Create: `public/sielaff/sione/product.png`
- Create: `public/kategorie/pieczywo.jpg`
- Create: `public/kategorie/jajka.jpg`
- Create: `public/kategorie/sery.jpg`
- Create: `public/kategorie/ziemniaki-warzywa.jpg`
- Create: `public/kategorie/napoje.jpg`
- Create: `public/kategorie/bio-lokalne.jpg`
- Create: `public/kategorie/mieso-dania.jpg`

**Interfaces:**
- Produces: 17 static image files under `public/`, referenced by root-relative path (`/sielaff/<slug>/<file>`, `/kategorie/<slug>.jpg`) from every later task's HTML.

- [ ] **Step 1: Create the target directories**

```bash
mkdir -p public/sielaff/siline-snack-combi public/sielaff/sn48 public/sielaff/siline-gf public/sielaff/robimat-x public/sielaff/fk-series public/sielaff/siamonie public/sielaff/siline-hg public/sielaff/outdoor public/sielaff/siline-public public/sielaff/sione public/kategorie
```

- [ ] **Step 2: Download the 10 Sielaff product/lifestyle photos**

Run from the repo root (each URL was verified to return HTTP 200 during planning):

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

curl -sL -A "$UA" "https://sielaff.de/fileadmin/Produkte/Vending/Combi-_Spiralautomaten/Combiautomaten/SiLine_Combi/Produktbild_neben_Text_SiLine_Snack_und_Combi.png" -o public/sielaff/siline-snack-combi/product.png
curl -sL -A "$UA" "https://sielaff.de/fileadmin/Produkte/Vending/Combi-_Spiralautomaten/Spiralautomaten/SN48/Produktbild_neben_Text_SN48.png" -o public/sielaff/sn48/product.png
curl -sL -A "$UA" "https://sielaff.de/fileadmin/Produkte/Vending/Kaltgetraenkeautomaten/SiLine_GF/Produktbild_neben_Text_SiLine_GF.png" -o public/sielaff/siline-gf/product.png
curl -sL -A "$UA" "https://sielaff.de/fileadmin/Produkte/Vending/Kaltgetraenkeautomaten/Robimat_X-Serie/Produktbild_neben_Text_Robimat_X-Serie.png" -o public/sielaff/robimat-x/product.png
curl -sL -A "$UA" "https://sielaff.de/fileadmin/Produkte/Vending/Kaltgetraenkeautomaten/FK-Serie/Produktbild_neben_Text_FK-Serie.png" -o public/sielaff/fk-series/product.png
curl -sL -A "$UA" "https://sielaff.de/fileadmin/_processed_/8/1/csm_Produktbild_neben_Text_Siamonie-Serie_7a4a72620e.png" -o public/sielaff/siamonie/product.png
curl -sL -A "$UA" "https://sielaff.de/fileadmin/Produkte/Vending/Heissgetraenkeautomaten/SiLine_HG_TS/Produktbild_neben_Text_SiLine_HG_TS27.png" -o public/sielaff/siline-hg/product.png
curl -sL -A "$UA" "https://sielaff.de/fileadmin/Header/7_Outdoor-Serie/Header_SiLine_Outdoor-Serie.jpg" -o public/sielaff/outdoor/lifestyle.jpg
curl -sL -A "$UA" "https://sielaff.de/fileadmin/Produkte/Vending/SiLine_Public-Serie/Produktbild_neben_Text_SiLine_Public-Serie.png" -o public/sielaff/siline-public/product.png
curl -sL -A "$UA" "https://sielaff.de/fileadmin/Produkte/Vending/SiOne-Serie/Produktbild_neben_Text_SiOne-Serie.png" -o public/sielaff/sione/product.png
```

- [ ] **Step 3: Download the 7 category photos (Unsplash, free commercial license, no attribution required)**

```bash
curl -sL "https://images.unsplash.com/photo-1780644804493-6ac6238e7ecf?fm=jpg&q=80&w=1200&auto=format&fit=crop" -o public/kategorie/pieczywo.jpg
curl -sL "https://images.unsplash.com/photo-1660224286794-fc173fa9295c?fm=jpg&q=80&w=1200&auto=format&fit=crop" -o public/kategorie/jajka.jpg
curl -sL "https://images.unsplash.com/photo-1592790064984-b715a1040f35?fm=jpg&q=80&w=1200&auto=format&fit=crop" -o public/kategorie/sery.jpg
curl -sL "https://images.unsplash.com/photo-1561635741-c416a5193b6e?fm=jpg&q=80&w=1200&auto=format&fit=crop" -o public/kategorie/ziemniaki-warzywa.jpg
curl -sL "https://images.unsplash.com/photo-1654420952861-306c4dffa337?fm=jpg&q=80&w=1200&auto=format&fit=crop" -o public/kategorie/napoje.jpg
curl -sL "https://images.unsplash.com/photo-1715603803444-d22ea0939876?fm=jpg&q=80&w=1200&auto=format&fit=crop" -o public/kategorie/bio-lokalne.jpg
curl -sL "https://images.unsplash.com/photo-1768758922235-744d7342683a?fm=jpg&q=80&w=1200&auto=format&fit=crop" -o public/kategorie/mieso-dania.jpg
```

- [ ] **Step 4: Verify every file downloaded and is a real image (non-empty, correct type)**

```bash
find public/sielaff public/kategorie -type f -exec ls -la {} \;
file public/sielaff/*/*.* public/kategorie/*.jpg
```

Expected: 17 files, each with a non-zero size and a `file` output of `PNG image data` or `JPEG image data` (no `HTML document` / `ASCII text` — that would mean a download failed and saved an error page instead).

- [ ] **Step 5: Commit**

```bash
git add public/sielaff public/kategorie
git commit -m "$(cat <<'EOF'
assets: add Sielaff product photos and category photos

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add new CSS components (model card, spec table, split section, carousel)

**Files:**
- Modify: `src/style.css` (append at end of file)

**Interfaces:**
- Produces: CSS classes `.model-card`, `.model-card--photo`, `.model-card--compact`, `.model-card__img`, `.model-card__body`, `.model-card__link`, `.spec-table`, `.spec-table__row`, `.split-section`, `.split-section--reverse`, `.split-section__body`, `.split-section__media`, `.split-section__media--contain`, `.carousel`, `.carousel__track`, `.carousel__item`, `.carousel__item--active`, `.carousel__item--side`, `.carousel__item--far`, `.carousel__item--hidden`, `.carousel__item--brand`, `.carousel__caption`, `.carousel__dots`, `.carousel__dot`, `.carousel__dot--active` — consumed by Task 3 (carousel JS toggles these classes) and Tasks 5–8 (HTML uses these classes directly).

- [ ] **Step 1: Append the new component styles to `src/style.css`**

```css

/* Model card with photo + spec table */
.model-card {
  background: #FFFDF8;
  border: 1px solid #E5DFD2;
  border-radius: var(--radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.model-card--photo .model-card__img {
  width: 100%;
  height: 220px;
  object-fit: contain;
  background: #F1EDE3;
  padding: 16px;
}
.model-card__body { padding: 20px; }
.model-card__body h3 { color: var(--color-primary); font-size: 18px; }
.model-card__link { display: inline-block; margin-top: 16px; font-weight: 600; color: var(--color-primary); }
.model-card--compact { max-width: 420px; }
.model-card--compact .model-card__img { height: 180px; }

.spec-table { margin: 16px 0 0; padding: 0; }
.spec-table__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #EFEAE0;
  font-size: 14px;
}
.spec-table__row:last-child { border-bottom: none; }
.spec-table__row dt { font-weight: 600; color: var(--color-secondary); margin: 0; flex-shrink: 0; }
.spec-table__row dd { margin: 0; text-align: right; }

/* Split section: image + text 50/50 */
.split-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; margin: 32px 0; }
.split-section--reverse .split-section__media { order: 2; }
.split-section__media { border-radius: var(--radius); overflow: hidden; }
.split-section__media img { width: 100%; height: 100%; object-fit: cover; max-height: 420px; }
.split-section__media--contain { background: #F1EDE3; display: flex; align-items: center; justify-content: center; padding: 24px; }
.split-section__media--contain img { object-fit: contain; max-height: 380px; }
.split-section__body h2 { margin-bottom: 16px; }
@media (max-width: 760px) {
  .split-section { grid-template-columns: 1fr; }
  .split-section--reverse .split-section__media { order: 0; }
}

/* Carousel (flat-peek variant) */
.carousel { position: relative; overflow: hidden; padding: 24px 0 8px; }
.carousel__track { display: flex; align-items: center; justify-content: center; gap: 16px; }
.carousel__item {
  flex-shrink: 0;
  width: 340px;
  height: 420px;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  transition: width 0.3s ease, height 0.3s ease, filter 0.3s ease, opacity 0.3s ease;
  display: block;
}
.carousel__item img { width: 100%; height: 100%; object-fit: cover; display: block; }
.carousel__item--side { width: 220px; height: 340px; filter: brightness(0.75) saturate(0.85); }
.carousel__item--far { width: 100px; height: 260px; filter: brightness(0.5); opacity: 0.5; }
.carousel__item--hidden { display: none; }
.carousel__caption {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: 18px 16px 14px;
  background: linear-gradient(to top, rgba(14,92,92,0.92), rgba(14,92,92,0));
  color: #fff; opacity: 0; transition: opacity 0.3s;
}
.carousel__item--active .carousel__caption { opacity: 1; }
.carousel__caption h3 { margin: 0 0 4px; font-size: 18px; color: #fff; }
.carousel__caption p { margin: 0; font-size: 13px; opacity: 0.9; }
.carousel__item--brand { background: var(--color-primary); display: flex; align-items: center; justify-content: center; }
.carousel__item--brand .carousel__caption { opacity: 1; position: static; background: none; padding: 24px; text-align: center; }
.carousel__dots { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
.carousel__dot { width: 8px; height: 8px; border-radius: 50%; background: #DCD5C5; cursor: pointer; border: none; padding: 0; }
.carousel__dot--active { background: var(--color-primary); width: 22px; border-radius: 4px; }
@media (max-width: 760px) {
  .carousel__item { width: 260px; height: 340px; }
  .carousel__item--side { width: 140px; height: 260px; }
  .carousel__item--far { display: none; }
}
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npm run build`
Expected: build succeeds with no errors (CSS-only change, but confirms nothing else broke).

- [ ] **Step 3: Commit**

```bash
git add src/style.css
git commit -m "$(cat <<'EOF'
style: add model card, spec table, split section and carousel components

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Build the carousel module (pure logic, tested) + DOM wiring

**Files:**
- Create: `src/carousel.ts`
- Create: `src/carousel.test.ts`

**Interfaces:**
- Consumes: CSS classes from Task 2 (`.carousel`, `.carousel__track`, `.carousel__item`, `.carousel__dots`, and the `--active`/`--side`/`--far`/`--hidden` modifiers).
- Produces: `export function circularOffset(index: number, active: number, total: number): number` and `export function classifyOffset(offset: number): 'active' | 'side' | 'far' | 'hidden'`, consumed by Task 7's `<script type="module" src="/src/carousel.ts"></script>` tag on `index.html` (via the auto-running `initCarousel` DOMContentLoaded listener — no other task calls these functions directly except the test file).

- [ ] **Step 1: Write the failing tests**

Create `src/carousel.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { circularOffset, classifyOffset } from './carousel';

describe('circularOffset', () => {
  it('returns 0 for the active index itself', () => {
    expect(circularOffset(3, 3, 8)).toBe(0);
  });

  it('returns positive offsets for items ahead of active', () => {
    expect(circularOffset(1, 0, 8)).toBe(1);
    expect(circularOffset(2, 0, 8)).toBe(2);
  });

  it('returns negative offsets for items behind active', () => {
    expect(circularOffset(7, 0, 8)).toBe(-1);
    expect(circularOffset(6, 0, 8)).toBe(-2);
  });

  it('wraps around the far side of the list', () => {
    expect(circularOffset(0, 7, 8)).toBe(1);
    expect(circularOffset(4, 7, 8)).toBe(-3);
  });
});

describe('classifyOffset', () => {
  it('classifies 0 as active', () => {
    expect(classifyOffset(0)).toBe('active');
  });

  it('classifies +/-1 as side', () => {
    expect(classifyOffset(1)).toBe('side');
    expect(classifyOffset(-1)).toBe('side');
  });

  it('classifies +/-2 as far', () => {
    expect(classifyOffset(2)).toBe('far');
    expect(classifyOffset(-2)).toBe('far');
  });

  it('classifies anything beyond +/-2 as hidden', () => {
    expect(classifyOffset(3)).toBe('hidden');
    expect(classifyOffset(-4)).toBe('hidden');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/carousel.test.ts`
Expected: FAIL — `src/carousel.ts` does not exist yet (`Cannot find module './carousel'`).

- [ ] **Step 3: Implement `src/carousel.ts`**

```typescript
export function circularOffset(index: number, active: number, total: number): number {
  let diff = (index - active) % total;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

export function classifyOffset(offset: number): 'active' | 'side' | 'far' | 'hidden' {
  const abs = Math.abs(offset);
  if (abs === 0) return 'active';
  if (abs === 1) return 'side';
  if (abs === 2) return 'far';
  return 'hidden';
}

function initCarousel(): void {
  const root = document.querySelector<HTMLElement>('.carousel');
  if (!root) return;
  const track = root.querySelector<HTMLElement>('.carousel__track');
  const dotsContainer = root.querySelector<HTMLElement>('.carousel__dots');
  if (!track || !dotsContainer) return;

  const items = Array.from(track.querySelectorAll<HTMLElement>('.carousel__item'));
  const total = items.length;
  if (total === 0) return;
  let active = 0;

  const dots = items.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', `Pokaż pozycję ${i + 1}`);
    dot.addEventListener('click', () => {
      active = i;
      render();
    });
    dotsContainer.appendChild(dot);
    return dot;
  });

  function render(): void {
    items.forEach((item, i) => {
      const offset = circularOffset(i, active, total);
      const state = classifyOffset(offset);
      item.classList.remove(
        'carousel__item--active',
        'carousel__item--side',
        'carousel__item--far',
        'carousel__item--hidden',
      );
      item.classList.add(`carousel__item--${state}`);
      item.style.order = String(offset);
    });
    dots.forEach((dot, i) => dot.classList.toggle('carousel__dot--active', i === active));
  }

  items.forEach((item, i) => {
    item.addEventListener('click', (e) => {
      if (i !== active) {
        e.preventDefault();
        active = i;
        render();
      }
    });
  });

  root.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      active = (active - 1 + total) % total;
      render();
    }
    if (e.key === 'ArrowRight') {
      active = (active + 1) % total;
      render();
    }
  });

  render();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCarousel);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/carousel.test.ts`
Expected: PASS — all 8 test cases green.

- [ ] **Step 5: Run the full test suite to confirm nothing else broke**

Run: `npm test`
Expected: PASS — all existing suites (`calculator.test.ts`, `cookies.test.ts`, `konfigurator.test.ts`) plus the new `carousel.test.ts` pass.

- [ ] **Step 6: Commit**

```bash
git add src/carousel.ts src/carousel.test.ts
git commit -m "$(cat <<'EOF'
feat: add carousel module with tested circular-window logic

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Rewrite `automaty-sielaff.html` with real specs and photos

**Files:**
- Modify: `automaty-sielaff.html:36-114` (the four `<section class="section">` blocks covering "Świeże produkty", "Napoje i ekspozycja", "Na zewnątrz i miejsca publiczne", "Dodatki")

**Interfaces:**
- Consumes: `.model-card`, `.model-card--photo`, `.model-card__img`, `.model-card__body`, `.spec-table`, `.spec-table__row` CSS from Task 2; image paths from Task 1 (`/sielaff/<slug>/product.png` or `/sielaff/<slug>/lifestyle.jpg`).
- Produces: anchor ids `siline-snack-combi`, `sn48`, `siline-gf`, `robimat-x`, `fk-series`, `outdoor`, `siline-public`, `siamonie`, `siline-hg`, `sione` on each `.model-card`, consumed by Task 5's "Zobacz pełną specyfikację" links (`/automaty-sielaff#<id>`).

- [ ] **Step 1: Replace the four `cards-grid` sections**

In `automaty-sielaff.html`, replace lines 36–114 (from `<section class="section">` right after the hero, through the closing `</section>` of the "Dodatki" section) with:

```html
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Świeże produkty</p>
        <h2>Pieczywo, jajka, sery <em>i inne produkty świeże.</em></h2>
        <div class="cards-grid">
          <div class="model-card model-card--photo" id="siline-snack-combi">
            <img class="model-card__img" src="/sielaff/siline-snack-combi/product.png" alt="Automat Sielaff SiLine Snack & Combi" loading="lazy">
            <div class="model-card__body">
              <h3>SiLine Snack & Combi</h3>
              <p>Elastyczna konfiguracja wnętrza — dwie strefy temperatur w jednej maszynie, z przesuwalną granicą między nimi. Podstawowy wybór dla większości produktów świeżych.</p>
              <dl class="spec-table">
                <div class="spec-table__row"><dt>Szerokość</dt><dd>780 lub 990 mm</dd></div>
                <div class="spec-table__row"><dt>Strefy temperatur</dt><dd>dwie, granica przesuwalna między półkami</dd></div>
                <div class="spec-table__row"><dt>Chłodzenie</dt><dd>hermetyczny agregat push-in, sterowany elektronicznie</dd></div>
                <div class="spec-table__row"><dt>Ekran</dt><dd>7" LED, dotykowy, 800×480 px</dd></div>
                <div class="spec-table__row"><dt>Bezpieczeństwo żywności</dt><dd>oprogramowanie FoodSafety monitoruje strefę świeżych produktów</dd></div>
                <div class="spec-table__row"><dt>Opcje</dt><dd>winda (lift) do delikatnych produktów — jajka, szkło, napoje gazowane</dd></div>
              </dl>
            </div>
          </div>
          <div class="model-card model-card--photo" id="sn48">
            <img class="model-card__img" src="/sielaff/sn48/product.png" alt="Automat Sielaff SN48" loading="lazy">
            <div class="model-card__body">
              <h3>SN48</h3>
              <p>Kompaktowy, jednorozmiarowy automat spiralny. Dostępny jako Snack, Combi, Fresh food lub 2T LM (dwustrefowy) — dobry na start albo do mniejszych lokalizacji.</p>
              <dl class="spec-table">
                <div class="spec-table__row"><dt>Konfiguracja</dt><dd>5 lub 6 półek, 8 spiral w wielu rozmiarach</dd></div>
                <div class="spec-table__row"><dt>Wersje</dt><dd>Snack / Combi / Fresh food / 2T LM</dd></div>
                <div class="spec-table__row"><dt>Temperatura (2T LM)</dt><dd>górne półki ~10–15°C, strefa LM ≤4°C</dd></div>
                <div class="spec-table__row"><dt>Bezpieczeństwo żywności</dt><dd>oprogramowanie FoodSafety monitoruje strefę chłodzoną</dd></div>
                <div class="spec-table__row"><dt>Konstrukcja</dt><dd>obudowa nitowana, spirale malowane proszkowo, agregat push-in</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Napoje i ekspozycja</p>
        <h2>Napoje, butelki <em>i produkty w większej ekspozycji.</em></h2>
        <div class="cards-grid">
          <div class="model-card model-card--photo" id="siline-gf">
            <img class="model-card__img" src="/sielaff/siline-gf/product.png" alt="Automat Sielaff SiLine GF" loading="lazy">
            <div class="model-card__body">
              <h3>SiLine GF</h3>
              <p>Duża szklana witryna z dobrą widocznością produktu — sprawdza się przy napojach i produktach markowych.</p>
              <dl class="spec-table">
                <div class="spec-table__row"><dt>Pojemność</dt><dd>do 72 wyborów na 8 półkach</dd></div>
                <div class="spec-table__row"><dt>Opakowania</dt><dd>szkło/PET i puszki 0,2–0,6 l, maks. wysokość butelki 270 mm</dd></div>
                <div class="spec-table__row"><dt>Chłodzenie</dt><dd>hermetyczny agregat push-in</dd></div>
                <div class="spec-table__row"><dt>Ekran</dt><dd>dotykowy, wspólny interfejs serii SiLine</dd></div>
              </dl>
            </div>
          </div>
          <div class="model-card model-card--photo" id="robimat-x">
            <img class="model-card__img" src="/sielaff/robimat-x/product.png" alt="Automat Sielaff Robimat X" loading="lazy">
            <div class="model-card__body">
              <h3>Robimat X</h3>
              <p>Wysoka pojemność i dostawa produktu ramieniem robota zamiast spirali — elastyczna konfiguracja pod różne formaty opakowań.</p>
              <dl class="spec-table">
                <div class="spec-table__row"><dt>Opakowania</dt><dd>butelki/puszki 0,2–0,6 l, produkty 200–910 g, śr. do 72 mm</dd></div>
                <div class="spec-table__row"><dt>Wariant XM</dt><dd>5 półek, 35 wyborów, ok. 315 napojów (PET 0,6 l)</dd></div>
                <div class="spec-table__row"><dt>Wariant XL</dt><dd>5 półek, 45 wyborów, ok. 405 napojów</dd></div>
                <div class="spec-table__row"><dt>Konstrukcja</dt><dd>modułowa, serwisowalna, w pełni recyklingowalna, oświetlenie LED</dd></div>
              </dl>
            </div>
          </div>
          <div class="model-card model-card--photo" id="fk-series">
            <img class="model-card__img" src="/sielaff/fk-series/product.png" alt="Automat Sielaff seria FK" loading="lazy">
            <div class="model-card__body">
              <h3>Seria FK</h3>
              <p>Klasyczny automat zsypowy na napoje — dobry do napojów i produktów markowych w prostym, sprawdzonym formacie.</p>
              <dl class="spec-table">
                <div class="spec-table__row"><dt>Opakowania</dt><dd>butelki/puszki 0,2–2,0 l</dd></div>
                <div class="spec-table__row"><dt>System</dt><dd>elastyczne zsypy standardowe i wąskie, dowolna kombinacja</dd></div>
                <div class="spec-table__row"><dt>Chłodzenie</dt><dd>kompaktowy agregat elektroniczny slide-in</dd></div>
                <div class="spec-table__row"><dt>Wersje</dt><dd>wysokiego bezpieczeństwa (poza FK170), FK280 outdoor IP24</dd></div>
                <div class="spec-table__row"><dt>Energia</dt><dd>klasa A+ lub lepsza</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Na zewnątrz i miejsca publiczne</p>
        <h2>Outdoor <em>i przestrzenie publiczne.</em></h2>
        <div class="cards-grid">
          <div class="model-card model-card--photo" id="outdoor">
            <img class="model-card__img" src="/sielaff/outdoor/lifestyle.jpg" alt="Automat Sielaff w wersji outdoor" loading="lazy">
            <div class="model-card__body">
              <h3>Seria Outdoor (SiLine / SiVend)</h3>
              <p>Wzmocniona obudowa i ogrzewanie/chłodzenie dostosowane do pracy na zewnątrz, bez zadaszenia.</p>
              <dl class="spec-table">
                <div class="spec-table__row"><dt>Szczelność</dt><dd>klasa IP24</dd></div>
                <div class="spec-table__row"><dt>Odporność na temperaturę</dt><dd>do -20°C</dd></div>
                <div class="spec-table__row"><dt>Certyfikacja</dt><dd>testowane niezależnie, oznaczenie GS</dd></div>
                <div class="spec-table__row"><dt>Zastosowanie</dt><dd>lokalizacje zewnętrzne o dużym ruchu pieszym</dd></div>
              </dl>
            </div>
          </div>
          <div class="model-card model-card--photo" id="siline-public">
            <img class="model-card__img" src="/sielaff/siline-public/product.png" alt="Automat Sielaff SiLine Public" loading="lazy">
            <div class="model-card__body">
              <h3>SiLine Public</h3>
              <p>Wysoka odporność na warunki i intensywne użytkowanie — dobre do miejsc publicznych o dużym ruchu.</p>
              <dl class="spec-table">
                <div class="spec-table__row"><dt>Zabezpieczenia</dt><dd>panel antywandalowy z poliwęglanu 12 mm, wzmocniona blokada dźwigni</dd></div>
                <div class="spec-table__row"><dt>Asortyment</dt><dd>słodycze, przekąski, świeże produkty, napoje, produkty niespożywcze</dd></div>
                <div class="spec-table__row"><dt>Telemetria</dt><dd>monitoring chłodzenia i energii, zgłaszanie usterek, dane przez USB/MDB</dd></div>
                <div class="spec-table__row"><dt>Ekran</dt><dd>koszyk do 5 produktów, funkcja zestawów, informacje o alergenach</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Dodatki</p>
        <h2>Kawa <em>i zwroty opakowań.</em></h2>
        <div class="cards-grid">
          <div class="model-card model-card--photo" id="siamonie">
            <img class="model-card__img" src="/sielaff/siamonie/product.png" alt="Automat do kawy Sielaff Siamonie" loading="lazy">
            <div class="model-card__body">
              <h3>Siamonie</h3>
              <p>Automat do kawy, dobry duet z automatem na produkty spożywcze w tej samej lokalizacji.</p>
              <dl class="spec-table">
                <div class="spec-table__row"><dt>Wymiary</dt><dd>710 × 450 × 570 mm, 68 kg</dd></div>
                <div class="spec-table__row"><dt>Wydajność</dt><dd>do 250 kubków/h</dd></div>
                <div class="spec-table__row"><dt>Ziarno</dt><dd>hopper 1,2 kg (wariant Mono), douzupełnianie po 1 kg</dd></div>
                <div class="spec-table__row"><dt>Zasilanie</dt><dd>230 V / 50 Hz / 16 A, 2,9 kW</dd></div>
                <div class="spec-table__row"><dt>Wybór</dt><dd>10 przycisków bezpośrednich, do 20 produktów</dd></div>
              </dl>
            </div>
          </div>
          <div class="model-card model-card--photo" id="siline-hg">
            <img class="model-card__img" src="/sielaff/siline-hg/product.png" alt="Automat Sielaff SiLine HG na gorące napoje" loading="lazy">
            <div class="model-card__body">
              <h3>SiLine HG / SiVend HG</h3>
              <p>Automaty z gorącymi napojami — kawa, herbata, czekolada — jako uzupełnienie oferty.</p>
              <dl class="spec-table">
                <div class="spec-table__row"><dt>Bojler (TS27)</dt><dd>2,0 kW + dogrzewanie zależne od przepływu</dd></div>
                <div class="spec-table__row"><dt>Temperatura</dt><dd>ustawiana osobno per produkt/składnik</dd></div>
                <div class="spec-table__row"><dt>Wyświetlacz</dt><dd>pełnopowierzchniowy dotykowy, za szkłem</dd></div>
                <div class="spec-table__row"><dt>Warianty</dt><dd>HG 15 TT (profil premium), HG20 Trend (do 20 napojów)</dd></div>
              </dl>
            </div>
          </div>
          <div class="family-card">
            <h3>SiLoop</h3>
            <p>Moduł zwrotów opakowań (SiLoop CO2) doczepiany do automatów na napoje — opcjonalny dodatek, nie osobna maszyna.</p>
          </div>
          <div class="model-card model-card--photo" id="sione">
            <img class="model-card__img" src="/sielaff/sione/product.png" alt="Automat zwrotny Sielaff SiOne" loading="lazy">
            <div class="model-card__body">
              <h3>SiOne</h3>
              <p>Kompaktowe rozwiązanie do zwrotów opakowań w mniejszych lokalizacjach.</p>
              <dl class="spec-table">
                <div class="spec-table__row"><dt>Rozpoznawanie</dt><dd>kody kreskowe, do 10 000 pozycji</dd></div>
                <div class="spec-table__row"><dt>Prędkość</dt><dd>do 30 opakowań/min</dd></div>
                <div class="spec-table__row"><dt>Pojemność</dt><dd>do 600 butelek PET 0,5 l lub 700 puszek</dd></div>
                <div class="spec-table__row"><dt>Montaż</dt><dd>wolnostojący lub naścienny</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Verify no other part of the file changed**

Run: `git diff automaty-sielaff.html`
Expected: only lines 36–114 changed; the hero section, "Technologia" checklist section, and final CTA section are untouched.

- [ ] **Step 3: Commit**

```bash
git add automaty-sielaff.html
git commit -m "$(cat <<'EOF'
feat: add real Sielaff specs and photos to automaty-sielaff page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Add "Polecany model" card to every `rozwiazania/*.html` page

**Files:**
- Modify: `rozwiazania/pieczywo.html` (insert new section after the hero section)
- Modify: `rozwiazania/jajka.html` (insert new section after the hero section)
- Modify: `rozwiazania/sery.html` (insert new section after the hero section)
- Modify: `rozwiazania/mieso-dania.html` (insert new section after the hero section)
- Modify: `rozwiazania/ziemniaki-warzywa.html` (insert new section after the hero section)
- Modify: `rozwiazania/bio-lokalne.html` (insert new section after the hero section)
- Modify: `rozwiazania/napoje.html` (insert new section after the hero section)

**Interfaces:**
- Consumes: `.model-card`, `.model-card--photo`, `.model-card--compact`, `.spec-table` CSS from Task 2; anchor ids (`siline-snack-combi`, `sn48`, `siline-gf`, `robimat-x`, `fk-series`) and images from Task 4/Task 1.

- [ ] **Step 1: Insert the "Polecany model" section into `rozwiazania/pieczywo.html`**

Immediately after the closing `</section>` of the hero (the section containing `<h1>Automat na pieczywo`), insert:

```html
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Polecany model</p>
        <h2>SiLine Snack & Combi</h2>
        <div class="model-card model-card--photo model-card--compact">
          <img class="model-card__img" src="/sielaff/siline-snack-combi/product.png" alt="Automat Sielaff SiLine Snack & Combi" loading="lazy">
          <div class="model-card__body">
            <p>Elastyczna konfiguracja wnętrza — dobry wybór dla różnych formatów pieczywa, od bochenków po bułki paczkowane.</p>
            <dl class="spec-table">
              <div class="spec-table__row"><dt>Szerokość</dt><dd>780 lub 990 mm</dd></div>
              <div class="spec-table__row"><dt>Strefy temperatur</dt><dd>dwie, granica przesuwalna</dd></div>
              <div class="spec-table__row"><dt>Ekran</dt><dd>7" dotykowy, 800×480 px</dd></div>
            </dl>
            <a href="/automaty-sielaff#siline-snack-combi" class="model-card__link">Zobacz pełną specyfikację →</a>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Insert the "Polecany model" section into `rozwiazania/jajka.html`**

Immediately after the closing `</section>` of the hero (the section containing `<h1>Automat na jajka`), insert:

```html
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Polecany model</p>
        <h2>SiLine Snack & Combi — z opcją windy</h2>
        <div class="model-card model-card--photo model-card--compact">
          <img class="model-card__img" src="/sielaff/siline-snack-combi/product.png" alt="Automat Sielaff SiLine Snack & Combi z windą do delikatnych produktów" loading="lazy">
          <div class="model-card__body">
            <p>Opcjonalna winda (lift system) wydaje delikatne produkty bez zrzucania — jajka nie pękają, jak mogłoby się zdarzyć przy zwykłej spirali.</p>
            <dl class="spec-table">
              <div class="spec-table__row"><dt>Wydawanie</dt><dd>opcjonalna winda dla delikatnych produktów</dd></div>
              <div class="spec-table__row"><dt>Strefy temperatur</dt><dd>dwie, granica przesuwalna między półkami</dd></div>
              <div class="spec-table__row"><dt>Ekran</dt><dd>7" dotykowy, 800×480 px</dd></div>
            </dl>
            <a href="/automaty-sielaff#siline-snack-combi" class="model-card__link">Zobacz pełną specyfikację →</a>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Insert the "Polecany model" section into `rozwiazania/sery.html`**

Immediately after the closing `</section>` of the hero (the section containing `<h1>Automat na sery`), insert:

```html
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Polecany model</p>
        <h2>SN48 — wersja Fresh food / 2T LM</h2>
        <div class="model-card model-card--photo model-card--compact">
          <img class="model-card__img" src="/sielaff/sn48/product.png" alt="Automat Sielaff SN48" loading="lazy">
          <div class="model-card__body">
            <p>Dwustrefowa wersja 2T LM chłodzi sery i nabiał do ≤4°C, a oprogramowanie FoodSafety pilnuje, żeby wydawać tylko produkty w prawidłowej temperaturze.</p>
            <dl class="spec-table">
              <div class="spec-table__row"><dt>Konfiguracja</dt><dd>5 lub 6 półek, 8 spiral</dd></div>
              <div class="spec-table__row"><dt>Strefa chłodzona</dt><dd>≤4°C, monitorowana przez FoodSafety</dd></div>
              <div class="spec-table__row"><dt>Górne półki</dt><dd>~10–15°C</dd></div>
            </dl>
            <a href="/automaty-sielaff#sn48" class="model-card__link">Zobacz pełną specyfikację →</a>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Insert the "Polecany model" section into `rozwiazania/mieso-dania.html`**

Immediately after the closing `</section>` of the hero (the section containing `<h1>Automat na mięso`), insert:

```html
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Polecany model</p>
        <h2>SN48 — wersja Fresh food / 2T LM</h2>
        <div class="model-card model-card--photo model-card--compact">
          <img class="model-card__img" src="/sielaff/sn48/product.png" alt="Automat Sielaff SN48" loading="lazy">
          <div class="model-card__body">
            <p>Strefa ≤4°C z ciągłym monitoringiem temperatury (FoodSafety) — kluczowe przy mięsie, wędlinach i daniach gotowych, gdzie rygor sanitarny nie podlega kompromisom.</p>
            <dl class="spec-table">
              <div class="spec-table__row"><dt>Konfiguracja</dt><dd>5 lub 6 półek, 8 spiral</dd></div>
              <div class="spec-table__row"><dt>Strefa chłodzona</dt><dd>≤4°C, monitorowana przez FoodSafety</dd></div>
              <div class="spec-table__row"><dt>Konstrukcja</dt><dd>obudowa nitowana, spirale malowane proszkowo</dd></div>
            </dl>
            <a href="/automaty-sielaff#sn48" class="model-card__link">Zobacz pełną specyfikację →</a>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 5: Insert the "Polecany model" section into `rozwiazania/ziemniaki-warzywa.html`**

Immediately after the closing `</section>` of the hero (the section containing `<h1>Automat na ziemniaki`), insert:

```html
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Polecany model</p>
        <h2>SiLine Snack & Combi</h2>
        <div class="model-card model-card--photo model-card--compact">
          <img class="model-card__img" src="/sielaff/siline-snack-combi/product.png" alt="Automat Sielaff SiLine Snack & Combi" loading="lazy">
          <div class="model-card__body">
            <p>Szerokość 780 lub 990 mm daje miejsce na duże, cięższe opakowania warzyw i ziemniaków — elastyczna konfiguracja spiral pod różne formaty siatek i worków.</p>
            <dl class="spec-table">
              <div class="spec-table__row"><dt>Szerokość</dt><dd>780 lub 990 mm</dd></div>
              <div class="spec-table__row"><dt>Temperatura</dt><dd>zwykle pokojowa, opcjonalnie strefa chłodzona</dd></div>
              <div class="spec-table__row"><dt>Ekran</dt><dd>7" dotykowy, 800×480 px</dd></div>
            </dl>
            <a href="/automaty-sielaff#siline-snack-combi" class="model-card__link">Zobacz pełną specyfikację →</a>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 6: Insert the "Polecany model" section into `rozwiazania/bio-lokalne.html`**

Immediately after the closing `</section>` of the hero (the section containing `<h1>Automat na produkty bio`), insert:

```html
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Polecany model</p>
        <h2>SiLine Snack & Combi</h2>
        <div class="model-card model-card--photo model-card--compact">
          <img class="model-card__img" src="/sielaff/siline-snack-combi/product.png" alt="Automat Sielaff SiLine Snack & Combi" loading="lazy">
          <div class="model-card__body">
            <p>Dwie strefy temperatur w jednej maszynie pozwalają łączyć różne produkty lokalnych dostawców — od pieczywa po nabiał — w jednym automacie.</p>
            <dl class="spec-table">
              <div class="spec-table__row"><dt>Strefy temperatur</dt><dd>dwie, granica przesuwalna między półkami</dd></div>
              <div class="spec-table__row"><dt>Ekran</dt><dd>7" dotykowy — miejsce na opis producenta</dd></div>
              <div class="spec-table__row"><dt>Szerokość</dt><dd>780 lub 990 mm</dd></div>
            </dl>
            <a href="/automaty-sielaff#siline-snack-combi" class="model-card__link">Zobacz pełną specyfikację →</a>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 7: Insert the "Polecane modele" section into `rozwiazania/napoje.html`**

Immediately after the closing `</section>` of the hero (the section containing `<h1>Automat na napoje`), insert:

```html
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">Polecane modele</p>
        <h2>SiLine GF, Robimat X, seria FK</h2>
        <div class="cards-grid">
          <div class="model-card model-card--photo model-card--compact">
            <img class="model-card__img" src="/sielaff/siline-gf/product.png" alt="Automat Sielaff SiLine GF" loading="lazy">
            <div class="model-card__body">
              <h3>SiLine GF</h3>
              <p>Do 72 wyborów, szklana witryna — dobra widoczność marki.</p>
              <a href="/automaty-sielaff#siline-gf" class="model-card__link">Specyfikacja →</a>
            </div>
          </div>
          <div class="model-card model-card--photo model-card--compact">
            <img class="model-card__img" src="/sielaff/robimat-x/product.png" alt="Automat Sielaff Robimat X" loading="lazy">
            <div class="model-card__body">
              <h3>Robimat X</h3>
              <p>Dostawa ramieniem robota, do 405 napojów (wariant XL).</p>
              <a href="/automaty-sielaff#robimat-x" class="model-card__link">Specyfikacja →</a>
            </div>
          </div>
          <div class="model-card model-card--photo model-card--compact">
            <img class="model-card__img" src="/sielaff/fk-series/product.png" alt="Automat Sielaff seria FK" loading="lazy">
            <div class="model-card__body">
              <h3>Seria FK</h3>
              <p>Klasyczny automat zsypowy, butelki i puszki 0,2–2,0 l.</p>
              <a href="/automaty-sielaff#fk-series" class="model-card__link">Specyfikacja →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 8: Verify all 7 pages changed as expected**

Run: `git diff --stat rozwiazania/`
Expected: 7 files changed, each with only additions (one new `<section>` block per file, right after the hero).

- [ ] **Step 9: Commit**

```bash
git add rozwiazania/
git commit -m "$(cat <<'EOF'
feat: add recommended-model spec cards to all rozwiazania pages

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Replace the homepage "Rozwiązania" card grid with the carousel

**Files:**
- Modify: `index.html:94-108` (the `<section class="section rozwiazania" id="rozwiazania">` block)
- Modify: `index.html:274-276` (script tags at the end of `<body>`)

**Interfaces:**
- Consumes: `.carousel*` CSS from Task 2, `initCarousel()` auto-registration from Task 3's `src/carousel.ts`, category images from Task 1.

- [ ] **Step 1: Replace the "Rozwiązania" section markup**

Replace `index.html:94-108` (the entire `<section class="section rozwiazania" id="rozwiazania">...</section>` block) with:

```html
    <section class="section rozwiazania" id="rozwiazania">
      <div class="wrap">
        <p class="eyebrow">Rozwiązania</p>
        <h2>Automat dopasowany <em>do Twojego produktu.</em></h2>
        <div class="carousel" tabindex="0">
          <div class="carousel__track">
            <a href="/rozwiazania/pieczywo" class="carousel__item carousel__item--active" style="order: 0">
              <img src="/kategorie/pieczywo.jpg" alt="Pieczywo w automacie" loading="lazy">
              <div class="carousel__caption"><h3>Pieczywo</h3><p>Codzienna rotacja, temperatura pokojowa, szczyty rano i wieczorem.</p></div>
            </a>
            <a href="/rozwiazania/jajka" class="carousel__item carousel__item--side" style="order: 1">
              <img src="/kategorie/jajka.jpg" alt="Jajka w automacie" loading="lazy">
              <div class="carousel__caption"><h3>Jajka</h3><p>Delikatne wydawanie windą, wytłaczanki, oznakowanie zgodne z przepisami.</p></div>
            </a>
            <a href="/rozwiazania/sery" class="carousel__item carousel__item--far" style="order: 2">
              <img src="/kategorie/sery.jpg" alt="Sery w automacie" loading="lazy">
              <div class="carousel__caption"><h3>Sery i nabiał</h3><p>Chłodzenie, różne formaty, wyższa średnia wartość koszyka.</p></div>
            </a>
            <a href="/rozwiazania/ziemniaki-warzywa" class="carousel__item carousel__item--hidden" style="order: 3">
              <img src="/kategorie/ziemniaki-warzywa.jpg" alt="Warzywa w automacie" loading="lazy">
              <div class="carousel__caption"><h3>Ziemniaki i warzywa</h3><p>Duże, ciężkie opakowania — liczy się wolumen.</p></div>
            </a>
            <a href="/rozwiazania/bio-lokalne" class="carousel__item carousel__item--hidden" style="order: 4">
              <img src="/kategorie/bio-lokalne.jpg" alt="Produkty bio i lokalne w automacie" loading="lazy">
              <div class="carousel__caption"><h3>Bio i lokalne</h3><p>Mini-sklep z wieloma produktami i opisami producentów na ekranie.</p></div>
            </a>
            <a href="/rozwiazania/mieso-dania" class="carousel__item carousel__item--hidden" style="order: -3">
              <img src="/kategorie/mieso-dania.jpg" alt="Mięso i dania gotowe w automacie" loading="lazy">
              <div class="carousel__caption"><h3>Mięso i dania gotowe</h3><p>Chłodzenie z kontrolą temperatury i telemetrią, rygor sanitarny.</p></div>
            </a>
            <a href="/rozwiazania/napoje" class="carousel__item carousel__item--far" style="order: -2">
              <img src="/kategorie/napoje.jpg" alt="Napoje w automacie" loading="lazy">
              <div class="carousel__caption"><h3>Napoje</h3><p>SiLine GF, Robimat X, seria FK — z opcją zwrotów opakowań.</p></div>
            </a>
            <a href="/konfigurator" class="carousel__item carousel__item--brand carousel__item--side" style="order: -1">
              <div class="carousel__caption"><h3>Twoja branża?</h3><p>Konfigurujemy automat pod dowolny produkt i opakowanie — nie tylko żywność.</p></div>
            </a>
          </div>
          <div class="carousel__dots"></div>
        </div>
      </div>
    </section>
```

(The inline `style="order: N"` and initial `carousel__item--*` classes reproduce exactly what `circularOffset(i, 0, 8)` / `classifyOffset(...)` from Task 3 would compute for `active = 0`, so the page looks correct even before `carousel.ts` finishes initializing — `initCarousel()`'s first `render()` call then re-applies the same state, so there's no visible flash.)

- [ ] **Step 2: Register the carousel script**

In `index.html`, find the existing script tags near the end of `<body>`:

```html
  <script type="module" src="/src/main.ts"></script>
  <script type="module" src="/src/calculator.ts"></script>
  <script type="module" src="/src/cookies.ts"></script>
```

Add the carousel script alongside them:

```html
  <script type="module" src="/src/main.ts"></script>
  <script type="module" src="/src/calculator.ts"></script>
  <script type="module" src="/src/carousel.ts"></script>
  <script type="module" src="/src/cookies.ts"></script>
```

- [ ] **Step 3: Run the dev server and manually verify the carousel**

Run: `npm run dev`
Open the printed local URL in a browser, scroll to the "Rozwiązania" section, and confirm: the "Pieczywo" card is centered and large, "Jajka"/"Napoje" are visibly smaller/side, clicking a side card recenters it, the dots row reflects the active index, and the "Twoja branża?" card links to `/konfigurator`.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: replace homepage product-card grid with a photo carousel

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Convert homepage "Dlaczego automat", "Jak pracujemy" and "Automaty Sielaff" sections to split-section layout

**Files:**
- Modify: `index.html` (the `.section.problem`, `.section.config-layers`, and `.section.sielaff-families` blocks)

**Interfaces:**
- Consumes: `.split-section*` CSS from Task 2; images from Task 1 (`/kategorie/pieczywo.jpg`, `/sielaff/siline-snack-combi/product.png`, `/sielaff/outdoor/lifestyle.jpg`).

- [ ] **Step 1: Wrap the "Dlaczego automat" (problem) section content in a split-section**

Replace the `<section class="section problem">...</section>` block with:

```html
    <section class="section problem">
      <div class="wrap">
        <p class="eyebrow">Dlaczego automat</p>
        <div class="split-section">
          <div class="split-section__body">
            <h2>Masz dobry produkt. Brakuje Ci tylko czasu, <em>żeby go sprzedawać.</em></h2>
            <div class="cols-3">
              <div class="col"><h3>Sklep zamyka się o 18</h3><p>Klient, który wraca z pracy o 19, i tak nie kupi Twojego produktu.</p></div>
              <div class="col"><h3>Targ to cały dzień stania</h3><p>Rozładunek, stoisko, sprzedaż, spakowanie — a i tak trafiasz tylko do tych, którzy przyjdą akurat w tę sobotę.</p></div>
              <div class="col"><h3>Pracownik za ladą kosztuje</h3><p>Nawet gdy nikt nie przychodzi, pensja i tak leci.</p></div>
            </div>
            <p class="problem__punchline">Automat sprzedaje 24 godziny na dobę — bez Twojej obecności i bez etatu za ladą.</p>
          </div>
          <div class="split-section__media">
            <img src="/kategorie/pieczywo.jpg" alt="Świeże pieczywo gotowe do sprzedaży 24/7" loading="lazy">
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Wrap the "Jak pracujemy" (config-layers) section content in a reversed split-section**

Replace the `<section class="section config-layers">...</section>` block with:

```html
    <section class="section config-layers">
      <div class="wrap">
        <p class="eyebrow">Jak pracujemy</p>
        <div class="split-section split-section--reverse">
          <div class="split-section__body">
            <h2>Nie sprzedajemy automatów z półki. <em>Konfigurujemy je.</em></h2>
            <div class="layers-grid">
              <div class="layer"><h3>Produkt i opakowanie</h3><p>Worek, wytłaczanka, słoik, butelka, pudełko czy luzem — dobieramy mechanizm pod konkretne opakowanie.</p></div>
              <div class="layer"><h3>Temperatura</h3><p>Chłodzenie, temperatura pokojowa albo strefy mieszane w jednym automacie.</p></div>
              <div class="layer"><h3>Sposób wydawania</h3><p>Spirala, popychacz albo winda — zależnie od kruchości i kształtu produktu.</p></div>
              <div class="layer"><h3>Miejsce</h3><p>W budynku, pod wiatą czy na zewnątrz przy drodze — dobieramy obudowę i ogrzewanie/chłodzenie.</p></div>
              <div class="layer"><h3>Płatności</h3><p>Karta, BLIK, gotówka — konfiguracja pod Twoich klientów.</p></div>
              <div class="layer"><h3>Wygląd</h3><p>Oklejenie w barwach firmy, ekran z logo, telemetria.</p></div>
            </div>
            <a href="/konfigurator" class="btn btn--primary">Skonfiguruj swój automat →</a>
          </div>
          <div class="split-section__media split-section__media--contain">
            <img src="/sielaff/siline-snack-combi/product.png" alt="Automat Sielaff SiLine Snack & Combi" loading="lazy">
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Wrap the "Automaty Sielaff" (sielaff-families) section content in a split-section**

Replace the `<section class="section sielaff-families">...</section>` block with:

```html
    <section class="section sielaff-families">
      <div class="wrap">
        <p class="eyebrow">Sprzęt</p>
        <div class="split-section">
          <div class="split-section__body">
            <h2>Automaty Sielaff <em>dopasowane do zastosowania.</em></h2>
            <div class="cards-grid">
              <div class="family-card"><h3>SiLine Snack & Combi</h3><p>Świeże produkty, elastyczna konfiguracja wnętrza.</p></div>
              <div class="family-card"><h3>SiLine GF</h3><p>Napoje i produkty w większej ekspozycji.</p></div>
              <div class="family-card"><h3>Outdoor</h3><p>Wersje na zewnątrz i w miejsca bez zadaszenia.</p></div>
              <div class="family-card"><h3>SiLine Public</h3><p>Miejsca publiczne, wysoka odporność na warunki.</p></div>
            </div>
            <a href="/automaty-sielaff" class="btn btn--secondary">Zobacz wszystkie modele</a>
          </div>
          <div class="split-section__media">
            <img src="/sielaff/outdoor/lifestyle.jpg" alt="Automat Sielaff w wersji outdoor w przestrzeni publicznej" loading="lazy">
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Run the dev server and manually verify all three sections**

Run: `npm run dev`
Open the homepage and confirm: "Dlaczego automat" shows the bread photo on the right of the 3-column text; "Jak pracujemy" shows the SiLine Snack & Combi product photo on the left (on a neutral background, not cropped/stretched) with the 6-item grid on the right; "Automaty Sielaff" shows the outdoor lifestyle photo on the right. Resize the browser below 760px and confirm all three stack to a single column with the image on top.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: convert homepage text sections to image+text split layout

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass, including `src/carousel.test.ts` from Task 3.

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: `tsc && vite build` completes with no type errors and no missing-asset warnings for any `/sielaff/...` or `/kategorie/...` path.

- [ ] **Step 3: Serve the production build and check for broken images**

Run: `npm run preview` (in one terminal), then in another terminal:

```bash
for path in / /automaty-sielaff /rozwiazania/pieczywo /rozwiazania/jajka /rozwiazania/sery /rozwiazania/mieso-dania /rozwiazania/ziemniaki-warzywa /rozwiazania/bio-lokalne /rozwiazania/napoje; do
  echo "== $path =="
  curl -s "http://localhost:4173$path" | grep -oE 'src="[^"]+\.(png|jpg)"' | sort -u
done
```

For every image path printed, confirm it resolves with a 200:

```bash
for img in $(curl -s http://localhost:4173/automaty-sielaff | grep -oE 'src="/sielaff/[^"]+"' | tr -d '"src='); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4173$img")
  echo "$img -> $code"
done
```

Expected: every image URL returns `200`. If any return `404`, re-check the corresponding filename/path from Task 1 against what's referenced in the HTML.

- [ ] **Step 4: Visual review in a browser (desktop + mobile width)**

Open `http://localhost:4173/` and:
- Confirm the "Rozwiązania" carousel and all three split-sections render correctly and match what was checked in Tasks 6–7.
- Resize to ~375px width (or use browser dev tools device emulation) and confirm the carousel and split-sections don't overflow horizontally and remain usable (carousel cards shrink per the `@media (max-width: 760px)` rule from Task 2, split-sections stack).

Open `http://localhost:4173/automaty-sielaff` and confirm all 10 photographed model cards show an image and a populated spec table, and the SiLoop card (no photo) still renders as a plain text card without a broken image icon.

Open `http://localhost:4173/rozwiazania/jajka` and `http://localhost:4173/rozwiazania/napoje` and confirm the "Polecany model"/"Polecane modele" card(s) render with image + specs, and the "Zobacz pełną specyfikację" links land on the correct anchored card on `/automaty-sielaff`.

- [ ] **Step 5: Stop the preview server**

If run in the foreground, stop it with Ctrl+C; if run in the background, stop the background process.

This task produces no commit — it's a verification gate. If any check fails, fix the issue in the relevant earlier task's files and re-run the failing step.
