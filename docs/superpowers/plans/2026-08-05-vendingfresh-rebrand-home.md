# VendingFresh Rebrand + Home v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace VendingFresh's current dark green/gold, 3D-hero landing page with the approved
navy/green Manrope design system and the new Home page structure (Hero → Dlaczego → Nasza
oferta → Jak wygląda współpraca → FAQ → CTA → Footer), per
`docs/superpowers/specs/2026-08-05-vendingfresh-rebrand-home-design.md`.

**Architecture:** Single-page Vite + TypeScript site (no framework). One HTML file
(`index.html`), one stylesheet (`src/style.css`), one script (`src/main.ts`) — same
structure the project already uses, just new content. The 3D/tilt hero (Three.js) is fully
removed and replaced by a static photo, since the spec calls for one full-page rewrite rather
than incremental patching (this matches the project's own prior decision, recorded in
`docs/brand/2026-08-05-brandbook.md`). Two new flat placeholder pages (`polityka.html`,
`rodo.html`) are added via Vite's multi-page build support, since they need zero templating.

**Tech Stack:** Vite 5, TypeScript 5 (strict), vanilla DOM APIs, native `<details>/<summary>`
for the FAQ accordion, Vitest (no new tests needed — no non-trivial logic is introduced).

## Global Constraints

- Colors (from brandbook, exact hex): `--primary:#59B52C` `--primary-dark:#479822`
  `--secondary:#102235` `--secondary-light:#1B3550` `--background:#F8FAFB` `--surface:#FFFFFF`
  `--border:#E6EAEE` `--text:#1B2733` `--text-light:#687583`.
- Font: Manrope (weights 400/600/700), replacing Montserrat everywhere.
- Radii: buttons/inputs 12px, cards 20px, hero photo/CTA panel 28px. Shadow
  `0 8px 30px rgba(16,34,53,.08)`, hover `0 12px 40px rgba(16,34,53,.12)`.
- No fabricated stats, testimonials, or client logos — the spec explicitly omits "Zaufało
  nam", "Nasze realizacje", "Opinie", and the Hero trust bar for this stage.
- Sielaff manufacturer logos stay visible in offer photos (explicit user decision — do not
  crop/blur them).
- FAQ and offer-card copy are draft marketing text the user must review before real
  production publish — implement as specified, do not invent additional claims.
- Business hours are real (`Pon–Pt 7:00–18:00`); social media links and legal pages
  (Polityka/RODO) are explicit non-functional placeholders — do not invent URLs or legal text.

---

### Task 1: Rebrand + rebuild Home (tokens, nav, hero, all sections)

This is one task because the change is a single reviewable unit by design: every section
shares the same new tokens, and leaving old and new tokens/classes mixed mid-migration would
either break rendering or leave dead CSS behind. `docs/brand/2026-08-05-brandbook.md`
explicitly calls for doing this "jednym przejściem" (in one pass), not color by color.

**Files:**
- Delete: `src/hero3d.ts`, `src/heroConfig.ts`, `src/heroFallback.ts`, `src/heroError.ts`,
  `src/imageCutout.ts`, `src/imageCutout.test.ts`
- Modify: `package.json` (remove `three` / `@types/three`)
- Modify: `index.html` (full rewrite)
- Modify: `src/style.css` (full rewrite)
- Modify: `src/main.ts` (full rewrite)

**Interfaces:**
- Produces (consumed by Task 2): CSS classes `.btn`, `.btn--primary`, `.placeholder-page`
  and its children, available globally from `src/style.css`.
