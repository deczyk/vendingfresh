# VendingFresh Oferta Subpages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each of the 6 offer categories its own page with real marketing content, and point nav's "Oferta" dropdown and Home's offer-grid cards at them instead of the shared `#oferta` anchor.

**Architecture:** Six new flat `.html` files, each reusing the shared `nav`/`footer` partials from the multi-page architecture foundation and a new `.offer-hero` CSS component; benefit cards and the CTA section reuse Home's existing `.why-card`/`.cta` markup patterns verbatim (zero new CSS beyond the hero). Nav's dropdown and Home's offer-card links get repointed at the new pages.

**Tech Stack:** Vite 5, TypeScript (strict), plain HTML (no framework/SSG) — same stack as the rest of the site.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-06-vendingfresh-oferta-subpages-design.md` — every requirement below traces back to it.
- Working directly on `main`, no isolated worktree/branch — standing user instruction for this repo (commit + push after every task, don't ask each time).
- Flat `.html` files at project root, kebab-case, `oferta-` prefix — established convention.
- No fabricated technical data (capacity, dimensions, model numbers, pricing) anywhere in page copy — use only the exact copy given in this plan.
- Each subpage uses `partials/nav.html`/`partials/footer.html` via the existing `<!-- include:nav.html -->` / `<!-- include:footer.html -->` markers (`vite-plugins/html-include.ts`, already built and wired into `vite.config.ts`).
- Each subpage uses `src/placeholder.ts` as its script entry (calls `initSharedPage()` — nav wiring + `js-ready` class; no scroll-reveal, matching `polityka.html`/`rodo.html`'s existing precedent for non-Home pages).
- Benefit icons reuse the exact existing SVG markup from `index.html`'s Home why-cards (`src/main.ts`/`index.html` — six icons: fresh/leaf, quality/shield, tech/card, trust/handshake, flexible/menu, monitor/dashboard) — no new icons designed.
- Photo-category subpages use the exact same single photo Home's card already shows today — no galleries.
- No active-page nav highlighting (still out of scope, per the architecture spec).

---

### Task 1: `.offer-hero` CSS component + first subpage (`oferta-chlodnicze.html`)

**Files:**
- Modify: `src/style.css` (new `.offer-hero*` rules + responsive block)
- Create: `oferta-chlodnicze.html`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: `.offer-hero`, `.offer-hero__eyebrow`, `.offer-hero__title`, `.offer-hero__description`, `.offer-hero__art`, `.offer-hero__photo`, `.offer-hero__icon-block`, `.offer-hero__icon` CSS classes — consumed by all 6 subpages (Tasks 1-3). `.offer-hero__photo` is for the 4 photo categories; `.offer-hero__icon-block`/`.offer-hero__icon` for premium/dzierżawa (Task 3).

- [ ] **Step 1: Add the `.offer-hero` CSS rules**

In `src/style.css`, find this block:

```css
/* Sections */
.section {
  padding: 6rem 1.5rem;
}
```

Replace it with (adds the new rules directly above `/* Sections */`):

```css
/* Offer hero (oferta-*.html subpages) */
.offer-hero {
  padding: 8rem 2rem 4rem;
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}
.offer-hero__eyebrow {
  color: var(--primary-dark);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.8rem;
  margin: 0 0 1rem;
}
.offer-hero__title {
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: 700;
  line-height: 1.15;
  color: var(--secondary);
  margin: 0 0 1.25rem;
}
.offer-hero__description {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--text-light);
  max-width: 46ch;
  margin: 0 0 2rem;
}
.offer-hero__art {
  display: flex;
  justify-content: center;
}
.offer-hero__photo {
  width: 100%;
  max-width: 380px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hover);
}
.offer-hero__icon-block {
  width: 100%;
  max-width: 380px;
  aspect-ratio: 4 / 3;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  justify-content: center;
}
.offer-hero__icon {
  width: 120px;
  height: 120px;
  color: var(--primary);
}

