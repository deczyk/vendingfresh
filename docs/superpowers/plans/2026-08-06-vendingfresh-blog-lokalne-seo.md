# VendingFresh Blog + Lokalne SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Blog placeholder page, complete the site's technical SEO (robots/sitemap/canonical/meta), fix `index.html`'s missing `<main>` landmark, and add active-page nav highlighting.

**Architecture:** One new placeholder page (mirrors `realizacje.html`); two new static files in `public/`; per-page `<head>` additions (meta description/canonical/robots) using exact existing copy where it already exists; a small `src/nav.ts` addition comparing `window.location.pathname` against nav link hrefs.

**Tech Stack:** Vite 5, TypeScript (strict), plain HTML — same stack as the rest of the site.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-06-vendingfresh-blog-lokalne-seo-design.md` — every requirement below traces back to it.
- Working directly on `main`, no isolated worktree/branch — standing user instruction (commit + push after every task, don't ask each time).
- **Assumed production domain: `https://vendingfresh.pl`** (inferred from the site's existing `kontakt@vendingfresh.pl` email; not independently confirmed — every URL this plan lands needs a find-and-replace if the real domain differs).
- `blog.html` is a placeholder page (mirrors `realizacje.html`/`polityka.html`/`rodo.html`) — no fabricated article content.
- Thin/placeholder pages (`polityka.html`, `rodo.html`, `realizacje.html`, `blog.html`) get `<meta name="robots" content="noindex, follow">`. Real content pages (`index.html`, all 6 `oferta-*.html`, `o-nas.html`) do NOT.
- No Open Graph tags, no JSON-LD structured data, no icon-partial refactor — explicitly trimmed from this stage's scope per the spec.
- Nav-highlighting only compares `.html`-suffixed hrefs against the current path; anchor-only links (`/#top`, `/#kontakt`) are excluded from the comparison (Home never gets highlighted by this mechanism — a deliberate, documented scope trim, not a bug).

---

### Task 1: `blog.html` placeholder page

**Files:**
- Create: `blog.html`
- Modify: `vite.config.ts`

**Interfaces:** none new.

- [ ] **Step 1: Create `blog.html`**

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/vendingfresh_icon_transparent.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Blog — VendingFresh</title>
    <meta name="description" content="Artykuły o automatach vendingowych dla firm — już wkrótce." />
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
      <p>Pracujemy nad artykułami o automatach vendingowych — wróć tu wkrótce.</p>
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
        realizacje: resolve(__dirname, 'realizacje.html'),
      },
```

Replace it with:

```ts
        realizacje: resolve(__dirname, 'realizacje.html'),
        blog: resolve(__dirname, 'blog.html'),
      },
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: succeeds, `dist/blog.html` exists, 0 leftover `include:` markers (`grep -c "include:" dist/blog.html`), contains `<h1>Strona w przygotowaniu</h1>`.

- [ ] **Step 4: Commit**

```bash
git add blog.html vite.config.ts
git commit -m "Add blog placeholder page"
git push origin main
```

---

### Task 2: Wire nav and footer to the Blog page

**Files:**
- Modify: `partials/nav.html`
- Modify: `partials/footer.html`

**Interfaces:** none.

- [ ] **Step 1: Add the nav link**

In `partials/nav.html`, find:

```html
    <li><a href="/realizacje.html">Realizacje</a></li>
    <li><a href="/o-nas.html">O nas</a></li>
    <li><a href="/#kontakt">Kontakt</a></li>
```

Replace it with:

```html
    <li><a href="/realizacje.html">Realizacje</a></li>
    <li><a href="/o-nas.html">O nas</a></li>
    <li><a href="/blog.html">Blog</a></li>
    <li><a href="/#kontakt">Kontakt</a></li>
```

- [ ] **Step 2: Add the footer "Menu" link**

In `partials/footer.html`, find:

```html
        <li><a href="/realizacje.html">Realizacje</a></li>
        <li><a href="/o-nas.html">O nas</a></li>
        <li><a href="/#kontakt">Kontakt</a></li>
```

Replace it with:

```html
        <li><a href="/realizacje.html">Realizacje</a></li>
        <li><a href="/o-nas.html">O nas</a></li>
        <li><a href="/blog.html">Blog</a></li>
        <li><a href="/#kontakt">Kontakt</a></li>
```

- [ ] **Step 3: Build and dev-server verify**

Run: `npm run build`, then `grep -c 'href="/blog.html"' dist/index.html`
Expected: `2` (one from nav, one from footer).