- Produces (consumed by Task 3's doc update): nothing code-level — Task 3 only edits
  markdown.

- [ ] **Step 1: Delete the Three.js hero engine files**

```bash
git rm src/hero3d.ts src/heroConfig.ts src/heroFallback.ts src/heroError.ts src/imageCutout.ts src/imageCutout.test.ts
```

- [ ] **Step 2: Remove the `three` dependency from `package.json`**

Replace the full file with:

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
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.6.2",
    "vite": "^5.4.10",
    "vitest": "^4.1.10"
  }
}
```

- [ ] **Step 3: Run `npm install` to update the lockfile**

Run: `npm install`
Expected: completes without errors, `package-lock.json` no longer lists `three`.

- [ ] **Step 4: Rewrite `src/style.css`**

Replace the full file with:

```css
:root {
  --primary: #59B52C;
  --primary-dark: #479822;

  --secondary: #102235;
  --secondary-light: #1B3550;

  --background: #F8FAFB;
  --surface: #FFFFFF;

  --border: #E6EAEE;

  --text: #1B2733;
  --text-light: #687583;

  --success: #38A169;
  --warning: #F6AD55;
  --danger: #E53E3E;
  --info: #3182CE;

  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-lg: 28px;

  --shadow: 0 8px 30px rgba(16, 34, 53, 0.08);
  --shadow-hover: 0 12px 40px rgba(16, 34, 53, 0.12);

  --font-brand: 'Manrope', sans-serif;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: var(--font-brand);
  font-weight: 400;
  background: var(--background);
  color: var(--text);
}

img {
  max-width: 100%;
  display: block;
}

/* Author `display` declarations always beat the browser's default
   `[hidden] { display: none }` at equal specificity, because author-origin
   rules outrank user-agent-origin rules regardless of specificity. This
   closes that gap globally instead of patching one selector at a time. */
[hidden] {
  display: none !important;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-brand);
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--radius-sm);
  padding: 0.9rem 2rem;
  font-size: 1rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}
.btn--primary {
  background: var(--primary);
  color: var(--secondary);
}
.btn--primary:hover {
  background: var(--secondary);
  color: #FFFFFF;
  transform: translateY(-1px);
}
.btn--secondary {
  background: var(--surface);
  border-color: var(--secondary);
  color: var(--secondary);
}
.btn--secondary:hover {
  background: var(--secondary);
  color: #FFFFFF;
}

/* Nav */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(248, 250, 251, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.nav__brand {
  display: flex;
  align-items: center;
  text-decoration: none;
}
.nav__logo {
  height: 34px;
  width: auto;
}
.nav__links {
  display: flex;
  align-items: center;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav__links a {
  color: var(--text);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
}
.nav__links a:hover {
  color: var(--primary-dark);
}
.nav__item--dropdown {
  position: relative;
}
.nav__dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font: inherit;
  color: var(--text);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0;
}
.nav__dropdown-toggle:hover {
  color: var(--primary-dark);
}
.nav__dropdown-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}
.nav__item--dropdown.is-open .nav__dropdown-icon {
  transform: rotate(180deg);
}
.nav__dropdown-menu {
  position: absolute;
  top: calc(100% + 0.75rem);
  left: 50%;
  transform: translateX(-50%);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-hover);
  padding: 0.5rem;
  min-width: 240px;
  list-style: none;
  margin: 0;
  display: none;
  flex-direction: column;
}
.nav__item--dropdown.is-open .nav__dropdown-menu,
.nav__item--dropdown:hover .nav__dropdown-menu {
  display: flex;
}
.nav__dropdown-menu a {
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
}
.nav__dropdown-menu a:hover {
  background: var(--background);
  color: var(--primary-dark);
}
.nav__toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
}
.nav__toggle-icon {
  width: 28px;
  height: 28px;
  color: var(--secondary);
}

/* Hero */
.hero {
  padding: 8rem 2rem 5rem;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}
.hero__eyebrow {
  color: var(--primary-dark);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.8rem;
  margin: 0 0 1rem;
}
.hero__title {
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 700;
  line-height: 1.15;
  color: var(--secondary);
  margin: 0 0 1.25rem;
}
.hero__subtitle {
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--text-light);
  max-width: 42ch;
  margin: 0 0 2rem;
}
.hero__actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.hero__art {
  display: flex;
  justify-content: center;
}
.hero__photo {
  width: 100%;
  max-width: 420px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hover);
}

