# VendingFresh — O nas + Realizacje (Design Spec)

Date: 2026-08-06
Status: Approved (user directed continuous execution — "zrob już wszystko, daj mi znać jak
wszysciutko będzie gotowe" — decisions below are mine, documented for traceability, not
individually re-confirmed).

## Context

The multi-page architecture foundation and the oferta subpages are both complete and merged
to `main`. Per the brandbook's "Decyzja dot. kolejności prac", remaining stages are
"architektura wielostronicowa" (done), "podstrony oferty" (done), "realizacje, o nas, blog,
lokalne SEO" — this spec covers realizacje + o nas together, since both are simple pages that
share the same nav/footer wiring change and neither needs its own spec-worth of independent
complexity.

The brandbook's rebrand-era decision explicitly excluded "Realizacje/O nas/Blog nav items"
from Home's nav as out of scope for Etap 1. Adding real pages for two of those three now means
nav grows to include them.

## Hard constraint: no fabricated business claims

"Realizacje" (case studies/portfolio) inherently implies real completed client projects —
names, locations, results. No such data exists anywhere in this repo, and inventing it would
be publishing false claims to site visitors. **Realizacje ships as a placeholder page**,
identical in spirit to how `polityka.html`/`rodo.html` started — "w przygotowaniu" — easy to
replace with real content once the user supplies it. This is not a design compromise, it's the
same honesty constraint already applied to the oferta subpages (no fabricated technical specs)
extended to its logical conclusion for a page that's *entirely* about specific real facts.

"O nas" is safe to build with real content today: it only needs to describe what VendingFresh
already does and already says about itself elsewhere in this codebase (brandbook voice, Home's
"Dlaczego VendingFresh" values, real contact details) — no invented history, team size, client
count, or founding date.

## 1. `realizacje.html` — placeholder page

Same structure as `polityka.html`/`rodo.html`: `.placeholder-page` layout, logo, heading,
one sentence, a button back to Home. Also gets the shared nav/footer (unlike polityka/rodo,
which predate the multi-page foundation's `<main>` convention established in the oferta-
subpages fix round — this page ships with `<main>` from the start).

```html
<main class="placeholder-page">
  <img class="placeholder-page__logo" src="/vendingfresh_logo_full_web.png" alt="VendingFresh" />
  <h1>Strona w przygotowaniu</h1>
  <p>Pracujemy nad prezentacją naszych realizacji — wróć tu wkrótce.</p>
  <a class="btn btn--primary" href="/">Wróć na stronę główną</a>
</main>
```

## 2. `o-nas.html` — real content page

No new CSS component — reuses three already-existing patterns verbatim: `.section`/
`.section__header` (eyebrow + title, centered), `.why-grid`/`.why-card` (3 value cards,
reusing existing icons from Home), and `.cta` (identical CTA block to every other page).

One small CSS addition: a `.section__lead` rule for a centered intro paragraph under the
section header (the class name was removed as dead code during the rebrand's final-review
fix pass — reintroducing it now gives it a real, single consumer, which is the difference
between dead code and a component that hasn't been needed yet).

```css
.section__lead {
  max-width: 60ch;
  margin: 0 auto 1rem;
  text-align: center;
  color: var(--text-light);
  font-size: 1.05rem;
  line-height: 1.6;
}
```

Page content:
- Eyebrow: `O nas`
- Title (`h2` inside `.section__header`, matching every other section on the site): `VendingFresh`
- Lead: „Dostarczamy nowoczesne automaty vendingowe dla firm — chłodnicze, przekąskowe, z
  napojami i kawowe — łącząc świeże produkty, solidną technologię i pełny serwis w jednym
  miejscu. Naszym celem jest, żeby automat w Twojej firmie działał i wyglądał jak część
  nowoczesnego, dobrze zaprojektowanego miejsca pracy."
- Three value cards (new copy, consistent in tone with Home's existing "Dlaczego
  VendingFresh" cards — reusing 3 of those same 6 icons, not inventing new artwork):
  1. „Jakość i staranność" — Wybieramy sprawdzone technologie i solidne materiały w każdym
     automacie. *(icon: shield-check, same as Home's "Wysoka jakość")*
  2. „Pełne wsparcie" — Od pierwszego kontaktu po serwis — jesteśmy do dyspozycji na każdym
     etapie. *(icon: handshake, same as Home's "Zaufanie i wsparcie")*
  3. „Elastyczne podejście" — Dopasowujemy ofertę do branży, lokalizacji i potrzeb Twojej
     firmy. *(icon: sliders, same as Home's "Elastyczna oferta")*
- CTA section: identical block to every other page.

## 3. Navigation and footer wiring

`partials/nav.html`'s `.nav__links` gains two items, between the "Oferta" dropdown and
"Kontakt":

```html
<li><a href="/realizacje.html">Realizacje</a></li>
<li><a href="/o-nas.html">O nas</a></li>
```

`partials/footer.html`'s "Menu" column gains the same two links, after "Oferta":

```html
<li><a href="/realizacje.html">Realizacje</a></li>
<li><a href="/o-nas.html">O nas</a></li>
```

## 4. Build registration

Both new files registered in `vite.config.ts`'s `build.rollupOptions.input`, following the
established recipe.

## Testing and verification

Same pattern as every prior plan in this project: `npm run build` succeeds with all 11 HTML
entries present and zero leftover `include:` markers; `npm run dev` + manual spot-check
confirms both new pages render correctly and the nav/footer additions appear identically on
every page (shared partials).

## Poza zakresem (świadomie)

- Real realizacje content (client names, project photos, results) — blocked on the user
  supplying real data; the placeholder is designed to be trivially replaced once that exists.
- Team photos, founding story, specific numbers on the O nas page — not fabricated.
- Active-page nav highlighting — still deferred (same reasoning as prior specs), though now
  five pages have their own nav entry, so this is worth prioritizing in the next stage.

## Self-review

- **Placeholder scan:** no TBD/TODO; `realizacje.html`'s "w przygotowaniu" text is an
  intentional, honest placeholder (mirrors existing precedent), not a plan gap.
- **Internal consistency:** nav/footer wiring in section 3 doesn't conflict with the oferta
  subpages' wiring from the prior plan — different list items, same shared partials.
- **Scope:** two small pages + one shared partial edit, single cohesive plan.
- **Ambiguity check:** icon reuse for O nas's 3 value cards is specified exactly (which Home
  icon each one reuses), not left open.
