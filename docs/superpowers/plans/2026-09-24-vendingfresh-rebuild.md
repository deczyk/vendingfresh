# VendingFresh Rebuild — Etap 1 (struktura, strona główna, konfigurator) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the VendingFresh repo (currently only `polityka.html`) with a Vite multi-page skeleton, a full homepage (`index.html`), and a 9-step lead-capture configurator (`konfigurator.html`), matching `docs/superpowers/specs/2026-09-24-vendingfresh-rebuild-design.md`.

**Architecture:** Vite multi-page static build (no UI framework) with a custom `html-include` plugin for shared `nav.html`/`footer.html` partials, plain TypeScript for DOM wiring (nav, calculator, configurator, cookie banner), a Vercel serverless function backed by Neon Postgres for lead capture, and `vercel.json` rewrites for clean URLs (no redirects).

**Tech Stack:** Vite, TypeScript, Vitest, `@neondatabase/serverless`, Vercel Functions, Vercel rewrites.

## Global Constraints

- Say "partner Sielaff" everywhere — never "dystrybutor" or "przedstawiciel".
- No prices or price ranges anywhere on the site — every quote is "wycena indywidualna".
- Palette: `--color-primary: #008B8B` (DarkCyan), `--color-secondary: #20B2AA` (LightSeaGreen), `--color-accent: #D4F26A` (limonka), text `--color-ink: #0A2E2E`, background `#FFFFFF`.
- "Realizacje" is excluded from the nav menu at this stage.
- Every lead record sent to the backend includes `"marka": "vendingfresh"`.
- Telegram notifications are prefixed with `[VendingFresh]`.
- New routes are served via `vercel.json` **rewrites**, never redirects (avoids the indexing problem from a past redirect chain on sklepzastodola.pl).
- Configurator step 9 requires phone-or-email **and** an explicit RODO consent checkbox before submit.
- Meta Pixel only loads after the user accepts the cookie banner.
- Logo assets already exist at `public/vendingfresh_logo.png` (transparent, horizontal, for nav), `public/vendingfresh_icon.png` (square badge with its own teal background, for footer/favicon), `public/vendingfresh_logo_white_bg.png` (white-background spare, used for `og:image`). Do not regenerate them.

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run test` scripts consumed by every later task's verification steps.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "vendingfresh",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run --passWithNoTests"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "vite-plugins", "vite.config.ts"]
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 4: Create `public/robots.txt`**

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://vendingfresh.pl/sitemap.xml
```

- [ ] **Step 5: Create `public/sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vendingfresh.pl/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://vendingfresh.pl/konfigurator</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://vendingfresh.pl/polityka</loc>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
</urlset>
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: completes with no error, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 7: Commit**

```bash
git add package.json tsconfig.json vitest.config.ts public/robots.txt public/sitemap.xml package-lock.json
git commit -m "chore: scaffold VendingFresh rebuild (package.json, tsconfig, vitest)"
```

---

### Task 2: Restore the `html-include` Vite plugin

**Files:**
- Create: `vite-plugins/html-include.ts`
- Create: `vite-plugins/html-include.test.ts`

**Interfaces:**
- Produces: `htmlInclude(partialsDir: string): Plugin` — consumed by Task 3's `vite.config.ts`. `resolveIncludes(html: string, partials: Map<string, string>): string` — pure function used by the test.

- [ ] **Step 1: Write the failing test**

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

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run vite-plugins/html-include.test.ts`
Expected: FAIL — `Cannot find module './html-include'`.

- [ ] **Step 3: Write the plugin implementation**

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

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run vite-plugins/html-include.test.ts`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add vite-plugins/html-include.ts vite-plugins/html-include.test.ts
git commit -m "feat: restore html-include Vite plugin for shared partials"
```

---

### Task 3: Vite and Vercel configuration

**Files:**
- Create: `vite.config.ts`
- Create: `vercel.json`

**Interfaces:**
- Consumes: `htmlInclude(partialsDir: string): Plugin` from Task 2.

- [ ] **Step 1: Create `vite.config.ts`**

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
        konfigurator: resolve(__dirname, 'konfigurator.html'),
        polityka: resolve(__dirname, 'polityka.html'),
      },
    },
  },
});
```

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/konfigurator", "destination": "/konfigurator.html" },
    { "source": "/polityka", "destination": "/polityka.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)\\.(png|jpg|jpeg|webp|svg|ico)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400, stale-while-revalidate=604800" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow, noarchive" }
      ]
    }
  ]
}
```

- [ ] **Step 3: Type-check the config**

Run: `npx tsc --noEmit`
Expected: no errors. (`index.html`/`konfigurator.html` don't exist yet — that's fine, `rollupOptions.input` only fails at *build* time, not type-check time. The full `vite build` is verified in Task 12 once every entry file exists.)

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts vercel.json
git commit -m "chore: add Vite multi-page config and Vercel rewrites for clean URLs"
```

---

### Task 4: Design system stylesheet

**Files:**
- Create: `src/style.css`

- [ ] **Step 1: Create `src/style.css`**

```css
:root {
  --color-primary: #008B8B;
  --color-secondary: #20B2AA;
  --color-accent: #D4F26A;
  --color-ink: #0A2E2E;
  --color-bg: #FFFFFF;
  --color-bg-alt: #F4FBFA;
  --radius: 10px;
  --max-width: 1160px;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: var(--color-ink);
  background: var(--color-bg);
  line-height: 1.5;
}

img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }

.wrap {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
}

.section { padding: 64px 0; }
.section:nth-of-type(even) { background: var(--color-bg-alt); }

.eyebrow {
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 8px;
}

h1, h2, h3 { margin: 0 0 16px; line-height: 1.2; }
h1 { font-size: clamp(32px, 5vw, 48px); }
h2 { font-size: clamp(26px, 4vw, 36px); }
h2 em, h1 em { color: var(--color-primary); font-style: italic; }

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: var(--radius);
  font-weight: 600;
  border: 2px solid transparent;
  cursor: pointer;
  font-size: 15px;
}
.btn--primary { background: var(--color-accent); color: var(--color-ink); }
.btn--primary:hover { filter: brightness(0.95); }
.btn--secondary { background: transparent; color: var(--color-primary); border-color: var(--color-primary); }
.btn--secondary:hover { background: var(--color-bg-alt); }