/* Sections */
.section {
  padding: 6rem 1.5rem;
}
.section--surface {
  background: var(--surface);
}
.section__inner {
  max-width: 1100px;
  margin: 0 auto;
}
.section__header {
  max-width: 640px;
  margin: 0 auto 3rem;
  text-align: center;
}
.section__eyebrow {
  color: var(--primary-dark);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 700;
  font-size: 0.8rem;
  margin: 0 0 0.75rem;
}
.section__title {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
  color: var(--secondary);
  margin: 0 0 1rem;
}
.section__lead {
  color: var(--text-light);
  font-size: 1.05rem;
  line-height: 1.7;
  margin: 0;
}

/* Dlaczego (2x3 grid) */
.why-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.why-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.why-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}
.why-card__icon {
  width: 48px;
  height: 48px;
  color: var(--primary);
  margin-bottom: 1.25rem;
}
.why-card h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--secondary);
  margin: 0 0 0.5rem;
}
.why-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-light);
  margin: 0;
}

/* Nasza oferta */
.offer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.offer-card {
  display: block;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.offer-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}
.offer-card__media {
  aspect-ratio: 4 / 3;
  background: var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.offer-card__media img {
  max-height: 100%;
  width: auto;
  margin: 0 auto;
}
.offer-card__media--icon .offer-card__icon {
  width: 64px;
  height: 64px;
  color: var(--primary);
}
.offer-card__body {
  padding: 1.5rem;
}
.offer-card__body h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--secondary);
  margin: 0 0 0.5rem;
}
.offer-card__body p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-light);
  margin: 0;
}

/* Jak wygląda współpraca */
.process {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;
}
.process-step {
  text-align: center;
  position: relative;
}
.process-step__number {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--secondary);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin: 0 auto 1rem;
}
.process-step h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--secondary);
  margin: 0 0 0.5rem;
}
.process-step p {
  font-size: 0.9rem;
  color: var(--text-light);
  line-height: 1.5;
  margin: 0;
}
.process-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 22px;
  left: calc(50% + 34px);
  width: calc(100% - 68px);
  border-top: 2px dashed var(--border);
}

/* FAQ */
.faq {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.faq-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.25rem 1.25rem;
}
.faq-item summary {
  cursor: pointer;
  list-style: none;
  padding: 1rem 0;
  font-weight: 600;
  color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.faq-item summary::-webkit-details-marker {
  display: none;
}
.faq-item summary::after {
  content: '+';
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--primary-dark);
  transition: transform 0.2s ease;
}
.faq-item[open] summary::after {
  transform: rotate(45deg);
}
.faq-item p {
  margin: 0 0 1.25rem;
  color: var(--text-light);
  line-height: 1.6;
}

/* CTA */
.cta {
  background: var(--secondary);
  color: #FFFFFF;
  text-align: center;
  border-radius: var(--radius-lg);
  padding: 4rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
}
.cta h2 {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
  margin: 0 0 1.5rem;
}
.cta__contact {
  margin-top: 1.5rem;
  opacity: 0.85;
}
.cta__contact a {
  color: #FFFFFF;
}

/* Footer */
.footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 4rem 1.5rem 2rem;
}
.footer__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 2rem;
}
.footer__brand img {
  height: 32px;
  width: auto;
  margin-bottom: 1rem;
}
.footer__brand p {
  color: var(--text-light);
  font-size: 0.9rem;
  line-height: 1.6;
  max-width: 32ch;
}
.footer h4 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--secondary);
  margin: 0 0 1rem;
}
.footer ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.footer a {
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.9rem;
}
.footer a:hover {
  color: var(--primary-dark);
}
.footer__social {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.footer__social-icon {
  width: 20px;
  height: 20px;
  color: var(--text-light);
}
.footer__bottom {
  max-width: 1100px;
  margin: 3rem auto 0;
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
  font-size: 0.85rem;
  color: var(--text-light);
  text-align: center;
}

/* Placeholder pages (polityka.html, rodo.html) */
.placeholder-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  gap: 1.25rem;
}
.placeholder-page__logo {
  height: 40px;
  width: auto;
  margin-bottom: 1rem;
}
.placeholder-page h1 {
  color: var(--secondary);
  font-size: 1.8rem;
  margin: 0;
}
.placeholder-page p {
  color: var(--text-light);
  margin: 0;
  max-width: 40ch;
}

