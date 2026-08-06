# VendingFresh O nas + Realizacje Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real "O nas" page and a placeholder "Realizacje" page, and wire both into the shared nav/footer.

**Architecture:** Two new flat `.html` files reusing existing CSS entirely (`.section`/`.section__header`/`.why-grid`/`.cta` for O nas, `.placeholder-page` for Realizacje) plus one small CSS addition (`.section__lead`); shared `partials/nav.html`/`partials/footer.html` gain two new links each.

**Tech Stack:** Vite 5, TypeScript (strict), plain HTML — same stack as the rest of the site.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-06-vendingfresh-o-nas-realizacje-design.md` — every requirement below traces back to it.
- Working directly on `main`, no isolated worktree/branch — standing user instruction (commit + push after every task, don't ask each time).
- Flat `.html` files at project root, kebab-case (`o-nas.html`, `realizacje.html`).
- `realizacje.html` is a placeholder page (mirrors `polityka.html`/`rodo.html`) — no fabricated case-study content, real content comes later from the user.
- `o-nas.html`'s copy contains no fabricated facts (founding date, team size, client count, awards) — only the exact copy given in this plan.
- Every new page uses `partials/nav.html`/`partials/footer.html` via `<!-- include:nav.html -->` / `<!-- include:footer.html -->` markers, wrapped in `<main>` (the accessibility landmark convention established during the oferta-subpages final review), and `src/placeholder.ts` as script entry.
- Value-card icons on `o-nas.html` reuse the exact existing SVG markup from `index.html`'s Home why-cards — no new icons designed.

---

### Task 1: `.section__lead` CSS + `o-nas.html`

**Files:**
- Modify: `src/style.css` (new `.section__lead` rule)
- Create: `o-nas.html`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: `.section__lead` CSS class, consumed by `o-nas.html`'s intro paragraph.

- [ ] **Step 1: Add the `.section__lead` CSS rule**

In `src/style.css`, find:

```css
.section__title {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
  color: var(--secondary);
  margin: 0 0 1rem;
}
/* Dlaczego (2x3 grid) */
```

Replace it with:

```css
.section__title {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
  color: var(--secondary);
  margin: 0 0 1rem;
}
.section__lead {
  max-width: 60ch;
  margin: 0 auto 1rem;
  text-align: center;
  color: var(--text-light);
  font-size: 1.05rem;
  line-height: 1.6;
}
/* Dlaczego (2x3 grid) */
```

- [ ] **Step 2: Create `o-nas.html`**

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>O nas — VendingFresh</title>
    <meta name="description" content="Dostarczamy nowoczesne automaty vendingowe dla firm — chłodnicze, przekąskowe, z napojami i kawowe — łącząc świeże produkty, solidną technologię i pełny serwis w jednym miejscu." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <!-- include:nav.html -->
    <main>
      <section class="section">
        <div class="section__inner">
          <div class="section__header">
            <p class="section__eyebrow">O nas</p>
            <h2 class="section__title">VendingFresh</h2>
            <p class="section__lead">Dostarczamy nowoczesne automaty vendingowe dla firm — chłodnicze, przekąskowe, z napojami i kawowe — łącząc świeże produkty, solidną technologię i pełny serwis w jednym miejscu. Naszym celem jest, żeby automat w Twojej firmie działał i wyglądał jak część nowoczesnego, dobrze zaprojektowanego miejsca pracy.</p>
          </div>
          <div class="why-grid">
            <article class="why-card">
              <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                <path d="M12 2l7 3v6c0 5-3 8.5-7 11-4-2.5-7-6-7-11V5l7-3z" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.5 12l2.3 2.3L15.5 9.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3>Jakość i staranność</h3>
              <p>Wybieramy sprawdzone technologie i solidne materiały w każdym automacie.</p>
            </article>
            <article class="why-card">
              <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                <path d="M2 12l3.5-3.5a2 2 0 0 1 2.8 0L10 10l2-2 1.5 1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 10l4.5 4.5a1.5 1.5 0 0 0 2.1-2.1L13 8.8" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14.5 8.5L17 6a2 2 0 0 1 2.8 0L22 8.3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 15l1.5 1.5a1.5 1.5 0 0 0 2.1-2.1" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3>Pełne wsparcie</h3>
              <p>Od pierwszego kontaktu po serwis — jesteśmy do dyspozycji na każdym etapie.</p>
            </article>
            <article class="why-card">
              <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="7" x2="20" y2="7"/>
                <circle cx="14" cy="7" r="1.8" fill="currentColor" stroke="none"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
                <circle cx="8" cy="12" r="1.8" fill="currentColor" stroke="none"/>
                <line x1="4" y1="17" x2="20" y2="17"/>
                <circle cx="16" cy="17" r="1.8" fill="currentColor" stroke="none"/>
              </svg>
              <h3>Elastyczne podejście</h3>
              <p>Dopasowujemy ofertę do branży, lokalizacji i potrzeb Twojej firmy.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section" id="kontakt">
        <div class="section__inner">
          <div class="cta">
            <h2>Gotowy na automat w swojej firmie?</h2>
            <a class="btn btn--primary" href="mailto:kontakt@vendingfresh.pl">Umów rozmowę</a>
            <p class="cta__contact">kontakt@vendingfresh.pl &nbsp;·&nbsp; <a href="tel:+48690000923">+48 690 000 923</a></p>
          </div>
        </div>
      </section>
    </main>

    <!-- include:footer.html -->
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Register the page in `vite.config.ts`**

In `vite.config.ts`, find:

```ts
        ofertaDzierzawa: resolve(__dirname, 'oferta-dzierzawa.html'),
      },