Run: `npm run dev`, then `curl -s http://localhost:5173/oferta-kawa.html | grep -c 'href="/blog.html"'`
Expected: `2` — confirms the shared partial updates every page. Stop the dev server afterward.

- [ ] **Step 4: Commit**

```bash
git add partials/nav.html partials/footer.html
git commit -m "Add Blog link to nav and footer"
git push origin main
```

---

### Task 3: `robots.txt` + `sitemap.xml`

**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`

**Interfaces:** none — static assets, Vite's `publicDir` copies them to `dist/` root verbatim, no `vite.config.ts` change needed.

- [ ] **Step 1: Create `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://vendingfresh.pl/sitemap.xml
```

- [ ] **Step 2: Create `public/sitemap.xml`**

Lists only the 8 indexable pages (the 4 `noindex` pages from Task 4 are deliberately excluded — listing a `noindex` page in the sitemap sends search engines a contradictory signal):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vendingfresh.pl/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://vendingfresh.pl/oferta-chlodnicze.html</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://vendingfresh.pl/oferta-przekaskowe.html</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://vendingfresh.pl/oferta-napoje.html</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://vendingfresh.pl/oferta-kawa.html</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://vendingfresh.pl/oferta-premium.html</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://vendingfresh.pl/oferta-dzierzawa.html</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://vendingfresh.pl/o-nas.html</loc>
    <priority>0.6</priority>
  </url>
</urlset>
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: `dist/robots.txt` and `dist/sitemap.xml` both exist (Vite copies `public/` contents to `dist/` root verbatim), with content identical to the source files (`diff public/robots.txt dist/robots.txt` and `diff public/sitemap.xml dist/sitemap.xml` both produce no output).

- [ ] **Step 4: Commit**

```bash
git add public/robots.txt public/sitemap.xml
git commit -m "Add robots.txt and sitemap.xml"
git push origin main
```

---

### Task 4: Meta description, canonical, and `robots noindex` on the 5 non-oferta/o-nas pages

**Files:**
- Modify: `index.html`
- Modify: `polityka.html`
- Modify: `rodo.html`
- Modify: `realizacje.html`
- Modify: `blog.html`

**Interfaces:** none new.

- [ ] **Step 1: `index.html` — description + canonical (no noindex, this is the real homepage)**

In `index.html`, find:

```html
    <title>VendingFresh — Automaty vendingowe dla firm</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace it with:

```html
    <title>VendingFresh — Automaty vendingowe dla firm</title>
    <meta name="description" content="Nowoczesne automaty vendingowe dla firm — świeże produkty, pełny serwis i nowoczesne technologie w jednym miejscu. Automaty chłodnicze, przekąskowe, z napojami i kawowe." />
    <link rel="canonical" href="https://vendingfresh.pl/" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 2: `polityka.html` — description + canonical + noindex**

In `polityka.html`, find:

```html
    <title>Polityka prywatności — VendingFresh</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace it with:

```html
    <title>Polityka prywatności — VendingFresh</title>
    <meta name="description" content="Pracujemy nad polityką prywatności VendingFresh — wróć tu wkrótce." />
    <link rel="canonical" href="https://vendingfresh.pl/polityka.html" />
    <meta name="robots" content="noindex, follow" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 3: `rodo.html` — description + canonical + noindex**

In `rodo.html`, find:

```html
    <title>RODO — VendingFresh</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace it with:

```html
    <title>RODO — VendingFresh</title>
    <meta name="description" content="Pracujemy nad informacją o przetwarzaniu danych osobowych (RODO) w VendingFresh — wróć tu wkrótce." />
    <link rel="canonical" href="https://vendingfresh.pl/rodo.html" />
    <meta name="robots" content="noindex, follow" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 4: `realizacje.html` — canonical + noindex (description already present)**

In `realizacje.html`, find:

```html
    <meta name="description" content="Prezentacja naszych wdrożeń automatów vendingowych — już wkrótce." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace it with:

```html
    <meta name="description" content="Prezentacja naszych wdrożeń automatów vendingowych — już wkrótce." />
    <link rel="canonical" href="https://vendingfresh.pl/realizacje.html" />
    <meta name="robots" content="noindex, follow" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 5: `blog.html` — canonical + noindex (description already present from Task 1)**

In `blog.html`, find:

```html
    <meta name="description" content="Artykuły o automatach vendingowych dla firm — już wkrótce." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace it with:

