# VendingFresh — Blog + Lokalne SEO (Design Spec)

Date: 2026-08-06
Status: Approved (user directed continuous execution for the rest of the session — decisions
below are mine, documented for traceability, not individually re-confirmed).

## Context

This is the last of the four remaining stages named in the brandbook's "Decyzja dot.
kolejności prac" (architektura wielostronicowa, podstrony oferty, realizacje/o nas — all done
— then "blog, lokalne SEO"). It also closes out several items the final whole-branch reviews
of the two prior stages explicitly recommended: `robots.txt`/`sitemap.xml`, a decision on
`noindex` for thin pages, `index.html`'s missing `<main>` landmark, and active-page nav
highlighting (now that 5 pages have their own nav entry with zero positional feedback).

## Hard constraint: no fabricated blog content

Same reasoning as Realizacje: a blog with authored posts implies genuine ongoing publishing.
No article topics, drafts, or direction exist. **`blog.html` ships as a placeholder**,
identical in spirit to `realizacje.html` — "w przygotowaniu" — not fabricated articles.

## Assumption flagged for verification: production domain

Canonical URLs, `sitemap.xml`, and `robots.txt`'s sitemap reference all need an absolute
domain. No `vercel.json`, README, or confirmed live domain exists in this repo — per
[[vendingfresh-github-vercel-setup]], Vercel was never confirmed connected. The one concrete
signal in the codebase is the contact email `kontakt@vendingfresh.pl`, used consistently
site-wide. This spec assumes **`https://vendingfresh.pl`** as the production domain. If the
real domain differs (or the site ends up on a `*.vercel.app` subdomain), every URL landed by
this plan needs a find-and-replace — flagged clearly in the final report, not silently
guessed and forgotten.

## Trimmed scope

Explicitly **not** doing in this stage (would meaningfully grow scope beyond what prior
reviews asked for): Open Graph meta tags, JSON-LD structured data, an icon-partial
refactor. These are reasonable future work, not blocking anything.

## 1. `blog.html` — placeholder page

Same structure as `realizacje.html`: `.placeholder-page` layout inside `<main>`, shared
nav/footer, `src/placeholder.ts` entry.

```html
<main class="placeholder-page">
  <img class="placeholder-page__logo" src="/vendingfresh_logo_full_web.png" alt="VendingFresh" />
  <h1>Strona w przygotowaniu</h1>
  <p>Pracujemy nad artykułami o automatach vendingowych — wróć tu wkrótce.</p>
  <a class="btn btn--primary" href="/">Wróć na stronę główną</a>
</main>
```

## 2. Navigation and footer wiring

`partials/nav.html` gains one more item, after "O nas": `<li><a href="/blog.html">Blog</a></li>`.
`partials/footer.html`'s "Menu" column gains the same link in the same position.

## 3. `robots.txt` + `sitemap.xml`

`robots.txt` at the project root (served as a static asset via Vite's `publicDir`, so it goes
in `public/`, not project root — the only file in this plan that lives there instead of next
to the other `.html` pages):

```
User-agent: *
Allow: /

Sitemap: https://vendingfresh.pl/sitemap.xml
```

`sitemap.xml`, also in `public/`, listing all 12 pages with their real paths.

## 4. Meta description + canonical + `robots noindex` on the 5 pages missing them

`index.html`, `polityka.html`, `rodo.html`, `realizacje.html`, `blog.html` don't yet have a
`<meta name="description">` (the oferta pages and `o-nas.html` already got one in prior
stages). Each gets:
- `<meta name="description" content="...">` (new copy, reusing existing established page
  copy where it exists — e.g. `index.html`'s hero subtitle — not fabricated).
- `<link rel="canonical" href="https://vendingfresh.pl/<path>">`.
- `polityka.html`, `rodo.html`, `realizacje.html`, `blog.html` (thin/placeholder content)
  additionally get `<meta name="robots" content="noindex, follow">` — keeps them out of
  search results until they have real content, while still letting crawlers follow links
  through them (nav/footer). `index.html` does NOT get `noindex` — it's the real homepage.

## 5. Canonical tags on the remaining 7 content pages

The 6 `oferta-*.html` pages and `o-nas.html` already have a `<meta name="description">` from
prior stages — they only need `<link rel="canonical" href="https://vendingfresh.pl/<path>">`
added. No `noindex` — these are real, substantial content pages meant to be indexed.

## 6. Fix `index.html`'s missing `<main>` landmark

`index.html` predates the `<main>` convention established during the oferta-subpages final
review (every other page already has it). Wrap `index.html`'s existing content (everything
between the nav include and the footer include) in `<main>`.

## 7. Active-page nav highlighting

`partials/nav.html`'s links have no way to know which page is current (it's a shared,
static partial). `src/nav.ts`'s `initNav()` gains a small addition: compare
`window.location.pathname` against each `.nav__links a`'s `href` pathname; on a match, add
`aria-current="page"` and a new `.nav__links a.is-current` CSS rule (bold + primary-dark
color, mirroring the existing `:hover` treatment) to the matching link. Anchor-only links
(`/#top`, `/#kontakt`) never match a page path and are excluded from this comparison — only
`.html`-suffixed hrefs participate.

```css
.nav__links a.is-current {
  color: var(--primary-dark);
}
```

## Testing and verification

`npm run build` succeeds with all 12 HTML entries present and zero leftover `include:`
markers; `robots.txt`/`sitemap.xml` present in `dist/`; `npm run dev` + manual spot-check
confirms: Blog appears in nav/footer identically everywhere, `blog.html` renders correctly,
each page's nav link gets `is-current` styling only on its own page, and `index.html`'s
`<main>` wraps its full content without breaking layout.

## Poza zakresem (świadomie)

- Real blog articles — blocked on the user supplying topics/direction; the placeholder is
  trivially replaceable later, same as Realizacje.
- Open Graph tags, JSON-LD structured data, icon-partial refactor — reasonable future work,
  deliberately trimmed from this stage's scope.
- Verifying the actual production domain — flagged as an assumption above, not resolved here.

## Self-review

- **Placeholder scan:** no TBD/TODO; `blog.html`'s "w przygotowaniu" text is the intentional,
  honest placeholder — not a plan gap. The domain assumption is explicitly flagged, not
  silently guessed.
- **Internal consistency:** sections 4-5 together cover all 12 pages exactly once each (no
  page gets canonical twice, no page is skipped) — 5 pages in section 4, 7 in section 5.
- **Scope:** several small, independent technical additions (blog page, sitemap/robots, meta
  tags, `<main>` fix, nav highlighting) bound by one theme (site completeness/discoverability)
  — appropriately one plan, not a forced merge of unrelated work.
- **Ambiguity check:** the nav-highlighting comparison rule (pathname match, anchor-links
  excluded) is stated precisely, not left to implementer interpretation.