```

Replace it with:

```ts
        ofertaDzierzawa: resolve(__dirname, 'oferta-dzierzawa.html'),
        oNas: resolve(__dirname, 'o-nas.html'),
      },
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: succeeds, `dist/o-nas.html` exists, contains 0 leftover `include:` markers (`grep -c "include:" dist/o-nas.html`), contains `<h2 class="section__title">VendingFresh</h2>` and all 3 value-card headings (`Jakość i staranność`, `Pełne wsparcie`, `Elastyczne podejście`).

- [ ] **Step 5: Commit**

```bash
git add src/style.css o-nas.html vite.config.ts
git commit -m "Add section__lead component and O nas page"
git push origin main
```

---

### Task 2: `realizacje.html` placeholder page

**Files:**
- Create: `realizacje.html`
- Modify: `vite.config.ts`

**Interfaces:** none new.

- [ ] **Step 1: Create `realizacje.html`**

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Realizacje — VendingFresh</title>
    <meta name="description" content="Prezentacja naszych wdrożeń automatów vendingowych — już wkrótce." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <!-- include:nav.html -->
    <main class="placeholder-page">
      <img class="placeholder-page__logo" src="/vendingfresh_logo_full_web.png" alt="VendingFresh" />
      <h1>Strona w przygotowaniu</h1>
      <p>Pracujemy nad prezentacją naszych realizacji — wróć tu wkrótce.</p>
      <a class="btn btn--primary" href="/">Wróć na stronę główną</a>
    </main>
    <!-- include:footer.html -->
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Register the page in `vite.config.ts`**

In `vite.config.ts`, find:

```ts
        oNas: resolve(__dirname, 'o-nas.html'),
      },
```

Replace it with:

```ts
        oNas: resolve(__dirname, 'o-nas.html'),
        realizacje: resolve(__dirname, 'realizacje.html'),
      },
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: succeeds, `dist/realizacje.html` exists, 0 leftover `include:` markers, contains `<h1>Strona w przygotowaniu</h1>` and the realizacje-specific paragraph text.

- [ ] **Step 4: Commit**

```bash
git add realizacje.html vite.config.ts
git commit -m "Add realizacje placeholder page"
git push origin main
```

---

### Task 3: Wire nav and footer to the two new pages

**Files:**
- Modify: `partials/nav.html`
- Modify: `partials/footer.html`

**Interfaces:** none (pure link addition).

- [ ] **Step 1: Add nav links**

In `partials/nav.html`, find:

```html
    </li>
    <li><a href="/#kontakt">Kontakt</a></li>
  </ul>
</nav>
```

Replace it with:

```html
    </li>
    <li><a href="/realizacje.html">Realizacje</a></li>
    <li><a href="/o-nas.html">O nas</a></li>
    <li><a href="/#kontakt">Kontakt</a></li>
  </ul>