```html
    <meta name="description" content="Artykuły o automatach vendingowych dla firm — już wkrótce." />
    <link rel="canonical" href="https://vendingfresh.pl/blog.html" />
    <meta name="robots" content="noindex, follow" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 6: Build and verify**

Run: `npm run build`, then:
```bash
grep -c 'name="robots" content="noindex' dist/polityka.html dist/rodo.html dist/realizacje.html dist/blog.html
grep -c 'name="robots"' dist/index.html
grep -o 'rel="canonical" href="[^"]*"' dist/index.html dist/polityka.html dist/rodo.html dist/realizacje.html dist/blog.html
```
Expected: `1` for each of the 4 noindex checks; `0` matches for `index.html`'s robots check (no robots meta tag at all on the homepage); each canonical href matches that page's own real URL.

- [ ] **Step 7: Commit**

```bash
git add index.html polityka.html rodo.html realizacje.html blog.html
git commit -m "Add meta description, canonical, and noindex tags to placeholder/home pages"
git push origin main
```

---

### Task 5: Canonical tags on the 7 content pages

**Files:**
- Modify: `oferta-chlodnicze.html`
- Modify: `oferta-przekaskowe.html`
- Modify: `oferta-napoje.html`
- Modify: `oferta-kawa.html`
- Modify: `oferta-premium.html`
- Modify: `oferta-dzierzawa.html`
- Modify: `o-nas.html`

**Interfaces:** none new. These 7 pages already have a `<meta name="description">` from prior stages and get NO `noindex` (real, substantial content meant to be indexed).

- [ ] **Step 1: `oferta-chlodnicze.html`**

Find:

```html
    <meta name="description" content="Świeże produkty od lokalnych producentów — jaja, nabiał, miód, przetwory — dostępne 24 godziny na dobę, bez obsługi i bez kolejki." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace with:

```html
    <meta name="description" content="Świeże produkty od lokalnych producentów — jaja, nabiał, miód, przetwory — dostępne 24 godziny na dobę, bez obsługi i bez kolejki." />
    <link rel="canonical" href="https://vendingfresh.pl/oferta-chlodnicze.html" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 2: `oferta-przekaskowe.html`**

Find:

```html
    <meta name="description" content="Chipsy, batony i przekąski w zasięgu ręki — w biurze, szkole czy zakładzie pracy. Szeroki wybór produktów dopasowany do miejsca i grupy odbiorców." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace with:

```html
    <meta name="description" content="Chipsy, batony i przekąski w zasięgu ręki — w biurze, szkole czy zakładzie pracy. Szeroki wybór produktów dopasowany do miejsca i grupy odbiorców." />
    <link rel="canonical" href="https://vendingfresh.pl/oferta-przekaskowe.html" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 3: `oferta-napoje.html`**

Find:

```html
    <meta name="description" content="Zimne napoje, woda i soki — schłodzone i gotowe do wydania w każdej chwili. Idealne rozwiązanie dla biur, siłowni i miejsc o dużym natężeniu ruchu." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace with:

```html
    <meta name="description" content="Zimne napoje, woda i soki — schłodzone i gotowe do wydania w każdej chwili. Idealne rozwiązanie dla biur, siłowni i miejsc o dużym natężeniu ruchu." />
    <link rel="canonical" href="https://vendingfresh.pl/oferta-napoje.html" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 4: `oferta-kawa.html`**

Find:

```html
    <meta name="description" content="Świeżo parzona kawa i gorące napoje — jakość kawiarni bez baristy. Automaty kawowe VendingFresh parzą kawę na bazie świeżych ziaren." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace with:

```html
    <meta name="description" content="Świeżo parzona kawa i gorące napoje — jakość kawiarni bez baristy. Automaty kawowe VendingFresh parzą kawę na bazie świeżych ziaren." />
    <link rel="canonical" href="https://vendingfresh.pl/oferta-kawa.html" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 5: `oferta-premium.html`**

Find:

```html
    <meta name="description" content="Rozbudowane konfiguracje dla lokalizacji o dużym natężeniu ruchu — większa pojemność, szerszy asortyment i zaawansowane technologie w jednym urządzeniu." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace with:

```html
    <meta name="description" content="Rozbudowane konfiguracje dla lokalizacji o dużym natężeniu ruchu — większa pojemność, szerszy asortyment i zaawansowane technologie w jednym urządzeniu." />
    <link rel="canonical" href="https://vendingfresh.pl/oferta-premium.html" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 6: `oferta-dzierzawa.html`**

Find:

```html
    <meta name="description" content="Zero inwestycji początkowej — automat, montaż i serwis w jednym abonamencie. Dzierżawa to sposób na wprowadzenie automatu do swojej firmy." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace with:

