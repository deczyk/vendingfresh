# VendingFresh — Visual Redesign Pass (Design Spec)

Date: 2026-08-06
Status: Approved by user ("ta"), ready for implementation planning.

## Context

User feedback after the full site (11 pages) was built: "za chuj nie podoba mi sie
cala strona, jest pusta, sucha" (the whole site looks empty and dry). Follow-up
multi-select narrowed this to three concrete issues:
1. **Brak koloru/energii** — almost everything is white/light-gray, the green
   accent (`#59B52C`) only shows up in buttons and small eyebrow/icon touches.
2. **Brak dowodów społecznych + generyczny układ** — no trust signals (numbers,
   reviews, clients), and the repeated icon+heading+text card pattern
   (`.why-card`) feels templated.
3. **Za dużo białej przestrzeni / za mało treści** — sections feel sparse.

Explicitly NOT flagged: missing real photos / too many icons — that part of the
site is considered fine as-is, out of scope here.

## Hard constraint: no fabricated social proof

User confirmed no real numbers/testimonials exist to use (client counts, years in
business, reviews). The "lack of trust signals" issue is addressed by
**repackaging content the site already truthfully says** (full service included,
remote monitoring, flexible purchase-or-lease terms, support at every stage —
all already stated elsewhere on Home) into a more prominent, credibility-signaling
position, not by inventing new facts, numbers, or quotes.

## Approach

Restyle within the existing component system (`.section`, `.why-grid`,
`.offer-hero`, `.cta`) rather than introducing new layout primitives — addresses
all three issues with contained risk, and (being pure CSS for most of it)
cascades automatically to all 11 pages sharing `src/style.css`. Rejected
alternatives: a deeper component redesign (asymmetric/bento grids) — too large
for one pass; new photography/illustration — requires real assets that don't
exist.

## 1. Color rhythm — three section backgrounds instead of near-uniform white

- New `.section--tint` variant: a soft green wash (`#EFF6EC`) instead of white —
  replaces `.section--surface` on the sections that most need to stop blending
  into their neighbors: Home's "Dlaczego VendingFresh", all 6 oferta subpages'
  benefits section, and `o-nas.html`'s content section. (`.section--surface`
  itself stays defined and unused after this — no page needs it once these
  swaps land, but removing the class itself is out of scope for this pass since
  future pages may still want a plain white section.)
- New `.section--band` variant: a bold navy gradient (`#102235 → #1B3550` — the
  brandbook's own "Gradient firmowy", defined in the brand doc but never
  actually implemented in CSS until now) with white text, applied to Home's
  "Jak wygląda współpraca" section — turns it into a clear visual anchor
  midway down the page instead of another white block.
- `.cta`'s flat navy background becomes the same brand gradient — every page's
  closing CTA (all 11 of them share this block) gets a small lift for free.

## 2. Less generic cards — icon backdrops, zero markup changes

`.why-card__icon` (used 27 times across the site: 6 on Home, 3 each on the 6
oferta pages, 3 on `o-nas.html`) currently renders as a bare stroked icon
floating on a white card. It gains a soft green circular backdrop (12% opacity
of `--primary`) via a CSS-only change to the existing class — the icon's visual
size on screen is unchanged, it just sits inside a colored 72×72 rounded square
now. Because every instance already uses this one shared class, this fixes the
"generic, flat" feeling everywhere at once without touching any of the 8 HTML
files that contain a `why-card`.

## 3. Trust bar — real content, repackaged, not invented

A new compact band directly under Home's hero (before "Dlaczego"), four short
credibility statements with icons, reusing exactly what the site already says
elsewhere and existing icon artwork (no new icons, no new claims):

1. "Zdalny monitoring 24/7" (existing claim, monitor icon)
2. "Pełen serwis i montaż" (existing claim, handshake icon)
3. "Zakup lub dzierżawa — Ty wybierasz" (existing claim, sliders icon)
4. "Wsparcie na każdym etapie" (existing claim, shield-check icon)

Styled as a single bordered, shadowed strip — visually similar to a "trusted by"
bar pattern, minus fabricated client logos, which the site doesn't have.
Home-only (the oferta pages already have their own benefits section serving the
same trust-building purpose in more depth).

## 4. Density — tighter spacing, subtle texture, no content deleted

- `.section`'s vertical padding: `6rem` → `5rem` (`4rem` → unchanged on mobile).
- `.section__header`'s bottom margin: `3rem` → `2.5rem`.
- `.hero` and `.offer-hero` gain a very faint CSS-only dot-grid texture
  (`radial-gradient`, no image asset, `rgba(16,34,53,0.06)` — barely visible,
  breaks up flat white without competing with text contrast).

## Testing and verification

Same pattern as every prior stage: `npm run build` succeeds, `npm run dev` +
manual spot-check confirms the three section-background variants render
correctly, the trust bar appears only on Home, icon backdrops appear
identically across all pages using `.why-card`, and spacing changes don't break
any layout at the existing breakpoints (860px/768px/560px). No new automated
tests — this is a CSS/markup styling pass, matching the established pattern for
this kind of change throughout the project.

## Poza zakresem (świadomie)

- Fabricated social proof (numbers, testimonials, client logos) — explicitly
  rejected per the hard constraint above.
- New component layouts (bento grids, asymmetric cards) — trimmed per the
  approach decision.
- New photography or illustration — user didn't flag this as an issue.
- Removing the now-unused `.section--surface` class definition — harmless to
  leave, may still be useful for a future plain-white section.

## Self-review

- **Placeholder scan:** no TBD/TODO; trust-bar copy and all four claims are
  final, sourced from content already live on the site.
- **Internal consistency:** the tint/band/gradient changes don't conflict with
  any existing responsive rule (checked against all three breakpoints in
  `src/style.css`); the icon backdrop change is purely additive box-model CSS
  on an existing class, doesn't alter icon SVG content.
- **Scope:** one cohesive visual pass across a shared stylesheet plus one new
  content block — single implementation plan, not a multi-project split.
- **Ambiguity check:** exact color values, exact copy, and exact file list (9
  files: `src/style.css` + `index.html` + `o-nas.html` + 6 `oferta-*.html`) are
  all specified above, nothing left for the implementer to invent.
