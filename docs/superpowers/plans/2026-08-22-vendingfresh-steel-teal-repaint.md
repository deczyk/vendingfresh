# VendingFresh — "Stal i turkus" Repaint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's green/navy color palette with the approved "steel & teal" palette (`#0E8577` / `#12181C`) across all 14 pages, by editing CSS custom properties and the handful of hardcoded colors that bypass them.

**Architecture:** Pure CSS token swap in `src/style.css`'s single `:root` block, which every page inherits through the shared `pageInit.ts` entry point — one edit, cascades everywhere. Three additional spots hardcode literal colors instead of reading the tokens and need direct fixes. A trailing doc task keeps the brandbook's recorded palette in sync with what ships.

**Tech Stack:** Static HTML + Vite build, plain CSS custom properties (no preprocessor, no CSS-in-JS).

## Global Constraints

- Exact hex values are fixed by the design spec (`docs/superpowers/specs/2026-08-22-vendingfresh-steel-teal-repaint-design.md`) — do not substitute approximate colors.
- No markup (`.html`) changes and no product/hero photo filters — this is CSS-token-only, per spec's "Explicitly out of scope" section.
- `--success`, `--warning`, `--danger`, `--info`, `--font-brand`, radii, and shadow tokens are untouched.
- No new automated tests — matches the established pattern for prior CSS-only passes on this project (see spec's Testing section). Verification is `npm run build` + manual spot-check.

---

### Task 1: Swap the root color tokens in `src/style.css`

**Files:**
- Modify: `src/style.css:1-32` (the `:root` block)

**Interfaces:**
- Produces: every downstream rule in `src/style.css` and all 14 HTML pages continues to read the same token names (`var(--primary)`, `var(--secondary)`, etc.) — only the values change, so no other file needs edits for the token-driven parts of the UI.

- [ ] **Step 1: Replace the token values**

Open `src/style.css` and replace lines 1-32 (the entire `:root { ... }` block) with:

```css
:root {
  --primary: #0E8577;
  --primary-dark: #0B6B60;

  --secondary: #12181C;
  --secondary-light: #1E262B;

  --background: #EFF1F2;
  --surface: #FFFFFF;

  --border: #DCE1E3;

  --text: #12181C;
  --text-light: #5A656B;

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

  --tint: #E7EBEC;
  --gradient-brand: linear-gradient(135deg, #12181C, #1E262B);
}
```

Only six values changed from the original (`--primary`, `--primary-dark`, `--secondary`,
`--secondary-light`, `--background`, `--border`, `--text`, `--text-light`, `--tint`,
`--gradient-brand`); `--surface`, the semantic colors, radii, shadows, and `--font-brand` are
copied through unchanged — do not alter them.

- [ ] **Step 2: Visually confirm the token swap has no syntax errors**

Run: `npm run build`
Expected: build succeeds with no CSS parse errors (a stray bracket or missing semicolon in the
`:root` block would break the whole stylesheet, not just this block).

- [ ] **Step 3: Commit**

```bash
git add src/style.css
git commit -m "Repaint brand tokens: steel & teal palette

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Fix the three hardcoded colors that bypass the tokens

**Files:**
- Modify: `src/style.css:223` and `src/style.css:309` (dot-grid texture, two occurrences)
- Modify: `src/style.css:381` (`.section--band .section__eyebrow`)
- Modify: `src/style.css:445` (`.why-card__icon` background)

**Interfaces:**
- Consumes: none (independent of Task 1's token values — these are literal colors, not `var()` references).
- Produces: no new selectors or classes; visual output of `.hero`, `.offer-hero`, `.section--band .section__eyebrow`, and `.why-card__icon` (used 27 times across Home/oferta/o-nas) matches the new palette.

- [ ] **Step 1: Fix the dot-grid texture on `.hero`**

In `src/style.css`, find (around line 223, inside the `.hero` rule):

```css
  background-image: radial-gradient(rgba(16, 34, 53, 0.06) 1.5px, transparent 1.5px);
```

This exact line appears twice in the file — once for `.hero` (~line 223) and once for
`.offer-hero` (~line 309). Replace **both** occurrences with:

```css
  background-image: radial-gradient(rgba(18, 24, 28, 0.06) 1.5px, transparent 1.5px);
```

- [ ] **Step 2: Fix the band eyebrow color**

Find:

```css
.section--band .section__eyebrow {
  color: #9FD98A;
}
```

Replace with:

```css
.section--band .section__eyebrow {
  color: #6FE0CE;
}
```

- [ ] **Step 3: Fix the why-card icon backdrop**

Find:

```css
.why-card__icon {
  width: 48px;
  height: 48px;
  padding: 12px;
  box-sizing: content-box;
  color: var(--primary);
  background: rgba(89, 181, 44, 0.12);
  border-radius: var(--radius-sm);
  margin-bottom: 1.25rem;
}
```

Replace the `background` line only:

```css
.why-card__icon {
  width: 48px;
  height: 48px;
  padding: 12px;
  box-sizing: content-box;
  color: var(--primary);
  background: rgba(14, 133, 119, 0.14);
  border-radius: var(--radius-sm);
  margin-bottom: 1.25rem;
}
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/style.css
git commit -m "Fix hardcoded colors that bypassed the brand tokens

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Update the brandbook doc's recorded palette

**Files:**
- Modify: `docs/brand/2026-08-05-brandbook.md:66-92` (the CSS variables code block)
- Modify: `docs/brand/2026-08-05-brandbook.md` (status section — add a dated note)

**Interfaces:**
- Consumes: the final token values from Task 1.
- Produces: nothing consumed by other tasks — this is a documentation-only change so the brandbook doesn't contradict what's actually deployed.

- [ ] **Step 1: Replace the CSS variables block**

In `docs/brand/2026-08-05-brandbook.md`, the code block starting at line 66 (` ```css `) currently
reads (lines 68-91):

```
  --primary:#59B52C;
  --primary-dark:#479822;

  --secondary:#102235;
  --secondary-light:#1B3550;

  --background:#F8FAFB;
  --surface:#FFFFFF;

  --border:#E6EAEE;

  --text:#1B2733;
  --text-light:#687583;

  --success:#38A169;
  --warning:#F6AD55;
  --danger:#E53E3E;
  --info:#3182CE;

  --radius-sm:12px;
  --radius-md:20px;
  --radius-lg:28px;

  --shadow:0 8px 30px rgba(16,34,53,.08);
```

Replace with:

```
  --primary:#0E8577;
  --primary-dark:#0B6B60;

  --secondary:#12181C;
  --secondary-light:#1E262B;

  --background:#EFF1F2;
  --surface:#FFFFFF;

  --border:#DCE1E3;

  --text:#12181C;
  --text-light:#5A656B;

  --success:#38A169;
  --warning:#F6AD55;
  --danger:#E53E3E;
  --info:#3182CE;

  --radius-sm:12px;
  --radius-md:20px;
  --radius-lg:28px;

  --shadow:0 8px 30px rgba(16,34,53,.08);
```

(radii and shadow lines are unchanged — kept here only for correct code-block context.)

- [ ] **Step 2: Add a dated status note**

At the end of the file (after the existing "Otwarte pozycje wymagające danych od klienta"
section), append:

```markdown

## Aktualizacja palety (2026-08-22)
Pierwotna zielono-granatowa paleta (`#59B52C` / `#102235`) zastąpiona kierunkiem
"stal i turkus" (`#0E8577` / `#12181C`) na podstawie feedbacku klienta i wyboru z
trzech zaprezentowanych wariantów — zob.
`docs/superpowers/specs/2026-08-22-vendingfresh-steel-teal-repaint-design.md`. Zmiana
objęła wyłącznie tokeny CSS w `src/style.css`, bez zmian w markupie ani zdjęciach
produktowych.
```

- [ ] **Step 3: Commit**

```bash
git add docs/brand/2026-08-05-brandbook.md
git commit -m "Update brandbook palette record to steel & teal

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Manual verification across representative pages

**Files:**
- None (verification only, no file changes expected — if something looks wrong, fix it in the
  relevant file from Task 1/2 before proceeding, don't create a new task).

**Interfaces:**
- Consumes: the deployed dev server from Tasks 1-3.
- Produces: a go/no-go confirmation that the repaint is visually complete site-wide before this
  branch is merged/deployed.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server starts, prints a local URL (typically `http://localhost:5173`).

- [ ] **Step 2: Spot-check the token-driven pages**

Open each of these in a browser and confirm no green (`#59B52C`-family) or navy
(`#102235`-family) remains anywhere — buttons, links, headings, borders, backgrounds should all
read teal/graphite/cool-grey:
- `/` (Home) — hero buttons, trust bar, "Dlaczego VendingFresh" tint section, "Jak wygląda
  współpraca" band (check the eyebrow text specifically — this is the hardcoded fix from
  Task 2), CTA at the bottom.
- `/oferta-chlodnicze.html` — offer-hero dot-grid texture, benefits section tint, why-card icon
  backdrops (hardcoded fix from Task 2).
- `/o-nas.html` — content section tint, why-card icons.
- `/kontakt.html` — form focus states, buttons (these read `var(--primary)` already, confirm
  they render teal).
- `/blog.html` — links and any accent elements.

- [ ] **Step 3: Confirm photos were not altered**

On `/` and `/oferta-chlodnicze.html`, confirm the machine/product photos render in their
original color (no grayscale/desaturation) — this was explicitly out of scope per the design
spec, so it should be a non-event, but worth a quick look since it's easy to accidentally touch
`filter` while editing nearby rules.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: succeeds. Optionally run `npm run preview` and repeat a quick pass over `/` and one
`oferta-*` page to confirm the production build matches dev.

- [ ] **Step 5: Record the result**

If everything in Steps 2-3 checks out, this plan is complete — no further commit needed (Tasks
1-3 already captured the actual changes). If any spot-check surfaces a leftover green/navy
value, fix it in `src/style.css`, re-run Steps 2-4, and commit the fix with message "Fix
leftover \[old color\] in \[selector\]".
