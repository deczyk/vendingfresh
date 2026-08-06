# VendingFresh Multi-page Architecture Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let future pages (oferta subpages, realizacje, o nas, blog) share one nav/footer and one working cross-page nav, instead of copy-pasting markup into every new HTML file.

**Architecture:** A small custom Vite plugin (`transformIndexHtml` hook) substitutes `<!-- include:NAME.html -->` markers in each page's HTML with the contents of `partials/nav.html` / `partials/footer.html` at both dev and build time. Nav's client-side behavior (hamburger + dropdown toggle) moves into a shared `src/nav.ts`, wrapped by `src/pageInit.ts` so every page — Home or a plain placeholder — bootstraps identically.

**Tech Stack:** Vite 5, TypeScript (strict), Vitest 4, plain HTML (no framework/SSG).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-06-vendingfresh-multipage-architecture-design.md` — every requirement below traces back to it.
- Working directly on `main`, no isolated worktree/branch — standing user instruction for this repo (commit + push after every task, don't ask each time).
- Flat `.html` files at project root only (no subdirectories, no clean-URL rewrites) — established convention, out of scope to change.
- Nav/footer links to Home sections use absolute `/#anchor`; links to real pages use absolute `/path.html`. This convention applies only to the shared `nav`/footer "Menu" column — in-page content links (hero CTA, offer-card links, FAQ) are untouched.
- No active-page highlighting in nav (YAGNI — no nav item points to a standalone page yet).
- No CSS split per page — one global `src/style.css` stays.
- No new runtime dependencies. The include mechanism is a small (~30 line) custom plugin, not a library.
- `tsconfig.json`'s `include` is `["src"]` only; `vite.config.ts` and anything it imports (like the new plugin) are loaded by Vite's own Node/esbuild config loader, not `tsc` — this already the case for `vite.config.ts` today (it uses `__dirname` directly), so the new plugin file follows the same precedent.

---

### Task 1: `html-include` Vite plugin (TDD)

**Files:**
- Create: `vite-plugins/html-include.ts`
- Test: `vite-plugins/html-include.test.ts`

**Interfaces:**
- Produces: `resolveIncludes(html: string, partials: Map<string, string>): string` — pure function, throws `Error` when a marker's partial name isn't in `partials`.
- Produces: `htmlInclude(partialsDir: string): Plugin` — Vite plugin factory; `partialsDir` is an absolute path to the directory holding partial `.html` files.

- [ ] **Step 1: Write the failing tests**

Create `vite-plugins/html-include.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { resolveIncludes } from './html-include';

describe('resolveIncludes', () => {
  it('replaces a single include marker with the partial content', () => {
    const html = '<body><!-- include:nav.html --></body>';
    const partials = new Map([['nav.html', '<nav>NAV</nav>']]);

    expect(resolveIncludes(html, partials)).toBe('<body><nav>NAV</nav></body>');
  });

  it('replaces multiple include markers in one document', () => {
    const html = '<!-- include:nav.html --><main>content</main><!-- include:footer.html -->';
    const partials = new Map([
      ['nav.html', '<nav>NAV</nav>'],
      ['footer.html', '<footer>FOOTER</footer>'],
    ]);

    expect(resolveIncludes(html, partials)).toBe(
      '<nav>NAV</nav><main>content</main><footer>FOOTER</footer>',
    );
  });

  it('returns the document unchanged when there is no include marker', () => {
    const html = '<body><main>plain page</main></body>';

    expect(resolveIncludes(html, new Map())).toBe(html);
  });

  it('throws a descriptive error when a referenced partial is missing', () => {
    const html = '<!-- include:missing.html -->';

    expect(() => resolveIncludes(html, new Map())).toThrow(/missing\.html/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `vite-plugins/html-include.ts` does not exist yet (`Cannot find module './html-include'` or similar).

- [ ] **Step 3: Implement `resolveIncludes` and the plugin**

Create `vite-plugins/html-include.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

const INCLUDE_PATTERN = /<!--\s*include:([\w.-]+\.html)\s*-->/g;

export function resolveIncludes(html: string, partials: Map<string, string>): string {
  return html.replace(INCLUDE_PATTERN, (match, partialName: string) => {
    const partial = partials.get(partialName);
    if (partial === undefined) {
      const available = Array.from(partials.keys()).join(', ') || '(none)';
      throw new Error(
        `html-include: partial "${partialName}" referenced by "${match}" was not found. ` +
          `Available partials: ${available}`,
      );
    }
    return partial;
  });
}