</nav>
```

- [ ] **Step 2: Add footer "Menu" links**

In `partials/footer.html`, find:

```html
    <div class="footer__col">
      <h4>Menu</h4>
      <ul>
        <li><a href="/#top">Home</a></li>
        <li><a href="/#oferta">Oferta</a></li>
        <li><a href="/#kontakt">Kontakt</a></li>
      </ul>
    </div>
```

Replace it with:

```html
    <div class="footer__col">
      <h4>Menu</h4>
      <ul>
        <li><a href="/#top">Home</a></li>
        <li><a href="/#oferta">Oferta</a></li>
        <li><a href="/realizacje.html">Realizacje</a></li>
        <li><a href="/o-nas.html">O nas</a></li>
        <li><a href="/#kontakt">Kontakt</a></li>
      </ul>
    </div>
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`, then `grep -o 'href="/\(realizacje\|o-nas\)\.html"' dist/index.html | sort | uniq -c`
Expected: 2 occurrences of `/realizacje.html` and 2 of `/o-nas.html` (one each from nav, one each from footer).

- [ ] **Step 4: Dev server spot-check**

Run: `npm run dev`, then `curl -s http://localhost:5173/oferta-kawa.html | grep -o 'href="/\(realizacje\|o-nas\)\.html"'`
Expected: same 2 links present — confirms the shared partial updates every page, including a non-Home one. Stop the dev server afterward.

- [ ] **Step 5: Commit**

```bash
git add partials/nav.html partials/footer.html
git commit -m "Add Realizacje and O nas links to nav and footer"
git push origin main
```

---

### Task 4: Full verification pass

**Files:** none (verification only; fix forward if something's broken)

- [ ] **Step 1: Run the full automated suite**

Run, in order:
1. `npx tsc --noEmit` — expect no errors.
2. `npm run test` — expect the existing 4 `resolveIncludes` tests to still pass.
3. `npm run build` — expect success, all 11 entries present in `dist/` (`index.html`, `polityka.html`, `rodo.html`, 6× `oferta-*.html`, `o-nas.html`, `realizacje.html`), zero leftover `include:` markers across all of them (`grep -rc "include:" dist/*.html` → all zeros).

- [ ] **Step 2: Manual walk of the verification checklist**

Run `npm run dev` and check:
- `o-nas.html` renders its intro text and 3 value cards correctly, with the shared nav/footer.
- `realizacje.html` renders the placeholder content correctly, with the shared nav/footer.
- Nav (opened from any page) shows Home / Oferta ▾ / Realizacje / O nas / Kontakt, in that order, and each link resolves to the right page.
- Footer's "Menu" column shows the same 5 items in the same order.
- Both new pages are wrapped in `<main>` (accessibility landmark, consistent with the oferta subpages' fix).

Stop the dev server afterward.

- [ ] **Step 3: Fix forward if anything's off, then final commit**

If Step 2 surfaces an issue, fix it directly (small targeted edit), re-run Step 1 and the relevant part of Step 2, then:

```bash
git add -A
git commit -m "Fix O nas / Realizacje verification findings"
git push origin main
```

If nothing needed fixing, no commit is required for this task.

---

## Self-review notes

- **Spec coverage:** every section of the design spec maps to a task — `.section__lead` + O nas content (Task 1), Realizacje placeholder (Task 2), nav/footer wiring (Task 3), full verification (Task 4). The spec's "poza zakresem" list (real realizacje content, team photos/founding story, active-nav-highlighting) has no corresponding task, matching its explicit exclusion.
- **Placeholder scan:** no TBD/TODO; `realizacje.html`'s "w przygotowaniu" text is the intentional, spec'd placeholder — not a plan gap.
- **Type consistency:** `vite.config.ts` keys (`oNas`, `realizacje`) are unique and don't collide with the existing 9 entries. Both new pages use the exact same `<!-- include:nav.html -->`/`<!-- include:footer.html -->`/`<main>`/`placeholder.ts` pattern already established and tested by prior plans — no new interfaces invented.
- **Icon reuse check:** all 3 `o-nas.html` value-card icons (shield-check, handshake, sliders) are traced to specific existing `index.html` why-card icons, per the spec — no new icon artwork.
- **Scope:** two small pages + one shared partial edit, single cohesive plan.