/* Sections */
.section {
  padding: 6rem 1.5rem;
}
```

- [ ] **Step 2: Add the responsive `.offer-hero` rules**

In `src/style.css`, find this block (inside `@media (max-width: 860px)`):

```css
  .hero__art {
    order: -1;
  }
  .why-grid {
```

Replace it with:

```css
  .hero__art {
    order: -1;
  }
  .offer-hero {
    grid-template-columns: 1fr;
    padding: 7rem 1.5rem 3rem;
    text-align: center;
  }
  .offer-hero__description {
    margin-left: auto;
    margin-right: auto;
  }
  .offer-hero__art {
    order: -1;
  }
  .why-grid {
```

- [ ] **Step 3: Create `oferta-chlodnicze.html`**

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Automaty chłodnicze — VendingFresh</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <!-- include:nav.html -->
    <section class="offer-hero">
      <div class="offer-hero__copy">
        <p class="offer-hero__eyebrow">Oferta</p>
        <h1 class="offer-hero__title">Automaty chłodnicze</h1>
        <p class="offer-hero__description">Świeże produkty od lokalnych producentów — jaja, nabiał, miód, przetwory — dostępne 24 godziny na dobę, bez obsługi i bez kolejki. Precyzyjne chłodzenie utrzymuje optymalną temperaturę przez cały czas, a zdalny monitoring pozwala nam reagować, zanim cokolwiek pójdzie nie tak.</p>
        <a class="btn btn--primary" href="#kontakt">Zamów wycenę</a>
      </div>
      <div class="offer-hero__art">
        <img class="offer-hero__photo" src="/vendingfresh_machine.webp" alt="Automat chłodniczy VendingFresh" />
      </div>
    </section>

    <section class="section section--surface">
      <div class="section__inner">
        <div class="why-grid">
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M10 2h4M11 2v3.2c0 .4-.1.7-.4 1L9 8v11a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8l-1.6-1.8c-.3-.3-.4-.6-.4-1V2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 3.5c1.5-1.5 2.8-1.8 4-1.3M16 3.5c-1.5-1.5-2.8-1.8-4-1.3" stroke-linecap="round"/>
              <path d="M9 13h6" stroke-linecap="round"/>
            </svg>
            <h3>Świeżość bez kompromisów</h3>
            <p>Stała temperatura i kontrola jakości na każdym etapie.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M2 12l3.5-3.5a2 2 0 0 1 2.8 0L10 10l2-2 1.5 1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 10l4.5 4.5a1.5 1.5 0 0 0 2.1-2.1L13 8.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14.5 8.5L17 6a2 2 0 0 1 2.8 0L22 8.3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15l1.5 1.5a1.5 1.5 0 0 0 2.1-2.1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Lokalni producenci</h3>
            <p>Wspieramy regionalnych dostawców i naturalne produkty.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="12" rx="2"/>
              <path d="M8 20h8M12 16v4"/>
              <path d="M9 10a4 4 0 0 1 6 0M11 12a1.5 1.5 0 0 1 2 0"/>
            </svg>
            <h3>Zero obsługi</h3>
            <p>Klienci kupują samodzielnie, 24 godziny na dobę.</p>
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

    <!-- include:footer.html -->
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: Register the page in `vite.config.ts`**

In `vite.config.ts`, find:

```ts
      input: {
        main: resolve(__dirname, 'index.html'),
        polityka: resolve(__dirname, 'polityka.html'),
        rodo: resolve(__dirname, 'rodo.html'),
      },
```

Replace it with:

```ts
      input: {
        main: resolve(__dirname, 'index.html'),
        polityka: resolve(__dirname, 'polityka.html'),
        rodo: resolve(__dirname, 'rodo.html'),
        ofertaChlodnicze: resolve(__dirname, 'oferta-chlodnicze.html'),
      },
```

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: succeeds, `dist/oferta-chlodnicze.html` exists, contains the expanded nav/footer (0 `include:` markers — check with `grep -c "include:" dist/oferta-chlodnicze.html`), and contains `<h1 class="offer-hero__title">Automaty chłodnicze</h1>`.

- [ ] **Step 6: Dev server spot-check**

Run: `npm run dev`, then `curl -s http://localhost:5173/oferta-chlodnicze.html | grep -o '<h1 class="offer-hero__title">[^<]*'`
Expected: prints `<h1 class="offer-hero__title">Automaty chłodnicze`. Stop the dev server afterward.

- [ ] **Step 7: Commit**

```bash
git add src/style.css oferta-chlodnicze.html vite.config.ts
git commit -m "Add offer-hero component and first oferta subpage (chlodnicze)"
git push origin main
```

---

### Task 2: Remaining photo subpages (`przekaskowe`, `napoje`, `kawa`)

**Files:**
- Create: `oferta-przekaskowe.html`
- Create: `oferta-napoje.html`
- Create: `oferta-kawa.html`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: `.offer-hero*` CSS classes from Task 1.

- [ ] **Step 1: Create `oferta-przekaskowe.html`**

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Automaty przekąskowe — VendingFresh</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <!-- include:nav.html -->
    <section class="offer-hero">
      <div class="offer-hero__copy">
        <p class="offer-hero__eyebrow">Oferta</p>
        <h1 class="offer-hero__title">Automaty przekąskowe</h1>
        <p class="offer-hero__description">Chipsy, batony i przekąski w zasięgu ręki — w biurze, szkole czy zakładzie pracy. Szeroki wybór produktów dopasowany do miejsca i grupy odbiorców, uzupełniany regularnie, żeby półki nigdy nie świeciły pustkami.</p>
        <a class="btn btn--primary" href="#kontakt">Zamów wycenę</a>
      </div>
      <div class="offer-hero__art">
        <img class="offer-hero__photo" src="/offer-przekaskowe.png" alt="Automat przekąskowy VendingFresh" />
      </div>
    </section>

    <section class="section section--surface">
      <div class="section__inner">
        <div class="why-grid">
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="7" x2="20" y2="7"/>
              <circle cx="14" cy="7" r="1.8" fill="currentColor" stroke="none"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <circle cx="8" cy="12" r="1.8" fill="currentColor" stroke="none"/>
              <line x1="4" y1="17" x2="20" y2="17"/>
              <circle cx="16" cy="17" r="1.8" fill="currentColor" stroke="none"/>
            </svg>
            <h3>Szeroki asortyment</h3>
            <p>Przekąski słodkie i słone, dopasowane do lokalizacji.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="12" rx="2"/>
              <path d="M8 20h8M12 16v4"/>
              <path d="M9 10a4 4 0 0 1 6 0M11 12a1.5 1.5 0 0 1 2 0"/>
            </svg>
            <h3>Zawsze zapełnione</h3>
            <p>Regularne uzupełnianie na podstawie zdalnego monitoringu.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <rect x="5" y="2" width="14" height="20" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 6h8M8 10h8M9 14h2M13 14h2M9 17h2M13 17h2" stroke-linecap="round"/>
            </svg>
            <h3>Płatność bez gotówki</h3>
            <p>Karta, telefon lub BLIK — szybko i wygodnie.</p>
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

    <!-- include:footer.html -->
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `oferta-napoje.html`**

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Automaty z napojami — VendingFresh</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <!-- include:nav.html -->
    <section class="offer-hero">
      <div class="offer-hero__copy">
        <p class="offer-hero__eyebrow">Oferta</p>
        <h1 class="offer-hero__title">Automaty z napojami</h1>
        <p class="offer-hero__description">Zimne napoje, woda i soki — schłodzone i gotowe do wydania w każdej chwili. Idealne rozwiązanie dla biur, siłowni i miejsc o dużym natężeniu ruchu, gdzie liczy się szybki dostęp do orzeźwienia.</p>
        <a class="btn btn--primary" href="#kontakt">Zamów wycenę</a>
      </div>
      <div class="offer-hero__art">
        <img class="offer-hero__photo" src="/offer-napoje-fk.png" alt="Automat z napojami VendingFresh" />
      </div>
    </section>

    <section class="section section--surface">
      <div class="section__inner">
        <div class="why-grid">
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M12 2l7 3v6c0 5-3 8.5-7 11-4-2.5-7-6-7-11V5l7-3z" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8.5 12l2.3 2.3L15.5 9.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Zawsze schłodzone</h3>
            <p>Precyzyjna kontrola temperatury niezależnie od pory roku.</p>
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
            <h3>Szeroki wybór napojów</h3>
            <p>Woda, soki, napoje gazowane i energetyczne.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="12" rx="2"/>
              <path d="M8 20h8M12 16v4"/>
              <path d="M9 10a4 4 0 0 1 6 0M11 12a1.5 1.5 0 0 1 2 0"/>
            </svg>
            <h3>Duża pojemność</h3>
            <p>Rzadsze uzupełnianie nawet przy intensywnym ruchu.</p>
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

    <!-- include:footer.html -->
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `oferta-kawa.html`**

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Automaty kawowe — VendingFresh</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <!-- include:nav.html -->
    <section class="offer-hero">
      <div class="offer-hero__copy">
        <p class="offer-hero__eyebrow">Oferta</p>
        <h1 class="offer-hero__title">Automaty kawowe</h1>
        <p class="offer-hero__description">Świeżo parzona kawa i gorące napoje — jakość kawiarni bez baristy. Automaty kawowe VendingFresh parzą kawę na bazie świeżych ziaren, oferując espresso, cappuccino i inne klasyki na wyciągnięcie ręki.</p>
        <a class="btn btn--primary" href="#kontakt">Zamów wycenę</a>
      </div>
      <div class="offer-hero__art">
        <img class="offer-hero__photo" src="/offer-kawa-siamonie-series.png" alt="Automat kawowy VendingFresh" />
      </div>
    </section>

    <section class="section section--surface">
      <div class="section__inner">
        <div class="why-grid">
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M10 2h4M11 2v3.2c0 .4-.1.7-.4 1L9 8v11a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8l-1.6-1.8c-.3-.3-.4-.6-.4-1V2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 3.5c1.5-1.5 2.8-1.8 4-1.3M16 3.5c-1.5-1.5-2.8-1.8-4-1.3" stroke-linecap="round"/>
              <path d="M9 13h6" stroke-linecap="round"/>
            </svg>
            <h3>Świeżo parzona kawa</h3>
            <p>Ziarnista kawa mielona na bieżąco, nie rozpuszczalna.</p>
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
            <h3>Szeroki wybór napojów</h3>
            <p>Espresso, cappuccino, latte i herbata w jednym urządzeniu.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M2 12l3.5-3.5a2 2 0 0 1 2.8 0L10 10l2-2 1.5 1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 10l4.5 4.5a1.5 1.5 0 0 0 2.1-2.1L13 8.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14.5 8.5L17 6a2 2 0 0 1 2.8 0L22 8.3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15l1.5 1.5a1.5 1.5 0 0 0 2.1-2.1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Idealne do biura</h3>
            <p>Podnosi komfort pracy bez budowania firmowej kawiarni.</p>
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

    <!-- include:footer.html -->
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: Register both remaining pages in `vite.config.ts`**

In `vite.config.ts`, find:

```ts
        ofertaChlodnicze: resolve(__dirname, 'oferta-chlodnicze.html'),
      },
```

Replace it with:

```ts
        ofertaChlodnicze: resolve(__dirname, 'oferta-chlodnicze.html'),
        ofertaPrzekaskowe: resolve(__dirname, 'oferta-przekaskowe.html'),
        ofertaNapoje: resolve(__dirname, 'oferta-napoje.html'),
        ofertaKawa: resolve(__dirname, 'oferta-kawa.html'),
      },
```

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: succeeds; `dist/oferta-przekaskowe.html`, `dist/oferta-napoje.html`, `dist/oferta-kawa.html` all exist, each with 0 leftover `include:` markers (`grep -rc "include:" dist/oferta-przekaskowe.html dist/oferta-napoje.html dist/oferta-kawa.html`) and each containing its own `<h1 class="offer-hero__title">...</h1>` with the right category name.

- [ ] **Step 6: Commit**

```bash
git add oferta-przekaskowe.html oferta-napoje.html oferta-kawa.html vite.config.ts
git commit -m "Add remaining photo-category oferta subpages"
git push origin main
```

---

### Task 3: Icon-only subpages (`premium`, `dzierzawa`)

**Files:**
- Create: `oferta-premium.html`
- Create: `oferta-dzierzawa.html`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: `.offer-hero__icon-block`/`.offer-hero__icon` CSS classes from Task 1.

- [ ] **Step 1: Create `oferta-premium.html`**

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Automaty premium — VendingFresh</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <!-- include:nav.html -->
    <section class="offer-hero">
      <div class="offer-hero__copy">
        <p class="offer-hero__eyebrow">Oferta</p>
        <h1 class="offer-hero__title">Automaty premium</h1>
        <p class="offer-hero__description">Rozbudowane konfiguracje dla lokalizacji o dużym natężeniu ruchu — większa pojemność, szerszy asortyment i zaawansowane technologie płatności i monitoringu w jednym urządzeniu. Dobieramy konfigurację indywidualnie do Twojej lokalizacji.</p>
        <a class="btn btn--primary" href="#kontakt">Zamów wycenę</a>
      </div>
      <div class="offer-hero__art">
        <div class="offer-hero__icon-block">
          <svg class="offer-hero__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 8l3 2 5-6 5 6 3-2-2 10H6L4 8z"/>
            <path d="M6 18h12"/>
          </svg>
        </div>
      </div>
    </section>

    <section class="section section--surface">
      <div class="section__inner">
        <div class="why-grid">
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M12 2l7 3v6c0 5-3 8.5-7 11-4-2.5-7-6-7-11V5l7-3z" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8.5 12l2.3 2.3L15.5 9.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Zwiększona pojemność</h3>
            <p>Więcej produktów, rzadsze wizyty serwisowe.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="12" rx="2"/>
              <path d="M8 20h8M12 16v4"/>
              <path d="M9 10a4 4 0 0 1 6 0M11 12a1.5 1.5 0 0 1 2 0"/>
            </svg>
            <h3>Zaawansowany monitoring</h3>
            <p>Pełny wgląd w stan i sprzedaż automatu 24/7.</p>
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
            <h3>Konfiguracja pod lokalizację</h3>
            <p>Dobór asortymentu dopasowany do miejsca i klientów.</p>
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

    <!-- include:footer.html -->
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `oferta-dzierzawa.html`**

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dzierżawa automatów — VendingFresh</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <!-- include:nav.html -->
    <section class="offer-hero">
      <div class="offer-hero__copy">
        <p class="offer-hero__eyebrow">Oferta</p>
        <h1 class="offer-hero__title">Dzierżawa automatów</h1>
        <p class="offer-hero__description">Zero inwestycji początkowej — automat, montaż i serwis w jednym abonamencie. Dzierżawa to sposób na wprowadzenie automatu do swojej firmy bez jednorazowego wydatku na zakup urządzenia.</p>
        <a class="btn btn--primary" href="#kontakt">Zamów wycenę</a>
      </div>
      <div class="offer-hero__art">
        <div class="offer-hero__icon-block">
          <svg class="offer-hero__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4v5h5"/>
            <path d="M20 20v-5h-5"/>
            <path d="M5.5 15a7 7 0 0 0 12.3 2.5M18.5 9a7 7 0 0 0-12.3-2.5"/>
          </svg>
        </div>
      </div>
    </section>

    <section class="section section--surface">
      <div class="section__inner">
        <div class="why-grid">
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <rect x="5" y="2" width="14" height="20" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 6h8M8 10h8M9 14h2M13 14h2M9 17h2M13 17h2" stroke-linecap="round"/>
            </svg>
            <h3>Brak inwestycji początkowej</h3>
            <p>Płacisz stały abonament zamiast jednorazowego zakupu.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M2 12l3.5-3.5a2 2 0 0 1 2.8 0L10 10l2-2 1.5 1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 10l4.5 4.5a1.5 1.5 0 0 0 2.1-2.1L13 8.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14.5 8.5L17 6a2 2 0 0 1 2.8 0L22 8.3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15l1.5 1.5a1.5 1.5 0 0 0 2.1-2.1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Pełny serwis w cenie</h3>
            <p>Montaż, konserwacja i uzupełnianie po naszej stronie.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M12 2l7 3v6c0 5-3 8.5-7 11-4-2.5-7-6-7-11V5l7-3z" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8.5 12l2.3 2.3L15.5 9.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Elastyczne warunki</h3>
            <p>Dopasowujemy model dzierżawy do potrzeb Twojej firmy.</p>
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

    <!-- include:footer.html -->
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Register both pages in `vite.config.ts`**

In `vite.config.ts`, find:

```ts
        ofertaKawa: resolve(__dirname, 'oferta-kawa.html'),
      },
```

Replace it with:

```ts
        ofertaKawa: resolve(__dirname, 'oferta-kawa.html'),
        ofertaPremium: resolve(__dirname, 'oferta-premium.html'),
        ofertaDzierzawa: resolve(__dirname, 'oferta-dzierzawa.html'),
      },
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: succeeds; `dist/oferta-premium.html` and `dist/oferta-dzierzawa.html` both exist, each with 0 leftover `include:` markers, each containing its `.offer-hero__icon-block` (not `.offer-hero__photo`) and the right `<h1 class="offer-hero__title">`.

- [ ] **Step 5: Commit**

```bash
git add oferta-premium.html oferta-dzierzawa.html vite.config.ts
git commit -m "Add premium and dzierzawa oferta subpages"
git push origin main
```

---

### Task 4: Wire nav dropdown and Home offer-cards to the new subpages

**Files:**
- Modify: `partials/nav.html`
- Modify: `index.html`

**Interfaces:** none (pure link rewiring, no new interfaces).

- [ ] **Step 1: Repoint the nav dropdown links**

In `partials/nav.html`, find:

```html
      <ul class="nav__dropdown-menu" id="nav-oferta-menu">
        <li><a href="/#oferta">Automaty chłodnicze</a></li>
        <li><a href="/#oferta">Automaty przekąskowe</a></li>
        <li><a href="/#oferta">Automaty z napojami</a></li>
        <li><a href="/#oferta">Automaty kawowe</a></li>
        <li><a href="/#oferta">Automaty premium</a></li>
        <li><a href="/#oferta">Dzierżawa automatów</a></li>
      </ul>
```

Replace it with:

```html
      <ul class="nav__dropdown-menu" id="nav-oferta-menu">
        <li><a href="/oferta-chlodnicze.html">Automaty chłodnicze</a></li>
        <li><a href="/oferta-przekaskowe.html">Automaty przekąskowe</a></li>
        <li><a href="/oferta-napoje.html">Automaty z napojami</a></li>
        <li><a href="/oferta-kawa.html">Automaty kawowe</a></li>
        <li><a href="/oferta-premium.html">Automaty premium</a></li>
        <li><a href="/oferta-dzierzawa.html">Dzierżawa automatów</a></li>
      </ul>
```

- [ ] **Step 2: Repoint the "Automaty chłodnicze" Home offer-card**

In `index.html`, find:

```html
          <a class="offer-card" href="#kontakt">
            <div class="offer-card__media">
              <img src="/vendingfresh_machine.webp" alt="Automat chłodniczy" />
            </div>
```

Replace it with:

```html
          <a class="offer-card" href="/oferta-chlodnicze.html">
            <div class="offer-card__media">
              <img src="/vendingfresh_machine.webp" alt="Automat chłodniczy" />
            </div>
```

- [ ] **Step 3: Repoint the "Automaty przekąskowe" Home offer-card**

In `index.html`, find:

```html
          <a class="offer-card" href="#kontakt">
            <div class="offer-card__media">
              <img src="/offer-przekaskowe.png" alt="Automat przekąskowy" width="350" height="500" loading="lazy" />
            </div>
```

Replace it with:

```html
          <a class="offer-card" href="/oferta-przekaskowe.html">
            <div class="offer-card__media">
              <img src="/offer-przekaskowe.png" alt="Automat przekąskowy" width="350" height="500" loading="lazy" />
            </div>
```

- [ ] **Step 4: Repoint the "Automaty z napojami" Home offer-card**

In `index.html`, find:

```html
          <a class="offer-card" href="#kontakt">
            <div class="offer-card__media">
              <img src="/offer-napoje-fk.png" alt="Automat z napojami" width="350" height="500" loading="lazy" />
            </div>
```

Replace it with:

```html
          <a class="offer-card" href="/oferta-napoje.html">
            <div class="offer-card__media">
              <img src="/offer-napoje-fk.png" alt="Automat z napojami" width="350" height="500" loading="lazy" />
            </div>
```

- [ ] **Step 5: Repoint the "Automaty kawowe" Home offer-card**

In `index.html`, find:

```html
          <a class="offer-card" href="#kontakt">
            <div class="offer-card__media">
              <img src="/offer-kawa-siamonie-series.png" alt="Automat kawowy" width="245" height="350" loading="lazy" />
            </div>
```

Replace it with:

```html
          <a class="offer-card" href="/oferta-kawa.html">
            <div class="offer-card__media">
              <img src="/offer-kawa-siamonie-series.png" alt="Automat kawowy" width="245" height="350" loading="lazy" />
            </div>
```

- [ ] **Step 6: Repoint the "Automaty premium" Home offer-card**

In `index.html`, find:

```html
          <a class="offer-card" href="#kontakt">
            <div class="offer-card__media offer-card__media--icon">
              <svg class="offer-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 8l3 2 5-6 5 6 3-2-2 10H6L4 8z"/>
                <path d="M6 18h12"/>
              </svg>
            </div>
            <div class="offer-card__body">
              <h3>Automaty premium</h3>
```

Replace it with:

```html
          <a class="offer-card" href="/oferta-premium.html">
            <div class="offer-card__media offer-card__media--icon">
              <svg class="offer-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 8l3 2 5-6 5 6 3-2-2 10H6L4 8z"/>
                <path d="M6 18h12"/>
              </svg>
            </div>
            <div class="offer-card__body">
              <h3>Automaty premium</h3>
```

- [ ] **Step 7: Repoint the "Dzierżawa automatów" Home offer-card**

In `index.html`, find:

```html
          <a class="offer-card" href="#kontakt">
            <div class="offer-card__media offer-card__media--icon">
              <svg class="offer-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4v5h5"/>
                <path d="M20 20v-5h-5"/>
                <path d="M5.5 15a7 7 0 0 0 12.3 2.5M18.5 9a7 7 0 0 0-12.3-2.5"/>
              </svg>
            </div>
            <div class="offer-card__body">
              <h3>Dzierżawa automatów</h3>
```

Replace it with:

```html
          <a class="offer-card" href="/oferta-dzierzawa.html">
            <div class="offer-card__media offer-card__media--icon">
              <svg class="offer-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4v5h5"/>
                <path d="M20 20v-5h-5"/>
                <path d="M5.5 15a7 7 0 0 0 12.3 2.5M18.5 9a7 7 0 0 0-12.3-2.5"/>
              </svg>
            </div>
            <div class="offer-card__body">
              <h3>Dzierżawa automatów</h3>
```

- [ ] **Step 8: Build and verify**

Run: `npm run build`, then `grep -o 'href="/oferta-[a-z-]*\.html"' dist/index.html | sort -u`
Expected: 6 distinct lines, one per subpage (`/oferta-chlodnicze.html`, `/oferta-dzierzawa.html`, `/oferta-kawa.html`, `/oferta-napoje.html`, `/oferta-premium.html`, `/oferta-przekaskowe.html`). Since `dist/index.html` is the built output where `<!-- include:nav.html -->` has already been expanded, this single grep confirms both the nav dropdown (6 links) and the offer-grid cards (6 more links) were correctly repointed — 12 total occurrences across the 6 distinct URLs.

- [ ] **Step 9: Dev server spot-check**

Run: `npm run dev`, then `curl -s http://localhost:5173/polityka.html | grep -o 'href="/oferta-[a-z-]*\.html"' | sort -u`
Expected: same 6 distinct subpage URLs — confirms the nav dropdown (shared via the partial) points to the new subpages from a non-Home page too, not just from `index.html`. Stop the dev server afterward.

- [ ] **Step 10: Commit**

```bash
git add partials/nav.html index.html
git commit -m "Point nav dropdown and Home offer-cards at the new oferta subpages"
git push origin main
```

---

### Task 5: Full verification pass

**Files:** none (verification only; fix forward if something's broken)

- [ ] **Step 1: Run the full automated suite**

Run, in order:
1. `npx tsc --noEmit` — expect no errors.
2. `npm run test` — expect the existing 4 `resolveIncludes` tests to still pass (this plan adds no new automated tests — it's markup/content, not logic).
3. `npm run build` — expect success, all 9 entries present in `dist/` (`index.html`, `polityka.html`, `rodo.html`, `oferta-chlodnicze.html`, `oferta-przekaskowe.html`, `oferta-napoje.html`, `oferta-kawa.html`, `oferta-premium.html`, `oferta-dzierzawa.html`), zero leftover `include:` markers across all of them (`grep -rc "include:" dist/*.html` → all zeros).

- [ ] **Step 2: Manual walk of the spec's verification checklist**

Run `npm run dev` and check:
- Each of the 6 subpages renders its hero (photo or icon block, matching Task 1-3's assignment), its 3 benefit cards with the right icons/copy, and the shared CTA section, nav, and footer.
- The nav "Oferta" dropdown, opened from any of the 9 pages, links to the correct 6 subpages (spot-check from `index.html` and from one subpage, e.g. `oferta-kawa.html`, to confirm the dropdown is identical everywhere since it comes from the shared partial).
- Home's `oferta` section still shows the same 6 cards with the same images/copy as before, but each card now links to its matching subpage instead of `#kontakt`.
- Each subpage's own "Zamów wycenę" button (in its hero) scrolls to that same page's CTA section (`#kontakt`), not to Home.
- Footer's "Oferta" menu link still goes to `/#oferta` (Home's overview section) — unchanged, per the spec.

Stop the dev server afterward.

- [ ] **Step 3: Fix forward if anything's off, then final commit**

If Step 2 surfaces an issue, fix it directly (small targeted edit), re-run Step 1 and the relevant part of Step 2, then:

```bash
git add -A
git commit -m "Fix oferta subpages verification findings"
git push origin main
```

If nothing needed fixing, no commit is required for this task.

---

## Self-review notes

- **Spec coverage:** every section of the design spec maps to a task — page list/scope (Tasks 1-3, one file per row of the spec's table), shared page structure/`.offer-hero` component (Task 1), final copy per page (Tasks 1-3, verbatim from spec section 3), nav/footer/Home wiring (Task 4), build registration (Tasks 1-3 incrementally), full verification (Task 5). The spec's "poza zakresem" list (photo galleries, hard technical data, active-nav-state, plugin variable-substitution) has no corresponding task, matching its explicit exclusion.
- **Placeholder scan:** no TBD/TODO; all 6 pages carry their final spec copy verbatim, all 18 benefit icons are assigned to specific existing SVG markup (no "pick an icon" placeholders).
- **Type consistency:** every subpage uses the same `<!-- include:nav.html -->` / `<!-- include:footer.html -->` markers and `src="/src/placeholder.ts"` script tag already established and tested by the architecture-foundation plan — no new interfaces invented. `vite.config.ts`'s incremental `input` keys (`ofertaChlodnicze`, `ofertaPrzekaskowe`, `ofertaNapoje`, `ofertaKawa`, `ofertaPremium`, `ofertaDzierzawa`) are unique and consistently named across Tasks 1-3.
- **Icon reuse check:** confirmed no single subpage repeats the same benefit icon twice within its own 3-card grid (visual variety), while every icon used is one of the 6 already defined in `index.html`'s why-cards — no new icon artwork introduced.
- **Scope:** single cohesive subsystem (6 content pages + their wiring), no unrelated refactors bundled in.