export function htmlInclude(partialsDir: string): Plugin {
  return {
    name: 'html-include',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string): string {
        const partials = new Map<string, string>();
        for (const [, partialName] of html.matchAll(INCLUDE_PATTERN)) {
          const filePath = resolve(partialsDir, partialName);
          partials.set(partialName, readFileSync(filePath, 'utf-8'));
        }
        return resolveIncludes(html, partials);
      },
    },
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test`
Expected: PASS — all 4 `resolveIncludes` tests green.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit vite-plugins/html-include.ts vite-plugins/html-include.test.ts --module ESNext --moduleResolution Bundler --target ES2020 --lib ES2020,DOM --strict --skipLibCheck`
Expected: no errors. (This file isn't covered by the project's `tsconfig.json` `include`, matching the existing precedent for `vite.config.ts` — this ad hoc check is just a sanity pass; `npm run build`'s `tsc` step won't touch it.)

- [ ] **Step 6: Commit**

```bash
git add vite-plugins/html-include.ts vite-plugins/html-include.test.ts
git commit -m "Add html-include Vite plugin with resolveIncludes tests"
git push origin main
```

---

### Task 2: Extract nav/footer partials and wire the plugin into `index.html`

**Files:**
- Create: `partials/nav.html`
- Create: `partials/footer.html`
- Modify: `vite.config.ts`
- Modify: `index.html:16-45` (nav block), `index.html:278-324` (footer block, line numbers pre-edit)

**Interfaces:**
- Consumes: `htmlInclude` from `vite-plugins/html-include.ts` (Task 1).
- Produces: `partials/nav.html` and `partials/footer.html`, consumed by `index.html` now and by `polityka.html`/`rodo.html` in Task 4.

- [ ] **Step 1: Create `partials/nav.html`**

```html
<nav class="nav">
  <a class="nav__brand" href="/#top">
    <img class="nav__logo" src="/vendingfresh_logo_full_web.png" alt="VendingFresh" />
  </a>
  <button class="nav__toggle" type="button" id="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Otwórz menu">
    <svg class="nav__toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  </button>
  <ul class="nav__links" id="nav-links">
    <li><a href="/#top">Home</a></li>
    <li class="nav__item--dropdown" id="nav-oferta">
      <button class="nav__dropdown-toggle" type="button" aria-expanded="false" aria-controls="nav-oferta-menu">
        Oferta
        <svg class="nav__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <ul class="nav__dropdown-menu" id="nav-oferta-menu">
        <li><a href="/#oferta">Automaty chłodnicze</a></li>
        <li><a href="/#oferta">Automaty przekąskowe</a></li>
        <li><a href="/#oferta">Automaty z napojami</a></li>
        <li><a href="/#oferta">Automaty kawowe</a></li>
        <li><a href="/#oferta">Automaty premium</a></li>
        <li><a href="/#oferta">Dzierżawa automatów</a></li>
      </ul>
    </li>
    <li><a href="/#kontakt">Kontakt</a></li>
  </ul>
</nav>
```

- [ ] **Step 2: Create `partials/footer.html`**

```html
<footer class="footer">
  <div class="footer__inner">
    <div class="footer__brand">
      <img src="/vendingfresh_logo_full_web.png" alt="VendingFresh" />
      <p>Nowoczesne automaty vendingowe dla firm — świeżość, jakość i zaufanie w każdym punkcie sprzedaży.</p>
      <div class="footer__social">
        <!-- TODO: podmienić na realne linki do profili -->
        <a href="#" aria-label="Facebook">
          <svg class="footer__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M15 8h-2a2 2 0 0 0-2 2v2H9v3h2v7h3v-7h2.2l.8-3H14v-1.5c0-.4.3-.7.7-.7H16V8z"/>
          </svg>
        </a>
        <a href="#" aria-label="LinkedIn">
          <svg class="footer__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <rect x="4" y="9" width="3" height="9"/>
            <circle cx="5.5" cy="5.5" r="1.5"/>
            <path d="M11 18v-6a2 2 0 0 1 4 0v6M11 12v6"/>
          </svg>
        </a>
      </div>
    </div>
    <div class="footer__col">
      <h4>Menu</h4>
      <ul>
        <li><a href="/#top">Home</a></li>
        <li><a href="/#oferta">Oferta</a></li>
        <li><a href="/#kontakt">Kontakt</a></li>
      </ul>
    </div>
    <div class="footer__col">
      <h4>Kontakt</h4>
      <ul>
        <li><a href="mailto:kontakt@vendingfresh.pl">kontakt@vendingfresh.pl</a></li>
        <li><a href="tel:+48690000923">+48 690 000 923</a></li>
        <li>Pon–Pt 7:00–18:00</li>
      </ul>
    </div>
    <div class="footer__col">
      <h4>Informacje</h4>
      <ul>
        <li><a href="/polityka.html">Polityka prywatności</a></li>
        <li><a href="/rodo.html">RODO</a></li>
      </ul>
    </div>
  </div>
  <p class="footer__bottom">&copy; 2026 VendingFresh. Wszystkie prawa zastrzeżone.</p>
</footer>
```