/* Marquee */
.marquee {
  background: var(--color-primary);
  color: #fff;
  overflow: hidden;
  white-space: nowrap;
  padding: 8px 0;
  font-size: 13px;
}
.marquee__track {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 30s linear infinite;
}
.marquee__track span { margin: 0 12px; }
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Nav */
.site-header { border-bottom: 1px solid #e5efee; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; position: relative; }
.nav__logo-img { height: 40px; width: auto; }
.nav__links { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.nav__links a { font-weight: 500; font-size: 14px; }
.nav__cta { background: var(--color-primary); color: #fff !important; padding: 8px 16px; border-radius: var(--radius); }
.nav__toggle { display: none; flex-direction: column; gap: 4px; background: none; border: none; cursor: pointer; }
.nav__toggle span { width: 24px; height: 2px; background: var(--color-ink); }
.nav__dropdown { position: relative; }
.nav__dropdown-toggle { background: none; border: none; font: inherit; cursor: pointer; padding: 0; }
.nav__dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #e5efee;
  border-radius: var(--radius);
  padding: 8px;
  min-width: 200px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  z-index: 10;
}
.nav__dropdown.is-open .nav__dropdown-menu { display: block; }
.nav__dropdown-menu a { display: block; padding: 8px 12px; border-radius: 6px; }
.nav__dropdown-menu a:hover { background: var(--color-bg-alt); }

@media (max-width: 860px) {
  .nav__toggle { display: flex; }
  .nav__links {
    display: none;
    flex-direction: column;
    align-items: flex-start;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    padding: 16px 24px;
    border-bottom: 1px solid #e5efee;
  }
  .nav__links.is-open { display: flex; }
}

/* Hero */
.hero { background: var(--color-primary); color: #fff; padding: 72px 0; }
.hero .eyebrow { color: var(--color-accent); }
.hero__subtitle { font-size: 18px; max-width: 640px; opacity: 0.92; }
.hero__cta { display: flex; gap: 16px; margin: 24px 0 40px; flex-wrap: wrap; }
.hero .btn--secondary { color: #fff; border-color: #fff; }
.hero .btn--secondary:hover { background: rgba(255,255,255,0.1); }

.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; }
.tile {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}
.tile:hover { background: rgba(255,255,255,0.16); }
.tile__icon { display: block; font-size: 28px; margin-bottom: 8px; }

/* Cols / cards */
.cols-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin: 32px 0; }
.col h3 { color: var(--color-primary); }
.problem__punchline { font-size: 20px; font-weight: 600; }

.layers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin: 32px 0; }
.layer { background: #fff; border-radius: var(--radius); padding: 20px; border: 1px solid #e5efee; }
.layer h3 { color: var(--color-primary); font-size: 18px; }

.cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin: 32px 0; }
.product-card, .family-card, .guide-card {
  background: #fff;
  border: 1px solid #e5efee;
  border-radius: var(--radius);
  padding: 20px;
  transition: transform 0.15s ease;
}
.product-card:hover, .guide-card:hover { transform: translateY(-2px); border-color: var(--color-secondary); }
.product-card__icon { font-size: 28px; display: block; margin-bottom: 8px; }

/* Steps */
.steps { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0; }
.step {
  background: #fff;
  border: 1px solid #e5efee;
  border-radius: 999px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.step.is-active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.step__num {
  background: var(--color-accent);
  color: var(--color-ink);
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}
.step-details p { display: none; font-size: 17px; }
.step-details p.is-active { display: block; }

/* Calculator */
.calc-presets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.calc-presets button {
  background: var(--color-bg-alt);
  border: 1px solid var(--color-secondary);
  color: var(--color-primary);
  border-radius: 999px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}
.calc-presets button:hover { background: var(--color-secondary); color: #fff; }
.calc-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; align-items: start; }
.slider-group { margin-bottom: 20px; }
.slider-group label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 14px; }
.slider-group input[type="range"] { width: 100%; accent-color: var(--color-primary); }
.calc-results { background: var(--color-bg-alt); border-radius: var(--radius); padding: 24px; }
.calc-result { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #dcefec; }
.calc-result:last-child { border-bottom: none; }
.calc-result__value { font-weight: 700; }
.calc-result--highlight .calc-result__value { color: var(--color-primary); font-size: 20px; }
.calc-disclaimer { font-size: 13px; opacity: 0.7; margin-top: 24px; }

@media (max-width: 760px) {
  .calc-grid { grid-template-columns: 1fr; }
}

/* Checklist */
.checklist { list-style: none; padding: 0; display: grid; gap: 12px; margin: 24px 0; }
.checklist li { padding-left: 32px; position: relative; font-size: 16px; }
.checklist li::before { content: "\2713"; position: absolute; left: 0; top: 0; color: var(--color-primary); font-weight: 700; }
.checklist__punchline { font-size: 18px; font-weight: 600; }

.check-list { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.check-list li { padding-left: 28px; position: relative; }
.check-list li::before { content: "\2713"; position: absolute; left: 0; color: var(--color-primary); font-weight: 700; }

/* Quote */
.owner-quote blockquote { margin: 0; font-size: 22px; font-style: italic; border-left: 4px solid var(--color-accent); padding-left: 24px; }
.owner-quote footer { margin-top: 12px; font-style: normal; font-weight: 600; opacity: 0.8; }

/* CTA final */
.cta-final { background: var(--color-primary); color: #fff; text-align: center; }
.cta-final .hero__cta { justify-content: center; }

/* Footer */
.site-footer { background: var(--color-ink); color: #fff; padding: 48px 0 24px; }
.footer__icon { width: 48px; height: 48px; margin-bottom: 8px; }
.footer__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; }
.footer__social { display: flex; gap: 12px; margin-top: 8px; }
.footer__links { display: flex; flex-direction: column; gap: 8px; }
.footer__copy { text-align: center; opacity: 0.6; font-size: 13px; margin-top: 32px; }
.site-footer a:hover { color: var(--color-accent); }

/* Placeholder */
.placeholder {
  border: 2px dashed var(--color-secondary);
  border-radius: var(--radius);
  padding: 40px;
  text-align: center;
  color: var(--color-secondary);
  font-size: 14px;
}

/* Cookie banner */
.cookie-banner {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--color-ink);
  color: #fff;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  z-index: 100;
}
.cookie-banner a { text-decoration: underline; }
.cookie-banner__actions { display: flex; gap: 8px; }

/* Konfigurator */
.config-page { padding: 48px 0 96px; }
.config-progress { background: var(--color-bg-alt); border-radius: 999px; height: 8px; overflow: hidden; }
.config-progress__bar { background: var(--color-primary); height: 100%; width: 11%; transition: width 0.2s ease; }
.config-progress__label { font-size: 13px; opacity: 0.7; margin: 8px 0 32px; }
.config-step h2 { color: var(--color-primary); }
.config-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
.config-options label {
  border: 1px solid #e5efee;
  border-radius: var(--radius);
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.config-options label:has(input:checked) { border-color: var(--color-primary); background: var(--color-bg-alt); }
.config-field { display: block; margin-bottom: 16px; font-weight: 600; font-size: 14px; }
.config-field input { display: block; width: 100%; margin-top: 6px; padding: 10px 12px; border: 1px solid #dcefec; border-radius: 8px; font-size: 15px; }
.config-checkbox { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; }
.config-error { color: #C0392B; font-weight: 600; min-height: 20px; }
.config-nav { display: flex; justify-content: space-between; margin-top: 24px; }
.config-result { text-align: center; padding: 48px 0; }
.config-result h2 { color: var(--color-primary); }
```

- [ ] **Step 2: Commit**

```bash
git add src/style.css
git commit -m "feat: add VendingFresh design system stylesheet"
```

---

### Task 5: Shared nav/footer partials and nav wiring

**Files:**
- Create: `partials/nav.html`
- Create: `partials/footer.html`
- Create: `src/main.ts`

**Interfaces:**
- Consumes: `.nav__toggle`, `#nav-links`, `.nav__dropdown-toggle`, `#footer-year`, `#how-steps .step`, `[data-step-detail]` — DOM hooks defined here and in Task 9's `index.html`.

- [ ] **Step 1: Create `partials/nav.html`**

```html
<header class="site-header">
  <div class="wrap nav">
    <a href="/" class="nav__logo">
      <img src="/vendingfresh_logo.png" alt="VendingFresh — automaty z żywnością" class="nav__logo-img">
    </a>
    <nav class="nav__links" id="nav-links">
      <a href="/">Start</a>
      <a href="/konfigurator">Konfigurator</a>
      <div class="nav__dropdown">
        <button class="nav__dropdown-toggle" type="button">Rozwiązania ▾</button>
        <div class="nav__dropdown-menu">
          <a href="/rozwiazania/pieczywo">Pieczywo</a>
          <a href="/rozwiazania/jajka">Jajka</a>
          <a href="/rozwiazania/sery">Sery i nabiał</a>
          <a href="/rozwiazania/ziemniaki-warzywa">Ziemniaki i warzywa</a>
          <a href="/rozwiazania/bio-lokalne">Bio i lokalne</a>
          <a href="/rozwiazania/mieso-dania">Mięso i dania gotowe</a>
          <a href="/rozwiazania/napoje">Napoje</a>
        </div>
      </div>
      <a href="/automaty-sielaff">Automaty Sielaff</a>
      <a href="/jak-dzialamy">Jak działamy</a>
      <a href="/finansowanie">Finansowanie</a>
      <a href="/poradnik">Poradnik</a>
      <a href="/faq">FAQ</a>
      <a href="/kontakt" class="nav__cta">Kontakt</a>
    </nav>
    <button class="nav__toggle" id="nav-toggle" type="button" aria-label="Menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
```

- [ ] **Step 2: Create `partials/footer.html`**

```html
<footer class="site-footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <img src="/vendingfresh_icon.png" alt="VendingFresh" class="footer__icon">
      <p><strong>VendingFresh</strong> — marka Sklep za Stodołą Sp. z o.o.</p>
      <p>Partner Sielaff</p>
    </div>
    <div class="footer__contact">
      <h3>Kontakt</h3>
      <p>Telefon: <a href="tel:+48000000000">[uzupełnić]</a></p>
      <p>E-mail: <a href="mailto:kontakt@vendingfresh.pl">kontakt@vendingfresh.pl</a></p>
      <div class="footer__social">
        <a href="#" aria-label="VendingFresh na Facebooku">Facebook</a>
        <a href="#" aria-label="VendingFresh na Instagramie">Instagram</a>
      </div>
    </div>
    <div class="footer__links">
      <h3>Linki</h3>
      <a href="/polityka">Polityka prywatności</a>
      <a href="https://sklepzastodola.pl" target="_blank" rel="noopener">sklepzastodola.pl — Mlekomaty BRUNIMAT</a>
    </div>
  </div>
  <p class="footer__copy">&copy; <span id="footer-year"></span> Sklep za Stodołą Sp. z o.o. Wszystkie prawa zastrzeżone.</p>
</footer>
```

- [ ] **Step 3: Create `src/main.ts`**

```ts
function initNav(): void {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav__dropdown-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.parentElement?.classList.toggle('is-open');
    });
  });
}

function initFooterYear(): void {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = String(new Date().getFullYear());
}

function initHowSteps(): void {
  const steps = document.querySelectorAll<HTMLButtonElement>('#how-steps .step');
  const details = document.querySelectorAll<HTMLElement>('[data-step-detail]');
  if (steps.length === 0) return;

  steps.forEach((step) => {
    step.addEventListener('click', () => {
      const target = step.dataset.step;
      steps.forEach((s) => s.classList.toggle('is-active', s === step));
      details.forEach((d) => d.classList.toggle('is-active', d.dataset.stepDetail === target));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFooterYear();
  initHowSteps();
});
```

- [ ] **Step 4: Commit**

```bash
git add partials/nav.html partials/footer.html src/main.ts
git commit -m "feat: add shared nav/footer partials and nav interaction wiring"
```

(No automated test — this is DOM wiring against markup that doesn't exist until Task 9. It's verified manually in Task 12's browser walkthrough.)

---

### Task 6: Cookie consent banner and Meta Pixel gate

**Files:**
- Create: `src/cookies.ts`
- Create: `src/cookies.test.ts`

**Interfaces:**
- Produces: `getStoredConsent(storage: Pick<Storage, 'getItem'>): 'accepted' | 'declined' | null`, `loadMetaPixel(pixelId: string): void` — used internally by this file's DOM init, not imported elsewhere.
- Consumes (DOM hooks defined in Task 9): `#cookie-banner`, `#cookie-accept`, `#cookie-decline`.

- [ ] **Step 1: Write the failing test**

Create `src/cookies.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getStoredConsent } from './cookies';

function fakeStorage(value: string | null): Pick<Storage, 'getItem'> {
  return { getItem: () => value };
}

describe('getStoredConsent', () => {
  it('returns null when nothing is stored', () => {
    expect(getStoredConsent(fakeStorage(null))).toBeNull();
  });

  it('returns accepted when stored as accepted', () => {
    expect(getStoredConsent(fakeStorage('accepted'))).toBe('accepted');
  });

  it('returns declined when stored as declined', () => {
    expect(getStoredConsent(fakeStorage('declined'))).toBe('declined');
  });

  it('ignores unexpected values', () => {
    expect(getStoredConsent(fakeStorage('garbage'))).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/cookies.test.ts`
Expected: FAIL — `Cannot find module './cookies'`.

- [ ] **Step 3: Write `src/cookies.ts`**

```ts
const CONSENT_KEY = 'vf_cookie_consent';
const META_PIXEL_ID = 'REPLACE_ME_META_PIXEL_ID';

export type ConsentValue = 'accepted' | 'declined';

export function getStoredConsent(storage: Pick<Storage, 'getItem'>): ConsentValue | null {
  const value = storage.getItem(CONSENT_KEY);
  return value === 'accepted' || value === 'declined' ? value : null;
}

export function loadMetaPixel(pixelId: string): void {
  if (document.getElementById('meta-pixel-script')) return;
  const script = document.createElement('script');
  script.id = 'meta-pixel-script';
  script.textContent = `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
}

function initCookieBanner(): void {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');
  if (!banner || !acceptBtn || !declineBtn) return;

  const stored = getStoredConsent(window.localStorage);
  if (stored === 'accepted') {
    loadMetaPixel(META_PIXEL_ID);
  } else if (stored === null) {
    banner.hidden = false;
  }

  acceptBtn.addEventListener('click', () => {
    window.localStorage.setItem(CONSENT_KEY, 'accepted');
    banner.hidden = true;
    loadMetaPixel(META_PIXEL_ID);
  });

  declineBtn.addEventListener('click', () => {
    window.localStorage.setItem(CONSENT_KEY, 'declined');
    banner.hidden = true;
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCookieBanner);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/cookies.test.ts`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/cookies.ts src/cookies.test.ts
git commit -m "feat: add cookie consent banner with gated Meta Pixel loading"
```

---

### Task 7: Profitability calculator logic

**Files:**
- Create: `src/calculator.ts`
- Create: `src/calculator.test.ts`

**Interfaces:**
- Produces: `CalculatorInputs`, `CalculatorResult`, `calculate(inputs: CalculatorInputs): CalculatorResult`, `CALCULATOR_PRESETS: Record<'piekarnia'|'jajka'|'serowarnia'|'bio', CalculatorInputs>` — used internally by this file's DOM init; `CALCULATOR_PRESETS` keys are consumed by Task 9's `data-preset` button values.
- Consumes (DOM hooks defined in Task 9): `#calc-transactions`, `#calc-basket`, `#calc-margin`, `#calc-investment`, `#calc-costs` (and their `-out` outputs), `#calc-revenue-month`, `#calc-revenue-year`, `#calc-profit`, `#calc-roi`, `[data-preset]`.

- [ ] **Step 1: Write the failing test**

Create `src/calculator.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { calculate, CALCULATOR_PRESETS } from './calculator';

describe('calculate', () => {
  it('computes revenue, profit and ROI for the piekarnia preset', () => {
    const result = calculate(CALCULATOR_PRESETS.piekarnia);
    expect(result.monthlyRevenue).toBe(14400);
    expect(result.yearlyRevenue).toBe(172800);
    expect(result.monthlyProfit).toBeCloseTo(4640);
    expect(result.roiMonths).toBeCloseTo(7.543, 2);
  });

  it('returns null ROI when monthly profit is not positive', () => {
    const result = calculate({
      transactionsPerDay: 1,
      basketValue: 3,
      marginPercent: 5,
      investment: 10000,
      monthlyCosts: 1000,
    });
    expect(result.monthlyProfit).toBeLessThanOrEqual(0);
    expect(result.roiMonths).toBeNull();
  });

  it('exposes all four presets required by the homepage buttons', () => {
    expect(Object.keys(CALCULATOR_PRESETS).sort()).toEqual(['bio', 'jajka', 'piekarnia', 'serowarnia']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/calculator.test.ts`
Expected: FAIL — `Cannot find module './calculator'`.

- [ ] **Step 3: Write `src/calculator.ts`**

```ts
export interface CalculatorInputs {
  transactionsPerDay: number;
  basketValue: number;
  marginPercent: number;
  investment: number;
  monthlyCosts: number;
}

export interface CalculatorResult {
  monthlyRevenue: number;
  yearlyRevenue: number;
  monthlyProfit: number;
  roiMonths: number | null;
}

export function calculate(inputs: CalculatorInputs): CalculatorResult {
  const monthlyRevenue = inputs.transactionsPerDay * inputs.basketValue * 30;
  const monthlyProfit = monthlyRevenue * (inputs.marginPercent / 100) - inputs.monthlyCosts;
  const yearlyRevenue = monthlyRevenue * 12;
  const roiMonths = monthlyProfit > 0 ? inputs.investment / monthlyProfit : null;

  return { monthlyRevenue, yearlyRevenue, monthlyProfit, roiMonths };
}

export const CALCULATOR_PRESETS: Record<string, CalculatorInputs> = {
  piekarnia: { transactionsPerDay: 40, basketValue: 12, marginPercent: 35, investment: 35000, monthlyCosts: 400 },
  jajka: { transactionsPerDay: 20, basketValue: 15, marginPercent: 40, investment: 30000, monthlyCosts: 250 },
  serowarnia: { transactionsPerDay: 15, basketValue: 25, marginPercent: 45, investment: 40000, monthlyCosts: 350 },
  bio: { transactionsPerDay: 60, basketValue: 20, marginPercent: 30, investment: 60000, monthlyCosts: 700 },
};

function formatPLN(value: number): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(value);
}

function initCalculator(): void {
  const ids = ['transactions', 'basket', 'margin', 'investment', 'costs'] as const;
  const sliders = Object.fromEntries(
    ids.map((id) => [id, document.getElementById(`calc-${id}`) as HTMLInputElement | null]),
  ) as Record<(typeof ids)[number], HTMLInputElement | null>;

  if (Object.values(sliders).some((el) => el === null)) return;

  const outputs = Object.fromEntries(
    ids.map((id) => [id, document.getElementById(`calc-${id}-out`)]),
  ) as Record<(typeof ids)[number], HTMLElement | null>;

  const revenueMonthEl = document.getElementById('calc-revenue-month');
  const revenueYearEl = document.getElementById('calc-revenue-year');
  const profitEl = document.getElementById('calc-profit');
  const roiEl = document.getElementById('calc-roi');

  function readInputs(): CalculatorInputs {
    return {
      transactionsPerDay: Number(sliders.transactions!.value),
      basketValue: Number(sliders.basket!.value),
      marginPercent: Number(sliders.margin!.value),
      investment: Number(sliders.investment!.value),
      monthlyCosts: Number(sliders.costs!.value),
    };
  }

  function render(): void {
    const inputs = readInputs();
    ids.forEach((id) => {
      if (outputs[id]) outputs[id]!.textContent = sliders[id]!.value;
    });

    const result = calculate(inputs);
    if (revenueMonthEl) revenueMonthEl.textContent = formatPLN(result.monthlyRevenue);
    if (revenueYearEl) revenueYearEl.textContent = formatPLN(result.yearlyRevenue);
    if (profitEl) profitEl.textContent = formatPLN(result.monthlyProfit);
    if (roiEl) roiEl.textContent = result.roiMonths === null ? '—' : `${result.roiMonths.toFixed(1)} mies.`;
  }

  ids.forEach((id) => {
    sliders[id]!.addEventListener('input', render);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = CALCULATOR_PRESETS[btn.dataset.preset ?? ''];
      if (!preset) return;
      sliders.transactions!.value = String(preset.transactionsPerDay);
      sliders.basket!.value = String(preset.basketValue);
      sliders.margin!.value = String(preset.marginPercent);
      sliders.investment!.value = String(preset.investment);
      sliders.costs!.value = String(preset.monthlyCosts);
      render();
    });
  });

  render();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCalculator);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/calculator.test.ts`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/calculator.ts src/calculator.test.ts
git commit -m "feat: add profitability calculator logic with four presets"
```

---

### Task 8: Configurator logic (validation + suggested direction)

**Files:**
- Create: `src/konfigurator.ts`
- Create: `src/konfigurator.test.ts`

**Interfaces:**
- Produces: `ConfiguratorState`, `createInitialState(): ConfiguratorState`, `validateStep(step: number, state: ConfiguratorState): string | null`, `suggestDirection(state: ConfiguratorState): string` — used internally by this file's DOM init.
- Consumes (DOM hooks defined in Task 10): `.config-step[data-step]`, `#config-progress-bar`, `#config-progress-label`, `#config-error`, `#config-back`, `#config-next`, `#config-form`, `#config-result`, `#config-result-text`, form fields named `kim`, `produkty`, `opakowanie`, `temperatura`, `lokalizacja`, `miejscowosc-typ`, `platnosci`, `finansowanie`, and ids `produkt-inne`, `wymiary`, `wolumen-dzienny`, `liczba-produktow`, `imie`, `telefon`, `email`, `miejscowosc-kontakt`, `rodo`.
- Produces (network contract consumed by Task 11's `api/konfigurator.js`): `POST /api/konfigurator` with JSON body `{ marka: 'vendingfresh', typ: 'konfigurator', payload: ConfiguratorState }`.

- [ ] **Step 1: Write the failing test**

Create `src/konfigurator.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createInitialState, suggestDirection, validateStep } from './konfigurator';

describe('validateStep', () => {
  it('requires a selection on step 1', () => {
    const state = createInitialState();
    expect(validateStep(1, state)).toMatch(/Wybierz/);
    state.kim = 'piekarnia';
    expect(validateStep(1, state)).toBeNull();
  });

  it('requires at least one product or free text on step 2', () => {
    const state = createInitialState();
    expect(validateStep(2, state)).not.toBeNull();
    state.produktInne = 'kawa mielona';
    expect(validateStep(2, state)).toBeNull();
  });

  it('requires phone or email plus RODO consent on step 9', () => {
    const state = createInitialState();
    expect(validateStep(9, state)).toMatch(/telefon/);
    state.telefon = '123456789';
    expect(validateStep(9, state)).toMatch(/RODO/);
    state.rodo = true;
    expect(validateStep(9, state)).toBeNull();
  });
});

describe('suggestDirection', () => {
  it('suggests a cooled model for dairy products', () => {
    const state = createInitialState();
    state.temperatura = 'chlodzenie';
    state.produkty = ['sery'];
    state.lokalizacja = 'budynek';
    expect(suggestDirection(state)).toBe('Proponowany kierunek: SiLine Combi/GF z chłodzeniem.');
  });

  it('adds elevator, outdoor and cashless modifiers', () => {
    const state = createInitialState();
    state.temperatura = 'pokojowa';
    state.produkty = ['jajka'];
    state.lokalizacja = 'zewnatrz';
    state.platnosci = ['karta_blik'];
    expect(suggestDirection(state)).toBe(
      'Proponowany kierunek: SiLine Snack & Combi, z windą, wersja outdoor, płatności bezgotówkowe.',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/konfigurator.test.ts`
Expected: FAIL — `Cannot find module './konfigurator'`.

- [ ] **Step 3: Write `src/konfigurator.ts`**

```ts
export interface ConfiguratorState {
  kim: string;
  produkty: string[];
  produktInne: string;
  opakowanie: string;
  wymiary: string;
  temperatura: string;
  wolumenDzienny: string;
  liczbaProduktow: string;
  lokalizacja: string;
  miejscowoscTyp: string;
  platnosci: string[];
  finansowanie: string;
  imie: string;
  telefon: string;
  email: string;
  miejscowoscKontakt: string;
  rodo: boolean;
}

export function createInitialState(): ConfiguratorState {
  return {
    kim: '',
    produkty: [],
    produktInne: '',
    opakowanie: '',
    wymiary: '',
    temperatura: '',
    wolumenDzienny: '',
    liczbaProduktow: '',
    lokalizacja: '',
    miejscowoscTyp: '',
    platnosci: [],
    finansowanie: '',
    imie: '',
    telefon: '',
    email: '',
    miejscowoscKontakt: '',
    rodo: false,
  };
}

export function validateStep(step: number, state: ConfiguratorState): string | null {
  switch (step) {
    case 1:
      return state.kim.trim() === '' ? 'Wybierz, kim jesteś.' : null;
    case 2:
      return state.produkty.length === 0 && state.produktInne.trim() === ''
        ? 'Wybierz co najmniej jeden produkt albo opisz go w polu "inne".'
        : null;
    case 3:
      return state.opakowanie.trim() === '' ? 'Wybierz sposób pakowania.' : null;
    case 4:
      return state.temperatura.trim() === '' ? 'Wybierz temperaturę.' : null;
    case 5:
      return state.wolumenDzienny.trim() === '' ? 'Podaj orientacyjny wolumen sprzedaży.' : null;
    case 6:
      return state.lokalizacja.trim() === '' ? 'Wybierz, gdzie stanie automat.' : null;
    case 7:
      return null;
    case 8:
      return state.finansowanie.trim() === '' ? 'Wybierz sposób finansowania.' : null;
    case 9:
      if (state.telefon.trim() === '' && state.email.trim() === '') {
        return 'Podaj telefon lub e-mail.';
      }
      if (!state.rodo) {
        return 'Zaznacz zgodę RODO, żeby wysłać formularz.';
      }
      return null;
    default:
      return null;
  }
}

export function suggestDirection(state: ConfiguratorState): string {
  const wymagaChlodzenia =
    state.temperatura === 'chlodzenie' ||
    state.produkty.some((p) => ['sery', 'nabial', 'mieso', 'wedliny', 'dania'].includes(p));

  const base = wymagaChlodzenia ? 'SiLine Combi/GF z chłodzeniem' : 'SiLine Snack & Combi';
  const modifiers: string[] = [];

  if (state.produkty.includes('jajka')) modifiers.push('z windą');
  if (state.lokalizacja === 'zewnatrz' || state.lokalizacja === 'publiczne') modifiers.push('wersja outdoor');
  if (state.platnosci.includes('karta_blik')) modifiers.push('płatności bezgotówkowe');

  const kierunek = [base, ...modifiers].join(', ');
  return `Proponowany kierunek: ${kierunek}.`;
}

const TOTAL_STEPS = 9;

function initConfigurator(): void {
  const state = createInitialState();
  let currentStep = 1;

  const form = document.getElementById('config-form');
  const stepEls = Array.from(document.querySelectorAll<HTMLElement>('.config-step'));
  const progressBar = document.getElementById('config-progress-bar');
  const progressLabel = document.getElementById('config-progress-label');
  const errorEl = document.getElementById('config-error');
  const backBtn = document.getElementById('config-back');
  const nextBtn = document.getElementById('config-next');
  const resultEl = document.getElementById('config-result');
  const resultText = document.getElementById('config-result-text');
  const progressWrap = document.querySelector('.config-progress');

  if (!form || !progressBar || !progressLabel || !backBtn || !nextBtn) return;

  function syncStateFromDom(): void {
    state.kim = form!.querySelector<HTMLInputElement>('input[name="kim"]:checked')?.value ?? '';
    state.produkty = Array.from(
      form!.querySelectorAll<HTMLInputElement>('input[name="produkty"]:checked'),
    ).map((el) => el.value);
    state.produktInne = (document.getElementById('produkt-inne') as HTMLInputElement | null)?.value ?? '';
    state.opakowanie = form!.querySelector<HTMLInputElement>('input[name="opakowanie"]:checked')?.value ?? '';
    state.wymiary = (document.getElementById('wymiary') as HTMLInputElement | null)?.value ?? '';
    state.temperatura = form!.querySelector<HTMLInputElement>('input[name="temperatura"]:checked')?.value ?? '';
    state.wolumenDzienny = (document.getElementById('wolumen-dzienny') as HTMLInputElement | null)?.value ?? '';
    state.liczbaProduktow = (document.getElementById('liczba-produktow') as HTMLInputElement | null)?.value ?? '';
    state.lokalizacja = form!.querySelector<HTMLInputElement>('input[name="lokalizacja"]:checked')?.value ?? '';
    state.miejscowoscTyp =
      form!.querySelector<HTMLInputElement>('input[name="miejscowosc-typ"]:checked')?.value ?? '';
    state.platnosci = Array.from(
      form!.querySelectorAll<HTMLInputElement>('input[name="platnosci"]:checked'),
    ).map((el) => el.value);
    state.finansowanie = form!.querySelector<HTMLInputElement>('input[name="finansowanie"]:checked')?.value ?? '';
    state.imie = (document.getElementById('imie') as HTMLInputElement | null)?.value ?? '';
    state.telefon = (document.getElementById('telefon') as HTMLInputElement | null)?.value ?? '';
    state.email = (document.getElementById('email') as HTMLInputElement | null)?.value ?? '';
    state.miejscowoscKontakt =
      (document.getElementById('miejscowosc-kontakt') as HTMLInputElement | null)?.value ?? '';
    state.rodo = (document.getElementById('rodo') as HTMLInputElement | null)?.checked ?? false;
  }

  function renderStep(): void {
    stepEls.forEach((el) => {
      el.hidden = Number(el.dataset.step) !== currentStep;
    });
    progressBar!.style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;
    progressLabel!.textContent = `Krok ${currentStep} z ${TOTAL_STEPS}`;
    backBtn!.hidden = currentStep === 1;
    nextBtn!.textContent = currentStep === TOTAL_STEPS ? 'Wyślij' : 'Dalej';
    if (errorEl) errorEl.textContent = '';
  }

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep -= 1;
      renderStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    syncStateFromDom();
    const error = validateStep(currentStep, state);
    if (error) {
      if (errorEl) errorEl.textContent = error;
      return;
    }
    if (currentStep < TOTAL_STEPS) {
      currentStep += 1;
      renderStep();
      return;
    }
    void submit();
  });

  async function submit(): Promise<void> {
    nextBtn!.setAttribute('disabled', 'true');
    try {
      const response = await fetch('/api/konfigurator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marka: 'vendingfresh', typ: 'konfigurator', payload: state }),
      });
      if (!response.ok) throw new Error('Submit failed');

      form!.hidden = true;
      progressWrap?.setAttribute('hidden', 'true');
      if (resultEl) resultEl.hidden = false;
      if (resultText) resultText.textContent = suggestDirection(state);

      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      w.gtag?.('event', 'konfigurator_wyslany');
    } catch {
      if (errorEl) errorEl.textContent = 'Nie udało się wysłać formularza. Spróbuj ponownie albo zadzwoń.';
    } finally {
      nextBtn!.removeAttribute('disabled');
    }
  }

  renderStep();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initConfigurator);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/konfigurator.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/konfigurator.ts src/konfigurator.test.ts
git commit -m "feat: add configurator step validation and suggested-direction logic"
```

---

### Task 9: Homepage markup (`index.html`)

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `<!-- include:nav.html -->` / `<!-- include:footer.html -->` (Task 5), `src/style.css` (Task 4), `src/main.ts` (Task 5), `src/calculator.ts` (Task 7), `src/cookies.ts` (Task 6).

- [ ] **Step 1: Create `index.html`**

```html
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VendingFresh — Automat 24/7 zaprojektowany pod Twój produkt | Partner Sielaff</title>
  <meta name="description" content="Automaty vendingowe z żywnością konfigurowane pod Twój produkt: pieczywo, jajka, sery, warzywa, napoje. Partner Sielaff. Sprzedaż 24/7, montaż i serwis w całej Polsce.">
  <link rel="canonical" href="https://vendingfresh.pl/">
  <link rel="icon" type="image/png" href="/vendingfresh_icon.png">
  <meta property="og:type" content="website">
  <meta property="og:title" content="VendingFresh — Automat 24/7 zaprojektowany pod Twój produkt">
  <meta property="og:description" content="Automaty vendingowe z żywnością konfigurowane pod Twój produkt. Partner Sielaff. Wycena zawsze indywidualna.">
  <meta property="og:url" content="https://vendingfresh.pl/">
  <meta property="og:image" content="https://vendingfresh.pl/vendingfresh_logo_white_bg.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="VendingFresh — Automat 24/7 zaprojektowany pod Twój produkt">
  <meta name="twitter:description" content="Automaty vendingowe z żywnością konfigurowane pod Twój produkt. Partner Sielaff.">
  <meta name="twitter:image" content="https://vendingfresh.pl/vendingfresh_logo_white_bg.png">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VendingFresh",
    "url": "https://vendingfresh.pl/",
    "logo": "https://vendingfresh.pl/vendingfresh_logo.png",
    "parentOrganization": {
      "@type": "Organization",
      "name": "Sklep za Stodołą Sp. z o.o."
    },
    "description": "Partner Sielaff. Automaty vendingowe z żywnością konfigurowane pod produkt klienta.",
    "sameAs": []
  }
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-REPLACE_ME"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-REPLACE_ME');
  </script>
  <link rel="stylesheet" href="/src/style.css">
</head>
<body>
  <div class="marquee" aria-hidden="true">
    <div class="marquee__track">
      <span>Partner Sielaff</span><span>•</span><span>Konfiguracja pod Twój produkt</span><span>•</span><span>Sprzedaż 24/7</span><span>•</span><span>Chłodzenie i wersje outdoor</span><span>•</span><span>Płatność kartą, BLIK i gotówką</span><span>•</span><span>Montaż i serwis w całej Polsce</span><span>•</span><span>Wycena indywidualna</span><span>•</span>
      <span>Partner Sielaff</span><span>•</span><span>Konfiguracja pod Twój produkt</span><span>•</span><span>Sprzedaż 24/7</span><span>•</span><span>Chłodzenie i wersje outdoor</span><span>•</span><span>Płatność kartą, BLIK i gotówką</span><span>•</span><span>Montaż i serwis w całej Polsce</span><span>•</span><span>Wycena indywidualna</span><span>•</span>
    </div>
  </div>

  <!-- include:nav.html -->

  <main>
    <section class="hero">
      <div class="wrap">
        <p class="eyebrow">Partner Sielaff</p>
        <h1>Automat 24/7 zaprojektowany <em>pod Twój produkt.</em></h1>
        <p class="hero__subtitle">Nie sprzedajemy automatów z półki. Konfigurujemy je pod Twoje opakowanie, temperaturę i sposób wydawania — od pieczywa po napoje.</p>
        <div class="hero__cta">
          <a href="/konfigurator" class="btn btn--primary">Skonfiguruj automat →</a>
          <a href="#rozwiazania" class="btn btn--secondary">Zobacz rozwiązania</a>
        </div>
        <div class="tiles hero__tiles">
          <a href="/rozwiazania/pieczywo" class="tile"><span class="tile__icon">🍞</span>Pieczywo</a>
          <a href="/rozwiazania/jajka" class="tile"><span class="tile__icon">🥚</span>Jajka</a>
          <a href="/rozwiazania/sery" class="tile"><span class="tile__icon">🧀</span>Sery</a>
          <a href="/rozwiazania/ziemniaki-warzywa" class="tile"><span class="tile__icon">🥔</span>Ziemniaki i warzywa</a>
          <a href="/rozwiazania/bio-lokalne" class="tile"><span class="tile__icon">🌱</span>Bio i lokalne</a>
          <a href="/rozwiazania/mieso-dania" class="tile"><span class="tile__icon">🥩</span>Mięso i dania</a>
          <a href="/rozwiazania/napoje" class="tile"><span class="tile__icon">🧃</span>Napoje</a>
        </div>
      </div>
    </section>

    <section class="section problem">
      <div class="wrap">
        <p class="eyebrow">Dlaczego automat</p>
        <h2>Masz dobry produkt. Brakuje Ci tylko czasu, <em>żeby go sprzedawać.</em></h2>
        <div class="cols-3">
          <div class="col"><h3>Sklep zamyka się o 18</h3><p>Klient, który wraca z pracy o 19, i tak nie kupi Twojego produktu.</p></div>
          <div class="col"><h3>Targ to cały dzień stania</h3><p>Rozładunek, stoisko, sprzedaż, spakowanie — a i tak trafiasz tylko do tych, którzy przyjdą akurat w tę sobotę.</p></div>
          <div class="col"><h3>Pracownik za ladą kosztuje</h3><p>Nawet gdy nikt nie przychodzi, pensja i tak leci.</p></div>
        </div>
        <p class="problem__punchline">Automat sprzedaje 24 godziny na dobę — bez Twojej obecności i bez etatu za ladą.</p>
      </div>
    </section>

    <section class="section config-layers">
      <div class="wrap">
        <p class="eyebrow">Jak pracujemy</p>
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
    </section>

    <section class="section rozwiazania" id="rozwiazania">
      <div class="wrap">
        <p class="eyebrow">Rozwiązania</p>
        <h2>Automat dopasowany <em>do Twojego produktu.</em></h2>
        <div class="cards-grid">
          <a href="/rozwiazania/pieczywo" class="product-card"><span class="product-card__icon">🍞</span><h3>Pieczywo</h3><p>Codzienna rotacja, temperatura pokojowa, szczyty rano i wieczorem.</p></a>
          <a href="/rozwiazania/jajka" class="product-card"><span class="product-card__icon">🥚</span><h3>Jajka</h3><p>Delikatne wydawanie windą, wytłaczanki, oznakowanie zgodne z przepisami.</p></a>
          <a href="/rozwiazania/sery" class="product-card"><span class="product-card__icon">🧀</span><h3>Sery i nabiał</h3><p>Chłodzenie, różne formaty, wyższa średnia wartość koszyka.</p></a>
          <a href="/rozwiazania/ziemniaki-warzywa" class="product-card"><span class="product-card__icon">🥔</span><h3>Ziemniaki i warzywa</h3><p>Duże, ciężkie opakowania — liczy się wolumen.</p></a>
          <a href="/rozwiazania/bio-lokalne" class="product-card"><span class="product-card__icon">🌱</span><h3>Bio i lokalne</h3><p>Mini-sklep z wieloma produktami i opisami producentów na ekranie.</p></a>
          <a href="/rozwiazania/mieso-dania" class="product-card"><span class="product-card__icon">🥩</span><h3>Mięso i dania gotowe</h3><p>Chłodzenie z kontrolą temperatury i telemetrią, rygor sanitarny.</p></a>
          <a href="/rozwiazania/napoje" class="product-card"><span class="product-card__icon">🧃</span><h3>Napoje</h3><p>SiLine GF, Robimat X, seria FK — z opcją zwrotów opakowań.</p></a>
        </div>
      </div>
    </section>

    <section class="section how">
      <div class="wrap">
        <p class="eyebrow">Proces</p>
        <h2>Jak to działa <em>krok po kroku.</em></h2>
        <div class="steps" id="how-steps">
          <button class="step is-active" data-step="1"><span class="step__num">1</span>Rozmowa i konfigurator</button>
          <button class="step" data-step="2"><span class="step__num">2</span>Projekt automatu i wycena indywidualna</button>
          <button class="step" data-step="3"><span class="step__num">3</span>Finansowanie</button>
          <button class="step" data-step="4"><span class="step__num">4</span>Dostawa i montaż</button>
          <button class="step" data-step="5"><span class="step__num">5</span>Szkolenie i start</button>
          <button class="step" data-step="6"><span class="step__num">6</span>Opieka po starcie</button>
        </div>
        <div class="step-details">
          <p data-step-detail="1" class="is-active">Rozmawiamy o Twoim produkcie i wypełniasz konfigurator — 5 minut, bez zobowiązań.</p>
          <p data-step-detail="2">Projektujemy automat pod Twój produkt i przygotowujemy wycenę indywidualną w 24–48 h.</p>
          <p data-step-detail="3">Wybierasz leasing (domyślna ścieżka) albo sprawdzamy, czy kwalifikujesz się do dotacji ARiMR.</p>
          <p data-step-detail="4">Dowozimy i montujemy automat w wybranej lokalizacji.</p>
          <p data-step-detail="5">Szkolimy Cię z obsługi i uruchamiamy sprzedaż.</p>
          <p data-step-detail="6">Serwis, telemetria i wsparcie po starcie — w całej Polsce.</p>
        </div>
      </div>
    </section>

    <section class="section calculator" id="kalkulator">
      <div class="wrap">
        <p class="eyebrow">Opłacalność</p>
        <h2>Sprawdź, <em>czy to się opłaca.</em></h2>
        <div class="calc-presets">
          <button type="button" data-preset="piekarnia">Piekarnia przy osiedlu</button>
          <button type="button" data-preset="jajka">Ferma jaj przy drodze</button>
          <button type="button" data-preset="serowarnia">Serowarnia rzemieślnicza</button>
          <button type="button" data-preset="bio">Sklep bio 24/7</button>
        </div>
        <div class="calc-grid">
          <div class="calc-sliders">
            <div class="slider-group">
              <label for="calc-transactions">Transakcji dziennie: <output id="calc-transactions-out">30</output></label>
              <input type="range" id="calc-transactions" min="1" max="200" value="30">
            </div>
            <div class="slider-group">
              <label for="calc-basket">Średnia wartość koszyka (zł): <output id="calc-basket-out">15</output></label>
              <input type="range" id="calc-basket" min="3" max="50" value="15">
            </div>
            <div class="slider-group">
              <label for="calc-margin">Marża na produkcie (%): <output id="calc-margin-out">35</output></label>
              <input type="range" id="calc-margin" min="5" max="70" value="35">
            </div>
            <div class="slider-group">
              <label for="calc-investment">Wartość inwestycji (zł): <output id="calc-investment-out">35000</output></label>
              <input type="range" id="calc-investment" min="5000" max="150000" step="1000" value="35000">
            </div>
            <div class="slider-group">
              <label for="calc-costs">Koszty miesięczne (zł): <output id="calc-costs-out">400</output></label>
              <input type="range" id="calc-costs" min="100" max="3000" step="50" value="400">
            </div>
          </div>
          <div class="calc-results">
            <div class="calc-result"><span class="calc-result__label">Przychód miesięczny</span><span class="calc-result__value" id="calc-revenue-month">—</span></div>
            <div class="calc-result"><span class="calc-result__label">Przychód roczny</span><span class="calc-result__value" id="calc-revenue-year">—</span></div>
            <div class="calc-result"><span class="calc-result__label">Zysk po kosztach (mies.)</span><span class="calc-result__value" id="calc-profit">—</span></div>
            <div class="calc-result calc-result--highlight"><span class="calc-result__label">Zwrot inwestycji</span><span class="calc-result__value" id="calc-roi">—</span></div>
          </div>
        </div>
        <p class="calc-disclaimer">To szacunek orientacyjny, nie gwarancja wyniku — zależy od cen, kosztów i ruchu klientów.</p>
      </div>
    </section>

    <section class="section checklist-section">
      <div class="wrap">
        <p class="eyebrow">Zanim zaczniesz</p>
        <h2>Czy to ma sens <em>u Ciebie?</em></h2>
        <ul class="checklist">
          <li>Masz produkt, po który klienci wracają regularnie</li>
          <li>Możesz zapewnić regularne dostawy/uzupełnianie</li>
          <li>Masz miejsce z ruchem albo celem podróży klientów</li>
          <li>Masz dostęp do prądu i dojazd dla serwisu</li>
          <li>Twoje opakowanie spełnia wymogi sanitarne</li>
        </ul>
        <p class="checklist__punchline">Nie spełniasz połowy? Zadzwoń — powiemy wprost, czy to ma sens.</p>
      </div>
    </section>

    <section class="section sielaff-families">
      <div class="wrap">
        <p class="eyebrow">Sprzęt</p>
        <h2>Automaty Sielaff <em>dopasowane do zastosowania.</em></h2>
        <div class="cards-grid">
          <div class="family-card"><h3>SiLine Snack & Combi</h3><p>Świeże produkty, elastyczna konfiguracja wnętrza.</p></div>
          <div class="family-card"><h3>SiLine GF</h3><p>Napoje i produkty w większej ekspozycji.</p></div>
          <div class="family-card"><h3>Outdoor</h3><p>Wersje na zewnątrz i w miejsca bez zadaszenia.</p></div>
          <div class="family-card"><h3>SiLine Public</h3><p>Miejsca publiczne, wysoka odporność na warunki.</p></div>
        </div>
        <a href="/automaty-sielaff" class="btn btn--secondary">Zobacz wszystkie modele</a>
      </div>
    </section>

    <section class="section why-us">
      <div class="wrap">
        <p class="eyebrow">Dlaczego my</p>
        <h2>Doświadczenie, które <em>widać w projekcie.</em></h2>
        <ul class="check-list">
          <li>Partner Sielaff</li>
          <li>Konfiguracja pod Twój produkt, nie automat z półki</li>
          <li>Montaż i serwis w całej Polsce</li>
          <li>Wycena indywidualna dopasowana do projektu</li>
          <li>Doświadczenie z sklepu za Stodołą i mlekomatów BRUNIMAT</li>
          <li>Opieka po starcie — nie znikamy po montażu</li>
        </ul>
      </div>
    </section>

    <section class="section owner-quote">
      <div class="wrap">
        <blockquote>
          <p>[Miejsce na cytat właściciela — uzupełnimy razem.]</p>
          <footer>— J.D., właściciel VendingFresh</footer>
        </blockquote>
      </div>
    </section>

    <section class="section guide-teaser">
      <div class="wrap">
        <p class="eyebrow">Poradnik</p>
        <h2>Zanim zdecydujesz, <em>poczytaj.</em></h2>
        <div class="cards-grid">
          <a href="/poradnik/ile-kosztuje-automat-na-jajka" class="guide-card"><h3>Ile kosztuje automat na jajka i kiedy się zwraca?</h3></a>
          <a href="/poradnik/automat-na-chleb-jak-dziala" class="guide-card"><h3>Automat na chleb: jak to działa i czy piekarni się opłaca?</h3></a>
          <a href="/poradnik/sprzedaz-zywnosci-z-automatu-przepisy" class="guide-card"><h3>Sprzedaż żywności z automatu: przepisy, sanepid, oznakowanie</h3></a>
        </div>
      </div>
    </section>

    <section class="section cta-final">
      <div class="wrap">
        <h2>Masz produkt? <em>Zaprojektujmy dla niego automat.</em></h2>
        <div class="hero__cta">
          <a href="/konfigurator" class="btn btn--primary">Skonfiguruj automat →</a>
          <a href="tel:+48000000000" class="btn btn--secondary">Zadzwoń</a>
        </div>
      </div>
    </section>
  </main>

  <!-- include:footer.html -->

  <div class="cookie-banner" id="cookie-banner" hidden>
    <p>Używamy plików cookie do analityki i marketingu. <a href="/polityka">Dowiedz się więcej</a>.</p>
    <div class="cookie-banner__actions">
      <button type="button" id="cookie-accept" class="btn btn--primary">Akceptuję</button>
      <button type="button" id="cookie-decline" class="btn btn--secondary">Odrzuć</button>
    </div>
  </div>

  <script type="module" src="/src/main.ts"></script>
  <script type="module" src="/src/calculator.ts"></script>
  <script type="module" src="/src/cookies.ts"></script>
</body>
</html>
```

- [ ] **Step 2: Manual verification with the dev server**

Run: `npm run dev -- --port 5183` (background), then `curl -s http://localhost:5183/ | grep -o "Automat 24/7 zaprojektowany"`
Expected: prints the match, confirming the plugin resolved partials and the page serves. Stop the dev server afterward.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: build VendingFresh homepage with all 13 sections"
```

---

### Task 10: Configurator markup (`konfigurator.html`)

**Files:**
- Create: `konfigurator.html`

**Interfaces:**
- Consumes: `src/konfigurator.ts` (Task 8), `src/main.ts` (Task 5), `src/cookies.ts` (Task 6), `src/style.css` (Task 4), nav/footer partials (Task 5).

- [ ] **Step 1: Create `konfigurator.html`**

```html
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfigurator automatu VendingFresh — dobierz automat pod swój produkt</title>
  <meta name="description" content="Odpowiedz na kilka pytań o swoim produkcie, a zaproponujemy kierunek konfiguracji automatu VendingFresh. Wycena zawsze indywidualna, w 24–48 h.">
  <link rel="canonical" href="https://vendingfresh.pl/konfigurator">
  <link rel="icon" type="image/png" href="/vendingfresh_icon.png">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Konfigurator automatu VendingFresh">
  <meta property="og:description" content="Odpowiedz na kilka pytań, a zaproponujemy kierunek konfiguracji automatu pod Twój produkt.">
  <meta property="og:url" content="https://vendingfresh.pl/konfigurator">
  <meta property="og:image" content="https://vendingfresh.pl/vendingfresh_logo_white_bg.png">
  <meta name="twitter:card" content="summary">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-REPLACE_ME"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-REPLACE_ME');
  </script>
  <link rel="stylesheet" href="/src/style.css">
</head>
<body>
  <!-- include:nav.html -->
  <main class="config-page">
    <div class="wrap">
      <div class="config-progress">
        <div class="config-progress__bar" id="config-progress-bar"></div>
      </div>
      <p class="config-progress__label" id="config-progress-label">Krok 1 z 9</p>

      <form id="config-form">
        <section class="config-step" data-step="1">
          <h2>Kim jesteś?</h2>
          <div class="config-options">
            <label><input type="radio" name="kim" value="rolnik"> Rolnik</label>
            <label><input type="radio" name="kim" value="piekarnia"> Piekarnia</label>
            <label><input type="radio" name="kim" value="serowarnia"> Serowarnia</label>
            <label><input type="radio" name="kim" value="sklep"> Sklep</label>
            <label><input type="radio" name="kim" value="gmina"> Gmina lub KGW</label>
            <label><input type="radio" name="kim" value="inwestor"> Inwestor pod lokalizację</label>
            <label><input type="radio" name="kim" value="inne"> Inne</label>
          </div>
        </section>

        <section class="config-step" data-step="2" hidden>
          <h2>Co chcesz sprzedawać?</h2>
          <div class="config-options">
            <label><input type="checkbox" name="produkty" value="chleb"> Chleb</label>
            <label><input type="checkbox" name="produkty" value="jajka"> Jajka</label>
            <label><input type="checkbox" name="produkty" value="sery"> Sery</label>
            <label><input type="checkbox" name="produkty" value="nabial"> Nabiał</label>
            <label><input type="checkbox" name="produkty" value="ziemniaki"> Ziemniaki</label>
            <label><input type="checkbox" name="produkty" value="warzywa"> Warzywa</label>
            <label><input type="checkbox" name="produkty" value="owoce"> Owoce</label>
            <label><input type="checkbox" name="produkty" value="mieso"> Mięso</label>
            <label><input type="checkbox" name="produkty" value="wedliny"> Wędliny</label>
            <label><input type="checkbox" name="produkty" value="dania"> Dania gotowe</label>
            <label><input type="checkbox" name="produkty" value="miod"> Miód</label>
            <label><input type="checkbox" name="produkty" value="przetwory"> Przetwory</label>
            <label><input type="checkbox" name="produkty" value="napoje"> Napoje</label>
          </div>
          <label class="config-field">Inne (opisz): <input type="text" id="produkt-inne"></label>
        </section>

        <section class="config-step" data-step="3" hidden>
          <h2>Jak to jest zapakowane?</h2>
          <div class="config-options">
            <label><input type="radio" name="opakowanie" value="worek"> Worek</label>
            <label><input type="radio" name="opakowanie" value="wytloczanka"> Wytłaczanka</label>
            <label><input type="radio" name="opakowanie" value="sloik"> Słoik</label>
            <label><input type="radio" name="opakowanie" value="butelka"> Butelka</label>
            <label><input type="radio" name="opakowanie" value="pudelko"> Pudełko</label>
            <label><input type="radio" name="opakowanie" value="luzem"> Luzem</label>
          </div>
          <label class="config-field">Orientacyjne wymiary i waga: <input type="text" id="wymiary" placeholder="np. 20x10x8 cm, 0,5 kg"></label>
        </section>

        <section class="config-step" data-step="4" hidden>
          <h2>Temperatura</h2>
          <div class="config-options">
            <label><input type="radio" name="temperatura" value="chlodzenie"> Chłodzenie</label>
            <label><input type="radio" name="temperatura" value="pokojowa"> Pokojowa</label>
            <label><input type="radio" name="temperatura" value="mieszane"> Mieszane</label>
          </div>
        </section>

        <section class="config-step" data-step="5" hidden>
          <h2>Ile sprzedajesz?</h2>
          <label class="config-field">Ile dziennie/tygodniowo: <input type="text" id="wolumen-dzienny" placeholder="np. 40 szt. dziennie"></label>
          <label class="config-field">Ile różnych produktów: <input type="text" id="liczba-produktow" placeholder="np. 5"></label>
        </section>

        <section class="config-step" data-step="6" hidden>
          <h2>Gdzie stanie automat?</h2>
          <div class="config-options">
            <label><input type="radio" name="lokalizacja" value="budynek"> W budynku</label>
            <label><input type="radio" name="lokalizacja" value="wiata"> Pod wiatą</label>
            <label><input type="radio" name="lokalizacja" value="zewnatrz"> Na zewnątrz przy drodze</label>
            <label><input type="radio" name="lokalizacja" value="publiczne"> Miejsce publiczne</label>
          </div>
          <div class="config-options">
            <label><input type="radio" name="miejscowosc-typ" value="miasto"> Miasto</label>
            <label><input type="radio" name="miejscowosc-typ" value="wies"> Wieś</label>
          </div>
        </section>

        <section class="config-step" data-step="7" hidden>
          <h2>Płatności i dodatki</h2>
          <div class="config-options">
            <label><input type="checkbox" name="platnosci" value="karta_blik"> Karta i BLIK</label>
            <label><input type="checkbox" name="platnosci" value="gotowka"> Gotówka</label>
            <label><input type="checkbox" name="platnosci" value="oklejenie"> Oklejenie w barwach firmy</label>
            <label><input type="checkbox" name="platnosci" value="ekran"> Ekran z logo</label>
            <label><input type="checkbox" name="platnosci" value="telemetria"> Telemetria</label>
          </div>
        </section>

        <section class="config-step" data-step="8" hidden>
          <h2>Finansowanie</h2>
          <div class="config-options">
            <label><input type="radio" name="finansowanie" value="gotowka"> Gotówka</label>
            <label><input type="radio" name="finansowanie" value="leasing"> Leasing</label>
            <label><input type="radio" name="finansowanie" value="dotacja"> Szukam dotacji</label>
            <label><input type="radio" name="finansowanie" value="niewiem"> Nie wiem</label>
          </div>
        </section>

        <section class="config-step" data-step="9" hidden>
          <h2>Kontakt</h2>
          <label class="config-field">Imię: <input type="text" id="imie"></label>
          <label class="config-field">Telefon: <input type="tel" id="telefon"></label>
          <label class="config-field">E-mail: <input type="email" id="email"></label>
          <label class="config-field">Miejscowość: <input type="text" id="miejscowosc-kontakt"></label>
          <label class="config-checkbox"><input type="checkbox" id="rodo"> Zgadzam się na przetwarzanie danych osobowych w celu kontaktu w sprawie wyceny (zgodnie z <a href="/polityka">polityką prywatności</a>).</label>
        </section>

        <p class="config-error" id="config-error" role="alert"></p>

        <div class="config-nav">
          <button type="button" id="config-back" class="btn btn--secondary" hidden>Wstecz</button>
          <button type="button" id="config-next" class="btn btn--primary">Dalej</button>
        </div>
      </form>

      <div class="config-result" id="config-result" hidden>
        <h2>Dziękujemy!</h2>
        <p id="config-result-text"></p>
        <p>Wycena jest zawsze indywidualna — przygotujemy ją pod Twój projekt w 24–48 h.</p>
        <a href="/" class="btn btn--secondary">Wróć na stronę główną</a>
      </div>
    </div>
  </main>
  <!-- include:footer.html -->
  <script type="module" src="/src/main.ts"></script>
  <script type="module" src="/src/konfigurator.ts"></script>
  <script type="module" src="/src/cookies.ts"></script>
</body>
</html>
```

- [ ] **Step 2: Manual verification with the dev server**

Run: `npm run dev -- --port 5183` (background), then `curl -s http://localhost:5183/konfigurator.html | grep -o "Krok 1 z 9"`
Expected: prints the match. Stop the dev server afterward.

- [ ] **Step 3: Commit**

```bash
git add konfigurator.html
git commit -m "feat: build 9-step configurator markup"
```

---

### Task 11: Lead capture API (Neon Postgres + Telegram)

**Files:**
- Create: `api/konfigurator.js`
- Create: `api/konfigurator.test.js`

**Interfaces:**
- Consumes: `POST /api/konfigurator` body `{ marka: 'vendingfresh', typ: 'konfigurator', payload: ConfiguratorState }` — contract produced by Task 8's `submit()`.
- Produces: `validateLeadPayload(body: unknown): string | null` (tested directly), `export default async function handler(req, res)` (Vercel Function entry point, exercised manually).

- [ ] **Step 1: Write the failing test**

Create `api/konfigurator.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { validateLeadPayload } from './konfigurator.js';

describe('validateLeadPayload', () => {
  it('rejects a missing body', () => {
    expect(validateLeadPayload(null)).toMatch(/Nieprawidłowe/);
  });

  it('rejects a wrong marka', () => {
    expect(validateLeadPayload({ marka: 'inna', typ: 'konfigurator', payload: {} })).toMatch(/marka/);
  });

  it('rejects an unknown typ', () => {
    expect(validateLeadPayload({ marka: 'vendingfresh', typ: 'costam', payload: {} })).toMatch(/typ/);
  });

  it('rejects a missing payload', () => {
    expect(validateLeadPayload({ marka: 'vendingfresh', typ: 'konfigurator' })).toMatch(/danych/);
  });

  it('accepts a valid lead', () => {
    expect(
      validateLeadPayload({ marka: 'vendingfresh', typ: 'konfigurator', payload: { kim: 'piekarnia' } }),
    ).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run api/konfigurator.test.js`
Expected: FAIL — `Cannot find module './konfigurator.js'`.

- [ ] **Step 3: Write `api/konfigurator.js`**

```js
import { neon } from '@neondatabase/serverless';

const TELEGRAM_WEBHOOK_ENDPOINT = 'REPLACE_ME_TELEGRAM_WEBHOOK_ENDPOINT';

export function validateLeadPayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Nieprawidłowe dane.';
  }
  if (body.marka !== 'vendingfresh') {
    return 'Nieprawidłowa marka.';
  }
  if (body.typ !== 'konfigurator' && body.typ !== 'kontakt') {
    return 'Nieprawidłowy typ zgłoszenia.';
  }
  if (!body.payload || typeof body.payload !== 'object') {
    return 'Brak danych formularza.';
  }
  return null;
}

async function saveLead(body) {
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    insert into leads (marka, typ, payload)
    values (${body.marka}, ${body.typ}, ${JSON.stringify(body.payload)}::jsonb)
  `;
}

async function notifyTelegram(body) {
  const text = `[VendingFresh] Nowe zgłoszenie (${body.typ})\n${JSON.stringify(body.payload, null, 2)}`;
  await fetch(TELEGRAM_WEBHOOK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const error = validateLeadPayload(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  try {
    await saveLead(req.body);
    await notifyTelegram(req.body);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('konfigurator handler error', err);
    res.status(500).json({ error: 'Nie udało się zapisać zgłoszenia.' });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run api/konfigurator.test.js`
Expected: PASS — 5 tests. (Importing the module is safe without `DATABASE_URL` set: `neon(...)` and `fetch(...)` only run inside `handler`, which the test never calls.)

- [ ] **Step 5: Create the `leads` table reference SQL**

Create `supabase_panel_store.sql` is not reused — instead document the schema inline as a comment at the top of `api/konfigurator.js` is unnecessary since it's in the spec. Skip a separate SQL file; the schema lives in `docs/superpowers/specs/2026-09-24-vendingfresh-rebuild-design.md` and must be run manually against the Neon database once `DATABASE_URL` is provisioned:

```sql
create table leads (
  id bigserial primary key,
  marka text not null,
  typ text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
```

- [ ] **Step 6: Commit**

```bash
git add api/konfigurator.js api/konfigurator.test.js
git commit -m "feat: add lead capture API with Neon Postgres and Telegram notification"
```

---

### Task 12: Full build, full test suite, and manual walkthrough

**Files:** none created — verification only.

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: all test files pass (`vite-plugins/html-include.test.ts`, `src/cookies.test.ts`, `src/calculator.test.ts`, `src/konfigurator.test.ts`, `api/konfigurator.test.js`).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Full production build**

Run: `npm run build`
Expected: succeeds, producing `dist/index.html`, `dist/konfigurator.html`, `dist/polityka.html`, `dist/assets/*`, with nav/footer partials inlined in each.

- [ ] **Step 4: Manual browser walkthrough**

Run: `npm run dev`, open `http://localhost:5173/` in a browser and confirm:
- All 13 homepage sections render, the top marquee scrolls, the mobile nav hamburger opens/closes below 860px width.
- The 4 calculator presets each update the sliders and the revenue/profit/ROI figures.
- `/konfigurator.html` steps through all 9 steps, back/next work, the step-9 validation blocks submit without phone/email or without the RODO checkbox, and a submit attempt shows the expected network error in the console (since `DATABASE_URL`/`TELEGRAM_WEBHOOK_ENDPOINT` are still placeholders) rather than a JS crash.
- The cookie banner appears on first load, "Akceptuję" hides it and stores `vf_cookie_consent=accepted` in `localStorage`, "Odrzuć" hides it and stores `declined`.

- [ ] **Step 5: Commit any fixes found during the walkthrough**

If the manual walkthrough surfaces a bug, fix it, re-run the relevant `npx vitest run` command, then:

```bash
git add -A
git commit -m "fix: address issues found in manual walkthrough"
```

If no issues are found, skip this step — nothing to commit.

---

## Deferred to later stages (not part of this plan)

`/rozwiazania/*` (7 pages), `/automaty-sielaff`, `/jak-dzialamy`, `/finansowanie`, `/poradnik` (list + articles), `/faq`, `/kontakt`, the "Realizacje" nav entry, real product/owner photography, real contact details, and swapping the `DATABASE_URL` / `TELEGRAM_WEBHOOK_ENDPOINT` / `G-REPLACE_ME` / `REPLACE_ME_META_PIXEL_ID` placeholders for production values.