/* Scroll-reveal */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 7rem 1.5rem 3rem;
    text-align: center;
  }
  .hero__subtitle {
    margin-left: auto;
    margin-right: auto;
  }
  .hero__actions {
    justify-content: center;
  }
  .hero__art {
    order: -1;
  }
  .why-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .offer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .process {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .process-step:not(:last-child)::after {
    display: none;
  }
  .nav__links {
    position: fixed;
    top: 66px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0.5rem 1.5rem 1rem;
    display: none;
  }
  .nav__links.is-open {
    display: flex;
  }
  .nav__links a,
  .nav__dropdown-toggle {
    padding: 0.75rem 0;
    width: 100%;
    justify-content: space-between;
  }
  .nav__dropdown-menu {
    position: static;
    transform: none;
    box-shadow: none;
    border: none;
    display: none;
    padding-left: 1rem;
  }
  .nav__item--dropdown.is-open .nav__dropdown-menu {
    display: flex;
  }
  .nav__toggle {
    display: block;
  }
  .footer__inner {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 560px) {
  .why-grid {
    grid-template-columns: 1fr;
  }
  .offer-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .section {
    padding: 4rem 1.25rem;
  }
}
```

- [ ] **Step 5: Rewrite `index.html`**

Replace the full file with:

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VendingFresh — Automaty vendingowe dla firm</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body id="top">
    <nav class="nav">
      <a class="nav__brand" href="#top">
        <img class="nav__logo" src="/vendingfresh_logo_full.png" alt="VendingFresh" />
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

    <section class="hero" id="hero">
      <div class="hero__copy">
        <p class="hero__eyebrow">ŚWIEŻOŚĆ. JAKOŚĆ. ZAUFANIE.</p>
        <h1 class="hero__title">Nowoczesne automaty vendingowe dla firm.</h1>
        <p class="hero__subtitle">Świeże produkty. Pełny serwis. Nowoczesne technologie.</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="#kontakt">Zamów wycenę</a>
          <a class="btn btn--secondary" href="#oferta">Zobacz ofertę</a>
        </div>
      </div>
      <div class="hero__art">
        <img class="hero__photo" src="/vendingfresh_machine.webp" alt="Automat chłodniczy VendingFresh" />
      </div>
    </section>

    <section class="section section--surface" id="dlaczego">
      <div class="section__inner reveal">
        <div class="section__header">
          <p class="section__eyebrow">Dlaczego VendingFresh</p>
          <h2 class="section__title">Automaty, które robią wrażenie</h2>
        </div>
        <div class="why-grid">
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M10 2h4M11 2v3.2c0 .4-.1.7-.4 1L9 8v11a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8l-1.6-1.8c-.3-.3-.4-.6-.4-1V2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 3.5c1.5-1.5 2.8-1.8 4-1.3M16 3.5c-1.5-1.5-2.8-1.8-4-1.3" stroke-linecap="round"/>
              <path d="M9 13h6" stroke-linecap="round"/>
            </svg>
            <h3>Świeże produkty</h3>
            <p>Precyzyjne chłodzenie utrzymuje optymalną temperaturę przez cały czas.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M12 2l7 3v6c0 5-3 8.5-7 11-4-2.5-7-6-7-11V5l7-3z" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8.5 12l2.3 2.3L15.5 9.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Wysoka jakość</h3>
            <p>Solidne materiały i staranne wykonanie zapewniają wieloletnią niezawodność.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <rect x="5" y="2" width="14" height="20" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 6h8M8 10h8M9 14h2M13 14h2M9 17h2M13 17h2" stroke-linecap="round"/>
            </svg>
            <h3>Nowoczesne technologie</h3>
            <p>Płatności bezgotówkowe i zdalny monitoring w jednym urządzeniu.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M2 12l3.5-3.5a2 2 0 0 1 2.8 0L10 10l2-2 1.5 1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 10l4.5 4.5a1.5 1.5 0 0 0 2.1-2.1L13 8.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14.5 8.5L17 6a2 2 0 0 1 2.8 0L22 8.3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15l1.5 1.5a1.5 1.5 0 0 0 2.1-2.1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Zaufanie i wsparcie</h3>
            <p>Jesteśmy z Tobą na każdym etapie — od wdrożenia po serwis.</p>
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
            <h3>Elastyczna oferta</h3>
            <p>Dopasowanie automatu do branży i lokalizacji Twojej firmy.</p>
          </article>
          <article class="why-card">
            <svg class="why-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="12" rx="2"/>
              <path d="M8 20h8M12 16v4"/>
              <path d="M9 10a4 4 0 0 1 6 0M11 12a1.5 1.5 0 0 1 2 0"/>
            </svg>
            <h3>Zdalny monitoring</h3>
            <p>Podgląd stanu i sprzedaży automatu 24 godziny na dobę.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section" id="oferta">
      <div class="section__inner reveal">
        <div class="section__header">
          <p class="section__eyebrow">Nasza oferta</p>
          <h2 class="section__title">Automat dopasowany do Twojej firmy</h2>
        </div>
        <div class="offer-grid">
          <a class="offer-card" href="#kontakt">
            <div class="offer-card__media">
              <img src="/vendingfresh_machine.webp" alt="Automat chłodniczy" />
            </div>
            <div class="offer-card__body">
              <h3>Automaty chłodnicze</h3>
              <p>Świeże produkty od lokalnych producentów — jaja, nabiał, miód, przetwory — dostępne 24h, bez obsługi i kolejki.</p>
            </div>
          </a>
          <a class="offer-card" href="#kontakt">
            <div class="offer-card__media">
              <img src="/offer-przekaskowe.png" alt="Automat przekąskowy" />
            </div>
            <div class="offer-card__body">
              <h3>Automaty przekąskowe</h3>
              <p>Chipsy, batony i przekąski w zasięgu ręki — w biurze, szkole czy zakładzie pracy.</p>
            </div>
          </a>
          <a class="offer-card" href="#kontakt">
            <div class="offer-card__media">
              <img src="/offer-napoje-fk.png" alt="Automat z napojami" />
            </div>
            <div class="offer-card__body">
              <h3>Automaty z napojami</h3>
              <p>Zimne napoje, woda, soki — schłodzone i gotowe do wydania w każdej chwili.</p>
            </div>
          </a>
          <a class="offer-card" href="#kontakt">
            <div class="offer-card__media">
              <img src="/offer-kawa-siamonie-series.png" alt="Automat kawowy" />
            </div>
            <div class="offer-card__body">
              <h3>Automaty kawowe</h3>
              <p>Świeżo parzona kawa i gorące napoje — jakość kawiarni bez baristy.</p>
            </div>
          </a>
          <a class="offer-card" href="#kontakt">
            <div class="offer-card__media offer-card__media--icon">
              <svg class="offer-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 8l3 2 5-6 5 6 3-2-2 10H6L4 8z"/>
                <path d="M6 18h12"/>
              </svg>
            </div>
            <div class="offer-card__body">
              <h3>Automaty premium</h3>
              <p>Rozbudowane konfiguracje dla lokalizacji o dużym natężeniu ruchu.</p>
            </div>
          </a>
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
              <p>Zero inwestycji początkowej — automat, montaż i serwis w jednym abonamencie.</p>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="section section--surface" id="wspolpraca">
      <div class="section__inner reveal">
        <div class="section__header">
          <p class="section__eyebrow">Jak wygląda współpraca</p>
          <h2 class="section__title">Od kontaktu do serwisu w 5 krokach</h2>
        </div>
        <div class="process">
          <div class="process-step">
            <div class="process-step__number">1</div>
            <h3>Kontakt</h3>
            <p>Piszesz lub dzwonisz — poznajemy Twoje potrzeby.</p>
          </div>
          <div class="process-step">
            <div class="process-step__number">2</div>
            <h3>Analiza</h3>
            <p>Sprawdzamy lokalizację i dobieramy najlepsze rozwiązanie.</p>
          </div>
          <div class="process-step">
            <div class="process-step__number">3</div>
            <h3>Dobór automatu</h3>
            <p>Wybieramy model dopasowany do asortymentu i miejsca.</p>
          </div>
          <div class="process-step">
            <div class="process-step__number">4</div>
            <h3>Montaż</h3>
            <p>Instalujemy i uruchamiamy automat u Ciebie.</p>
          </div>
          <div class="process-step">
            <div class="process-step__number">5</div>
            <h3>Serwis</h3>
            <p>Dbamy o sprawność i uzupełnianie na bieżąco.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="section__inner reveal">
        <div class="section__header">
          <p class="section__eyebrow">FAQ</p>
          <h2 class="section__title">Najczęściej zadawane pytania</h2>
        </div>
        <div class="faq">
          <details class="faq-item">
            <summary>Jak długo trwa montaż automatu?</summary>
            <p>Zazwyczaj kilka godzin — od dostawy automatu na miejsce, przez podłączenie, po pierwsze uzupełnienie asortymentu.</p>
          </details>
          <details class="faq-item">
            <summary>Czy potrzebuję własnego przyłącza prądu?</summary>
            <p>Tak, automat wymaga standardowego przyłącza elektrycznego 230V w miejscu montażu — resztę sprawdzamy podczas wizji lokalnej.</p>
          </details>
          <details class="faq-item">
            <summary>Jakie produkty można sprzedawać w automacie?</summary>
            <p>Zależnie od modelu — od świeżych produktów wymagających chłodzenia po przekąski, napoje i kawę. Dobieramy automat pod Twój asortyment.</p>
          </details>
          <details class="faq-item">
            <summary>Czy oferujecie tylko zakup, czy też dzierżawę?</summary>
            <p>Obie opcje. Automat możesz kupić na własność albo wziąć w dzierżawę z serwisem i uzupełnianiem w cenie abonamentu.</p>
          </details>
          <details class="faq-item">
            <summary>Jak wygląda serwis i co w razie awarii?</summary>
            <p>Monitorujemy stan automatów zdalnie i reagujemy na zgłoszenia serwisowe — w razie awarii wysyłamy technika, żeby ograniczyć przestój do minimum.</p>
          </details>
        </div>
      </div>
    </section>

    <section class="section" id="kontakt">
      <div class="section__inner reveal">
        <div class="cta">
          <h2>Gotowy na automat w swojej firmie?</h2>
          <a class="btn btn--primary" href="mailto:kontakt@vendingfresh.pl">Umów rozmowę</a>
          <p class="cta__contact">kontakt@vendingfresh.pl &nbsp;·&nbsp; <a href="tel:+48690000923">+48 690 000 923</a></p>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <img src="/vendingfresh_logo_full.png" alt="VendingFresh" />
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

    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Rewrite `src/main.ts`**

Replace the full file with:

```ts
import './style.css';

function initNav(): void {
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

initNav();
initScrollReveal();
```

- [ ] **Step 7: Run the build**

Run: `npm run build`
Expected: `tsc` reports no type errors, `vite build` completes and writes `dist/index.html`
plus hashed CSS/JS assets. No references to the deleted `three`/hero files remain (the
compiler would fail on missing imports if any were left behind).

- [ ] **Step 8: Run the dev server and manually verify**

Run: `npm run dev`, open the printed local URL in a browser.

Verify:
- Nav shows the new logo, "Oferta" opens a dropdown with 6 items on hover/click, "Kontakt"
  scrolls to the CTA section.
- Resize below 860px width: hamburger icon appears, clicking it opens the nav links list;
  clicking "Oferta" in that state expands the dropdown inline.
- Hero shows the static machine photo with no rotation/scroll interaction, both buttons work.
- "Dlaczego VendingFresh" shows 6 cards in a 3-column grid (2 columns under ~860px, 1 column
  under ~560px).
- "Nasza oferta" shows 6 cards (4 with photos, 2 with icons for Premium/Dzierżawa), all
  clicking through to the CTA section.
- FAQ items expand/collapse on click with no JavaScript errors in the console.
- Footer shows hours, two non-functional social icons, and links to `/polityka.html` /
  `/rodo.html` (these two 404 until Task 2 — expected at this point).

- [ ] **Step 9: Run the test suite**

Run: `npm run test`
Expected: passes with no test files found (the only prior test, `imageCutout.test.ts`, was
deleted in Step 1 along with the code it tested).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Rebrand Home to navy/green Manrope design system

Replaces the dark green/gold, 3D-tilt hero landing page with the
brandbook palette and the new Home structure: Hero (static photo),
Dlaczego (2x3 grid), Nasza oferta (6 cards), Jak wygląda współpraca
(5 steps), FAQ (accordion), CTA, and a 4-column footer with dropdown
nav. Removes the Three.js hero engine and its dependency entirely.

See docs/superpowers/specs/2026-08-05-vendingfresh-rebrand-home-design.md"
```

---

### Task 2: Add Polityka/RODO placeholder pages via Vite multi-page build

**Files:**
- Create: `src/placeholder.ts`
- Create: `polityka.html`
- Create: `rodo.html`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: `.placeholder-page` and `.btn`/`.btn--primary` classes from `src/style.css`
  (Task 1).
- Produces: nothing further tasks depend on — this is the last content task.

- [ ] **Step 1: Add the shared placeholder entry script**

Create `src/placeholder.ts`:

```ts
import './style.css';
```

- [ ] **Step 2: Create the Polityka prywatności placeholder page**

Create `polityka.html`:

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
    <main class="placeholder-page">
      <img class="placeholder-page__logo" src="/vendingfresh_logo_full.png" alt="VendingFresh" />
      <h1>Strona w przygotowaniu</h1>
      <p>Pracujemy nad polityką prywatności — wróć tu wkrótce.</p>
      <a class="btn btn--primary" href="/">Wróć na stronę główną</a>
    </main>
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Create the RODO placeholder page**

Create `rodo.html`:

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
    <main class="placeholder-page">
      <img class="placeholder-page__logo" src="/vendingfresh_logo_full.png" alt="VendingFresh" />
      <h1>Strona w przygotowaniu</h1>
      <p>Pracujemy nad informacją o przetwarzaniu danych osobowych (RODO) — wróć tu wkrótce.</p>
      <a class="btn btn--primary" href="/">Wróć na stronę główną</a>
    </main>
    <script type="module" src="/src/placeholder.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: Register both pages as build entries**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
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

- [ ] **Step 5: Run the build and verify both pages are emitted**

Run: `npm run build`
Expected: `dist/index.html`, `dist/polityka.html`, and `dist/rodo.html` all exist.

- [ ] **Step 6: Run the dev server and manually verify**

Run: `npm run dev`. Visit `/polityka.html` and `/rodo.html` directly; confirm both render
the logo, heading, message, and a working "Wróć na stronę główną" link back to `/`. From
the Home footer, confirm both links navigate correctly.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add Polityka prywatności and RODO placeholder pages

Flat static pages (no routing/templating needed yet) wired into the
Vite build as extra rollup entries. Both say 'w przygotowaniu' and
link back to Home until real legal copy exists."
```

---

### Task 3: Mark the brandbook implemented and do final verification

**Files:**
- Modify: `docs/brand/2026-08-05-brandbook.md`

**Interfaces:** none — documentation only.

- [ ] **Step 1: Update the brandbook's status note**

In `docs/brand/2026-08-05-brandbook.md`, replace the blockquote at the top of the file:

```markdown
> Nowy kierunek wizualny marki, dostarczony przez użytkownika 2026-08-05. **Nie jest jeszcze
> wdrożony** — obecny kod (`src/style.css`, `index.html`) wciąż używa starszej palety ze
> spec `docs/superpowers/specs/2026-08-03-vendingfresh-landing-design.md` (zielony
> ciemny/złoto/kremowy, Montserrat). Ten dokument to materiał źródłowy do przyszłego
> osobnego projektu rebrandingu (spec + plan), nie do miksowania z bieżącym planem hero
> (`docs/superpowers/plans/2026-08-05-vendingfresh-hero-photo.md`).
```

with:

```markdown
> Nowy kierunek wizualny marki, dostarczony przez użytkownika 2026-08-05. **Wdrożony
> na stronie głównej 2026-08-05** — zobacz
> `docs/superpowers/specs/2026-08-05-vendingfresh-rebrand-home-design.md` i
> `docs/superpowers/plans/2026-08-05-vendingfresh-rebrand-home.md`. Kolejne etapy
> (architektura wielostronicowa, podstrony oferty, realizacje, o nas, blog, lokalne SEO)
> mają własne, osobne specy.
```

- [ ] **Step 2: Update the "Decyzja dot. kolejności prac" section**

Replace:

```markdown
## Decyzja dot. kolejności prac (2026-08-05)
Dokończamy najpierw plan hero photo na obecnej (starej) palecie — to zmiana czysto
techniczna (canvas cutout + tilt), niezależna od kolorów. Rebranding wg tego brandbooka
robimy jako osobny projekt zaraz po zmergowaniu hero (nowy spec przez
`superpowers:brainstorming`, potem plan), obejmujący całe `style.css` i `index.html`
jednym przejściem — nie łatamy koloru po kolorze przy okazji innych zadań.
```

with:

```markdown
## Decyzja dot. kolejności prac (2026-08-05)
Hero photo (canvas cutout + tilt) zostało zmergowane, a rebranding wdrożony zaraz po nim,
jednym przejściem przez całe `style.css` i `index.html`, zgodnie z powyższym planem. Etap 1
(rebrand + Home) jest zamknięty. Kolejne etapy — architektura wielostronicowa, podstrony
oferty, realizacje, o nas, blog, lokalne SEO — to osobne projekty z własnym
spec+planem, uruchamiane przez `superpowers:brainstorming` gdy przyjdzie ich kolej.
```

- [ ] **Step 3: Run full verification one more time**

Run, in order:
1. `npm run build` — expect success, `dist/` contains all three HTML entries.
2. `npm run test` — expect pass (no test files).
3. `npm run dev` — spot-check Home, `/polityka.html`, `/rodo.html` once more end to end
   (nav, hero, all six Home sections, footer links).

- [ ] **Step 4: Commit and push**

```bash
git add -A
git commit -m "Mark rebrand brandbook as implemented for Home v2"
git push origin main
```

## Self-review notes

- **Spec coverage:** every section in the design spec (tokens, nav, hero, dlaczego, oferta,
  współpraca, FAQ, CTA, footer, polityka/RODO placeholders, brandbook status update) maps to
  a step above. The explicitly out-of-scope sections (Zaufało nam, Realizacje, Opinie, Hero
  trust bar, Realizacje/O nas/Blog nav items) are simply absent from the markup, matching the
  spec's "poza zakresem" list.
- **Placeholder scan:** no TBD/TODO left except the intentional `<!-- TODO: podmienić na
  realne linki -->` comment on social icons, which mirrors the spec's own explicit
  placeholder decision — not a plan gap.
- **Type consistency:** DOM ids referenced in `main.ts` (`nav-toggle`, `nav-links`,
  `nav-oferta`, `.nav__dropdown-toggle`, `.nav__links a`, `.reveal`) all match the ids/classes
  defined in `index.html`'s markup in Task 1, Step 5.
- **Scope:** single cohesive subsystem (Home page v2), no unrelated refactors bundled in.