- [ ] **Step 3: Wire the plugin into `vite.config.ts`**

Replace the full contents of `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { htmlInclude } from './vite-plugins/html-include';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [htmlInclude(resolve(__dirname, 'partials'))],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        polityka: resolve(__dirname, 'polityka.html'),
        rodo: resolve(__dirname, 'rodo.html'),
      },
    },
  },
});
```

- [ ] **Step 4: Replace the inline nav block in `index.html` with an include marker**

In `index.html`, find this block (currently lines 16-45):

```html
    <nav class="nav">
      <a class="nav__brand" href="#top">
        <img class="nav__logo" src="/vendingfresh_logo_full_web.png" alt="VendingFresh" />
      </a>
      <button class="nav__toggle" type="button" id="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Otwórz menu">
        <svg class="nav__toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <ul class="nav__links" id="nav-links">
        <li><a href="#top">Home</a></li>
        <li class="nav__item--dropdown" id="nav-oferta">
          <button class="nav__dropdown-toggle" type="button" aria-expanded="false" aria-controls="nav-oferta-menu">
            Oferta
            <svg class="nav__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <ul class="nav__dropdown-menu" id="nav-oferta-menu">
            <li><a href="#oferta">Automaty chłodnicze</a></li>
            <li><a href="#oferta">Automaty przekąskowe</a></li>
            <li><a href="#oferta">Automaty z napojami</a></li>
            <li><a href="#oferta">Automaty kawowe</a></li>
            <li><a href="#oferta">Automaty premium</a></li>
            <li><a href="#oferta">Dzierżawa automatów</a></li>
          </ul>
        </li>
        <li><a href="#kontakt">Kontakt</a></li>
      </ul>
    </nav>
```

Replace it with:

```html
    <!-- include:nav.html -->
```

- [ ] **Step 5: Replace the inline footer block in `index.html` with an include marker**

In `index.html`, find this block (currently lines 278-324):

```html
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <img src="/vendingfresh_logo_full_web.png" alt="VendingFresh" />
          <p>Nowoczesne automaty vendingowe dla firm — świeżość, jakość i zaufanie w każdym punkcie sprzedaży.</p>
          <div class="footer__social">
            <!-- TODO: podmienić na realne linki do profili -->
            <a href="#" aria-label="Facebook">
              <svg class="footer__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M15 8h-2a2 2 0 0 0-2 2v2H9v3h2v7h3v-7h2.2l.8-3H14v-1.5c0-.4.3-.7.7-.7H16V8z"/>
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg class="footer__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="4" y="9" width="3" height="9"/>
                <circle cx="5.5" cy="5.5" r="1.5"/>
                <path d="M11 18v-6a2 2 0 0 1 4 0v6M11 12v6"/>
              </svg>
            </a>
          </div>
        </div>
        <div class="footer__col">
          <h4>Menu</h4>
          <ul>
            <li><a href="#top">Home</a></li>
            <li><a href="#oferta">Oferta</a></li>
            <li><a href="#kontakt">Kontakt</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h4>Kontakt</h4>
          <ul>
            <li><a href="mailto:kontakt@vendingfresh.pl">kontakt@vendingfresh.pl</a></li>
            <li><a href="tel:+48690000923">+48 690 000 923</a></li>
            <li>Pon–Pt 7:00–18:00</li>
          </ul>
        </div>
        <div class="footer__col">
          <h4>Informacje</h4>
          <ul>
            <li><a href="/polityka.html">Polityka prywatności</a></li>
            <li><a href="/rodo.html">RODO</a></li>
          </ul>
        </div>
      </div>
      <p class="footer__bottom">&copy; 2026 VendingFresh. Wszystkie prawa zastrzeżone.</p>
    </footer>
```

Replace it with:

```html
    <!-- include:footer.html -->
```

- [ ] **Step 6: Build and verify the include was applied**