```html
    <meta name="description" content="Zero inwestycji początkowej — automat, montaż i serwis w jednym abonamencie. Dzierżawa to sposób na wprowadzenie automatu do swojej firmy." />
    <link rel="canonical" href="https://vendingfresh.pl/oferta-dzierzawa.html" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 7: `o-nas.html`**

Find:

```html
    <meta name="description" content="Dostarczamy nowoczesne automaty vendingowe dla firm — chłodnicze, przekąskowe, z napojami i kawowe — łącząc świeże produkty, solidną technologię i pełny serwis w jednym miejscu." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Replace with:

```html
    <meta name="description" content="Dostarczamy nowoczesne automaty vendingowe dla firm — chłodnicze, przekąskowe, z napojami i kawowe — łącząc świeże produkty, solidną technologię i pełny serwis w jednym miejscu." />
    <link rel="canonical" href="https://vendingfresh.pl/o-nas.html" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 8: Build and verify**

Run: `npm run build`, then:
```bash
grep -o 'rel="canonical" href="[^"]*"' dist/oferta-chlodnicze.html dist/oferta-przekaskowe.html dist/oferta-napoje.html dist/oferta-kawa.html dist/oferta-premium.html dist/oferta-dzierzawa.html dist/o-nas.html
```
Expected: 7 lines, each `rel="canonical" href="https://vendingfresh.pl/<own-filename>"` matching the page it's found in — no cross-wiring between categories. None of these 7 files should contain a `robots` meta tag (`grep -c 'name="robots"' <each file>` → all `0`).

- [ ] **Step 9: Commit**

```bash
git add oferta-chlodnicze.html oferta-przekaskowe.html oferta-napoje.html oferta-kawa.html oferta-premium.html oferta-dzierzawa.html o-nas.html
git commit -m "Add canonical tags to oferta subpages and O nas"
git push origin main
```

---

### Task 6: Fix `index.html`'s missing `<main>` landmark

**Files:**
- Modify: `index.html`

**Interfaces:** none — pure structural wrap, matching the `<main>` convention every other page already has.

- [ ] **Step 1: Wrap `index.html`'s content in `<main>`**

In `index.html`, find:

```html
  <body id="top">
    <!-- include:nav.html -->

    <section class="hero" id="hero">
```

Replace it with:

```html
  <body id="top">
    <!-- include:nav.html -->

    <main>
      <section class="hero" id="hero">
```

Then find:

```html
    </section>

    <!-- include:footer.html -->
```

Replace it with:

```html
      </section>
    </main>

    <!-- include:footer.html -->
```

(The closing `</section>` here is the `id="kontakt"` CTA section's — the last of the 6 top-level sections. Every section between the hero and this one keeps its existing indentation; only the file's overall structure changes, wrapping all 6 sections in `<main>`. Re-indenting every line inside is not required — the oferta-subpages precedent left inner content at its original indentation after adding `<main>`, and that's acceptable here too, purely cosmetic.)

- [ ] **Step 2: Build and verify**

Run: `npm run build`, then `grep -c "<main>" dist/index.html` and `grep -c "</main>" dist/index.html`
Expected: `1` for each. Then `npm run dev`, `curl -s http://localhost:5173/ | grep -A2 "<main>"` to confirm `<main>` immediately precedes `<section class="hero"`. Stop the dev server afterward.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add main landmark to index.html"
git push origin main
```

---

### Task 7: Active-page nav highlighting

**Files:**
- Modify: `src/nav.ts`
- Modify: `src/style.css`

**Interfaces:**
- Modifies: `initNav()` (unchanged signature, `(): void`) — gains an internal call to a new, non-exported `markCurrentNavLink()` helper. No change to how `initNav()` is called from `src/pageInit.ts` or anywhere else.

- [ ] **Step 1: Add the highlighting logic to `src/nav.ts`**

Replace the full contents of `src/nav.ts`:

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

  markCurrentNavLink();
}

function markCurrentNavLink(): void {
  const currentPath = window.location.pathname;
  document.querySelectorAll<HTMLAnchorElement>('.nav__links a').forEach((link) => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    if (linkPath.endsWith('.html') && linkPath === currentPath) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    }
  });
}
```

- [ ] **Step 2: Add the `.is-current` CSS rule**

In `src/style.css`, find:

```css
.nav__links a:hover {
  color: var(--primary-dark);
}
```

Replace it with:

```css
.nav__links a:hover {
  color: var(--primary-dark);
}
.nav__links a.is-current {
  color: var(--primary-dark);
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Build and dev-server verify**

Run: `npm run build`, then `npm run dev`. Check whether port 5173 is already in use by an unrelated process first. Then:
```bash
curl -s http://localhost:5173/oferta-kawa.html | grep -o '<a href="/oferta-kawa.html"[^>]*>'
```
Expected: the anchor tag is present, but note that `aria-current`/`is-current` are added by client-side JS (`markCurrentNavLink()` runs after page load), so a static `curl` of the server-rendered HTML will NOT show the `is-current` class or `aria-current` attribute — that's expected and correct, not a bug. To actually verify the JS logic, read `src/nav.ts` again after Step 1 and confirm `markCurrentNavLink()` is called inside `initNav()` and its comparison logic matches the spec (pathname equality, `.html`-suffix guard). Stop the dev server afterward.

- [ ] **Step 5: Commit**

```bash
git add src/nav.ts src/style.css
git commit -m "Add active-page nav highlighting"
git push origin main
```

---

### Task 8: Full verification pass

**Files:** none (verification only; fix forward if something's broken)

- [ ] **Step 1: Run the full automated suite**

Run, in order:
1. `npx tsc --noEmit` — expect no errors.
2. `npm run test` — expect the existing 4 `resolveIncludes` tests to still pass.
3. `npm run build` — expect success, all 12 HTML entries present in `dist/` (`index.html`, `polityka.html`, `rodo.html`, `realizacje.html`, `blog.html`, 6× `oferta-*.html`, `o-nas.html`), plus `dist/robots.txt` and `dist/sitemap.xml`, zero leftover `include:` markers across all HTML files (`grep -rc "include:" dist/*.html` → all zeros).

- [ ] **Step 2: Manual walk of the verification checklist**

Run `npm run dev` and check (stop the dev server when done):
- `blog.html` renders the placeholder content correctly, with the shared nav/footer.
- Nav shows Home / Oferta ▾ / Realizacje / O nas / Blog / Kontakt, in that order, on every page.
- `index.html` is wrapped in `<main>` and still renders identically to before (hero, all 6 sections, footer).
- Open two different pages (e.g. `oferta-kawa.html` and `o-nas.html`) directly in the browser-equivalent check (or via `read_page`/`get_page_text` if a browser tool is available in this environment) and confirm each page's own nav link gets the `is-current` visual treatment (primary-dark color) and no other link does.
- `dist/robots.txt` and `dist/sitemap.xml` (or the dev-served equivalents at `/robots.txt` and `/sitemap.xml`) are valid — `curl -s http://localhost:5173/robots.txt` and `curl -s http://localhost:5173/sitemap.xml` both return the expected content.
- Spot-check 2-3 pages' `<head>` for the right combination: `index.html` has description+canonical, no robots tag; `polityka.html` has description+canonical+noindex; `oferta-chlodnicze.html` has (pre-existing) description+canonical, no robots tag.

- [ ] **Step 3: Fix forward if anything's off, then final commit**

If Step 2 surfaces an issue, fix it directly (small targeted edit), re-run Step 1 and the relevant part of Step 2, then:

```bash
git add -A
git commit -m "Fix Blog/lokalne SEO verification findings"
git push origin main
```

If nothing needed fixing, no commit is required for this task.

---

## Self-review notes

- **Spec coverage:** every section of the design spec maps to a task — blog placeholder (Task 1), nav/footer wiring (Task 2), robots/sitemap (Task 3), meta/canonical/noindex for the 5 simple pages (Task 4) and the 7 content pages (Task 5), `<main>` fix (Task 6), nav highlighting (Task 7), full verification (Task 8). The spec's "poza zakresem" list (OG tags, JSON-LD, icon-partial refactor, domain verification) has no corresponding task, matching its explicit exclusion.
- **Correction from spec to plan:** the spec's section 3 said sitemap.xml lists "all 12 pages" — at plan-writing time this was corrected to 8 (excluding the 4 `noindex` pages), since listing `noindex` pages in a sitemap sends search engines a contradictory signal. This is a refinement within the same authorship, not a conflict requiring escalation — noted here per the self-review process.
- **Placeholder scan:** no TBD/TODO; `blog.html`'s copy is the intentional, honest placeholder.
- **Type consistency:** `initNav()`'s exported signature (`(): void`) is unchanged — `markCurrentNavLink()` is an internal, non-exported helper, so no consumer of `initNav` (`src/pageInit.ts`) needs to change.
- **Scope:** the 5 vs. 7-page split in Tasks 4-5 covers all 12 pages exactly once for canonical tags, with noindex applied to exactly the 4 thin pages and nowhere else — cross-checked against the file list twice.
