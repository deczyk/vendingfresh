# VendingFresh — "Stal i turkus" Repaint (Design Spec)

Date: 2026-08-22
Status: Approved by user (direction "B" picked from a 3-way mockup comparison, "cudownie! cała strona tak ma być").

## Context

User feedback on the current site (green `#59B52C` + navy `#102235` palette, live since the
2026-08-06/08-22 redesign passes): "brzydkie te kolory, strona i wgl wszystko" (the colors are
ugly, the whole page). Follow-up was too broad to act on verbally, so three full-fidelity color
directions were mocked up side-by-side on the site's real homepage content (hero, trust bar,
why-cards, CTA) and shown as an artifact. User picked **direction B — "Stal i turkus"
(Steel & Teal)** outright, no mixing, and asked for it site-wide.

## Approach

Same mechanism as the 2026-08-06 visual redesign pass: this is a **token-level repaint**, not a
new component system. `src/style.css` defines the whole palette as CSS custom properties
(`:root { --primary; --secondary; ... }`) which every one of the 14 pages inherits through the
single shared entry point (`pageInit.ts`, imported by every page's `main.ts`/`placeholder.ts`).
Swapping the token values cascades everywhere in one edit. A handful of places bypass the
tokens with literal hex/rgba (found by grep) and need direct fixes alongside the token swap —
listed below, nothing else in the CSS hardcodes color.

Rejected alternative: introducing a second accent-color layer (e.g. keep green for "success"
semantics, teal only for brand chrome) — rejected because the user approved one coherent
direction, not a hybrid, and the existing `--success/--warning/--danger/--info` semantic colors
already cover status use cases separately from the brand accent.

## Token changes

| Token | Old | New | Used for |
|---|---|---|---|
| `--primary` | `#59B52C` | `#0E8577` | buttons, links, icons, active states |
| `--primary-dark` | `#479822` | `#0B6B60` | hover/active shade of primary |
| `--secondary` | `#102235` | `#12181C` | headings, dark text, gradient start |
| `--secondary-light` | `#1B3550` | `#1E262B` | gradient end |
| `--background` | `#F8FAFB` | `#EFF1F2` | page background |
| `--surface` | `#FFFFFF` | `#FFFFFF` | unchanged — cards stay white |
| `--border` | `#E6EAEE` | `#DCE1E3` | card/input borders |
| `--text` | `#1B2733` | `#12181C` | body text (aligned with new secondary) |
| `--text-light` | `#687583` | `#5A656B` | secondary/muted text |
| `--tint` | `#EFF6EC` (green wash) | `#E7EBEC` (steel wash) | `.section--tint` backgrounds |
| `--gradient-brand` | `linear-gradient(135deg, #102235, #1B3550)` | `linear-gradient(135deg, #12181C, #1E262B)` | `.section--band`, `.cta` |

`--success`, `--warning`, `--danger`, `--info` are untouched — they're status semantics, not
brand identity, and were never part of the "ugly" complaint.

## Hardcoded-color fixes (bypass the tokens today, grep-verified)

- `.why-card__icon` background: `rgba(89, 181, 44, 0.12)` → `rgba(14, 133, 119, 0.14)` (teal
  tint at roughly the same visual weight as the current green tint — this is the icon backdrop
  used 27 times across Home/oferta/o-nas).
- `.section--band .section__eyebrow` color: `#9FD98A` (light green, readable on navy) →
  `#6FE0CE` (light teal, readable on the new graphite gradient) — used on Home's "Jak wygląda
  współpraca" band.
- Dot-grid hero texture, two occurrences (`.hero`, `.offer-hero`):
  `radial-gradient(rgba(16, 34, 53, 0.06) 1.5px, transparent 1.5px)` →
  `radial-gradient(rgba(18, 24, 28, 0.06) 1.5px, transparent 1.5px)` (tied to the new
  `--secondary` value instead of the old navy literal).

## Explicitly out of scope

- **Product/hero photography stays untouched** — no grayscale/desaturation filter on
  `.hero__photo`, `.offer-hero__photo`, or the product images in Home's "Dla kogo" cards. The
  mockup used a subtle `grayscale(.25)` on the placeholder machine photo for mood, but the real
  site's photos are informational (actual machine/product appearance) — desaturating them risks
  misrepresenting the product and wasn't part of what the user approved (they approved the UI
  chrome direction, photos weren't discussed). If this turns out to look inconsistent once
  applied, revisit in a follow-up pass with the photos visible, not as an assumption now.
- **No markup changes** — same as the prior redesign pass, this is CSS-only. All 14 pages,
  `partials/nav.html`, `partials/footer.html` inherit through `src/style.css`; none need edits.
- **Brandbook doc (`docs/brand/2026-08-05-brandbook.md`)** — its CSS variable block and stated
  brand colors are now stale against this change. Updating that doc is in scope for the
  implementation plan (small doc edit) but is not a design decision — it's a record of what
  ships.
- **`--font-brand`, radii, shadow tokens** — untouched, not part of the color complaint.

## Testing and verification

Same pattern as every prior CSS-only pass: `npm run build` succeeds, `npm run dev` + manual
spot-check across Home, one `oferta-*` subpage, `o-nas.html`, `kontakt.html`, and `blog.html`
confirms every place that used to show green/navy now shows teal/graphite consistently — call
out especially the two hardcoded spots (why-card icon backdrop, band eyebrow) since token swaps
alone won't fix those. No new automated tests — this is a pure styling pass.

## Self-review

- **Placeholder scan:** no TBD/TODO; every hex value above is final and grep-sourced from the
  actual current CSS, not invented.
- **Internal consistency:** confirmed every non-token color reference in `src/style.css` via
  `grep -n "trust-bar\|section--tint\|section--band\|\.cta\b\|why-card__icon\|dot-grid\|radial-gradient\|linear-gradient"` — the three hardcoded spots listed above are the only ones; trust-bar
  itself already reads `var(--primary)`/`var(--secondary)`, no separate fix needed there.
- **Scope:** one token-level CSS pass plus a doc update — single implementation plan.
- **Ambiguity check:** exact old→new hex values and the exact file (`src/style.css`, one doc)
  are fully specified; nothing left for the implementer to invent.