Run: `npm run build`
Expected: succeeds. Then run `grep -c "include:" dist/index.html` (or open the file) — expect **0** matches (no raw markers left) and confirm `dist/index.html` contains `<nav class="nav">` and `<footer class="footer">` with the `/#...` links from the partials.

- [ ] **Step 7: Dev server spot-check**

Run: `npm run dev`, then in another terminal: `curl -s http://localhost:5173/ | grep -o 'href="/#[a-z]*"'`
Expected: prints `href="/#top"`, `href="/#oferta"` (x6), `href="/#kontakt"` — confirming the dev-server-transformed HTML also has the include applied. Stop the dev server afterward.

- [ ] **Step 8: Commit**

```bash
git add partials/nav.html partials/footer.html vite.config.ts index.html
git commit -m "Extract nav/footer into partials, wire html-include plugin into index.html"
git push origin main
```

---

### Task 3: Shared TS bootstrap (`nav.ts`, `pageInit.ts`)

**Files:**
- Create: `src/nav.ts`
- Create: `src/pageInit.ts`
- Modify: `src/main.ts` (full rewrite)

**Interfaces:**
- Produces: `initNav(): void` from `src/nav.ts` — wires up hamburger toggle, dropdown toggle, and close-on-link-click for the nav markup defined in `partials/nav.html` (ids `nav-toggle`, `nav-links`, `nav-oferta`, class `.nav__dropdown-toggle`, `.nav__links a`).
- Produces: `initSharedPage(): void` from `src/pageInit.ts` — imports `./style.css`, adds `js-ready` to `document.documentElement`, calls `initNav()`.
- Consumes (Task 4): `placeholder.ts` will call `initSharedPage()`.

- [ ] **Step 1: Create `src/nav.ts`**

```ts
export function initNav(): void {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const dropdown = document.getElementById('nav-oferta');
  const dropdownToggle = dropdown?.querySelector<HTMLButtonElement>('.nav__dropdown-toggle');
  if (dropdown && dropdownToggle) {
    dropdownToggle.addEventListener('click', () => {
      const isOpen = dropdown.classList.toggle('is-open');
      dropdownToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('.nav__links a').forEach((link) => {
    link.addEventListener('click', () => {
      links?.classList.remove('is-open');
      dropdown?.classList.remove('is-open');
    });
  });
}
```

This is a verbatim extraction of the `initNav` function currently in `src/main.ts` — no behavior change.

- [ ] **Step 2: Create `src/pageInit.ts`**

```ts
import './style.css';
import { initNav } from './nav';

export function initSharedPage(): void {
  document.documentElement.classList.add('js-ready');
  initNav();
}
```

- [ ] **Step 3: Rewrite `src/main.ts`**

Replace the full contents of `src/main.ts`:

```ts
import { initSharedPage } from './pageInit';

function initScrollReveal(): void {
  const targets = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 },
  );
  targets.forEach((target) => observer.observe(target));
}

initSharedPage();
initScrollReveal();
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Build and manually verify Home still works**

Run: `npm run build`, then `npm run dev`. Open `http://localhost:5173/` in a browser (or `curl` the served HTML/JS if no browser is available) and confirm:
- The page loads with no console errors.
- Clicking the hamburger (narrow viewport) toggles the mobile menu.
- Hovering/clicking "Oferta" opens the dropdown.
- Scrolling reveals the `.reveal` sections (fade-in still works).

Stop the dev server afterward.

- [ ] **Step 6: Commit**

```bash
git add src/nav.ts src/pageInit.ts src/main.ts
git commit -m "Extract nav init and shared page bootstrap into their own modules"
git push origin main
```

---

### Task 4: Migrate `polityka.html` and `rodo.html` to the shared layout

**Files:**
- Modify: `polityka.html` (full rewrite)
- Modify: `rodo.html` (full rewrite)
- Modify: `src/placeholder.ts` (full rewrite)

**Interfaces:**
- Consumes: `partials/nav.html`, `partials/footer.html` (Task 2), `initSharedPage` from `src/pageInit.ts` (Task 3).

- [ ] **Step 1: Rewrite `src/placeholder.ts`**

Replace the full contents of `src/placeholder.ts`:

```ts
import { initSharedPage } from './pageInit';

initSharedPage();
```

- [ ] **Step 2: Rewrite `polityka.html`**

Replace the full contents of `polityka.html`:

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Polityka prywatności — VendingFresh</title>
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
      <p>Pracujemy nad polityką prywatności — wróć tu wkrótce.</p>
      <a class="btn btn--primary" href="/">Wróć na stronę główną</a>
    </main>
    <!-- include:footer.html -->
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Rewrite `rodo.html`**

Replace the full contents of `rodo.html`:

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RODO — VendingFresh</title>
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
      <p>Pracujemy nad informacją o przetwarzaniu danych osobowych (RODO) — wróć tu wkrótce.</p>
      <a class="btn btn--primary" href="/">Wróć na stronę główną</a>
    </main>
    <!-- include:footer.html -->
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Build and verify both pages got the include**

Run: `npm run build`, then check both outputs:
`grep -c "include:" dist/polityka.html dist/rodo.html`
Expected: **0** matches in both files; both contain `<nav class="nav">` and `<footer class="footer">`.

- [ ] **Step 6: Dev server spot-check — cross-page nav**

Run: `npm run dev`. Then:
`curl -s http://localhost:5173/polityka.html | grep -o 'href="/#[a-z]*"'`
Expected: same `/#top`, `/#oferta` (x6), `/#kontakt` set as on Home — confirming `polityka.html` now carries a fully working nav that points back to Home's sections. Repeat for `rodo.html`. Also confirm the placeholder page's own content (`<h1>Strona w przygotowaniu</h1>`, the correct paragraph text per page) is unchanged. Stop the dev server afterward.

- [ ] **Step 7: Commit**

```bash
git add polityka.html rodo.html src/placeholder.ts
git commit -m "Give polityka/rodo placeholders the shared nav and footer"
git push origin main
```

---

### Task 5: Full verification pass

**Files:** none (verification only; fix-forward if something's broken)

- [ ] **Step 1: Run the full automated suite**

Run, in order:
1. `npm run test` — expect all `resolveIncludes` tests pass.
2. `npx tsc --noEmit` — expect no errors.
3. `npm run build` — expect success, `dist/index.html`, `dist/polityka.html`, `dist/rodo.html` all present and all free of raw `include:` markers (`grep -rc "include:" dist/*.html` → all zeros).

- [ ] **Step 2: Manual walk of the spec's verification checklist**

Run `npm run dev` and check, across all three pages (`/`, `/polityka.html`, `/rodo.html`):
- Nav renders identically (branding, links, "Oferta" dropdown, mobile hamburger) on all three.
- From `polityka.html` and `rodo.html`, clicking a nav link (e.g. "Oferta" → "Automaty kawowe", or footer "Kontakt") navigates to `/` and lands on the right section.
- From `/`, nav links still behave as before (no full page reload, same in-page scroll).
- Footer renders identically on all three pages, including the "Informacje" links to `/polityka.html` and `/rodo.html`.
- `polityka.html`/`rodo.html` still show their original placeholder content (logo, heading, page-specific paragraph, "Wróć na stronę główną" button) inside the new layout.

Stop the dev server afterward.

- [ ] **Step 3: Fix forward if anything's off, then final commit**

If Step 2 surfaces an issue, fix it directly (small targeted edit), re-run Step 1 and the relevant part of Step 2, then:

```bash
git add -A
git commit -m "Fix multi-page architecture verification findings"
git push origin main
```

If nothing needed fixing, no commit is required for this task — the work is already pushed from Tasks 1-4.

---

## Self-review notes

- **Spec coverage:** every section of the design spec maps to a task — architecture/include mechanism + page-add recipe (Task 1-2), URL/link convention (Task 2, `partials/nav.html` + `partials/footer.html` content), shared TS modules (Task 3), migration of existing pages (Task 2 for `index.html`, Task 4 for `polityka.html`/`rodo.html`), plugin implementation + tests (Task 1), full verification (Task 5). The spec's "poza zakresem" list (new page content, active-nav-state, clean URLs, per-page CSS, SSG migration) has no corresponding task, matching its explicit exclusion.
- **Placeholder scan:** no TBD/TODO left except the pre-existing, intentionally-untouched `<!-- TODO: podmienić na realne linki -->` comment carried into `partials/footer.html` verbatim from `index.html` — not a plan gap.
- **Type consistency:** `initNav` (Task 3, `src/nav.ts`) has the exact same name/signature as the function it replaces in `src/main.ts`; `initSharedPage` (Task 3, `src/pageInit.ts`) is the only export both `main.ts` and `placeholder.ts` (Task 3 and Task 4) import, and its signature (`(): void`) is consistent everywhere it's referenced. `resolveIncludes`/`htmlInclude` (Task 1) are used with matching signatures in `vite.config.ts` (Task 2).
- **Scope:** single cohesive subsystem (multi-page layout foundation), no unrelated refactors bundled in.
