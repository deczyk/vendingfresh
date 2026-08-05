# VendingFresh Hero Photo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `RoundedBoxGeometry` placeholder in the scroll-driven hero with the real VendingFresh machine photo (`public/vendingfresh_machine.webp`), background-cut on a `<canvas>`, tilted (not fully rotated) via scroll — no `.glb` model, no paid image-to-3D service.

**Architecture:** Vite + vanilla TypeScript + Three.js, unchanged. A new `src/imageCutout.ts` module does white-background removal on a 2D canvas (usable by both the WebGL hero and the CSS fallback, since it needs no WebGL). `hero3d.ts` renders the cutout as a textured `PlaneGeometry` with a gold glow sprite behind it; `heroFallback.ts` renders the same cutout as an `<img>` with CSS 3D transforms. Both map scroll progress (0→1) to the same tilt (±17°) and zoom (1.0→1.08) range. A small shared error panel (`src/heroError.ts` + `#hero-error` markup) covers image-load failures.

**Tech Stack:** Vite 5, TypeScript 5 (strict), Three.js 0.169, Vitest (new, dev-only) for the one pure-logic unit.

## Global Constraints

- Spec of record: `docs/superpowers/specs/2026-08-05-vendingfresh-hero-photo-design.md`. This plan supersedes the "Mechanika hero" / "Fallback mobilny" sections of `docs/superpowers/specs/2026-08-03-vendingfresh-landing-design.md`.
- Photo asset: `public/vendingfresh_machine.webp` (already committed).
- `initHero3D(container: HTMLElement, getScrollProgress: () => number): void` and `initHeroFallback(container: HTMLElement, getScrollProgress: () => number): void` signatures do not change — `src/main.ts` is not modified by this plan.
- Cutout defaults: `threshold = 235`, `feather = 15` (0–255 scale), overridable via an options object.
- Motion range (identical in both 3D and fallback): tilt `-17°` → `+17°`, zoom `1.0` → `1.08`. `hero3d.ts` additionally lerps `position.z` from `0` to `0.4` for depth parallax (3D-only, not required in the CSS fallback).
- Brand gold for the glow: `#d8a94f` (`rgb(216, 169, 79)`).
- `tsconfig.json` has `strict`, `noUnusedLocals`, `noUnusedParameters` — every new file must satisfy these (remove the now-unused `RoundedBoxGeometry` import).
- No new runtime dependency. Vitest is a devDependency only, used for the one pure function (`computeAlpha`) that doesn't need a browser.
- Windows dev machine; run npm commands from the repo root `C:\Users\xmzen\vendingfresh`.

---

### Task 1: Vitest setup + `computeAlpha` (pure logic, TDD)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/imageCutout.ts`
- Test: `src/imageCutout.test.ts`

**Interfaces:**
- Produces: `computeAlpha(r: number, g: number, b: number, threshold: number, feather: number): number` — returns `0`–`255`. `0` = fully transparent (background), `255` = fully opaque (product). A pixel counts as "background" only when **all three channels** are at/above `threshold` (so a dark logo/label on an otherwise bright pixel stays opaque).
- Produces: `DEFAULT_THRESHOLD = 235`, `DEFAULT_FEATHER = 15` (exported constants), consumed by Task 2.

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest`

- [ ] **Step 2: Add the test script to package.json**

In `package.json`, add `"test": "vitest run"` to `"scripts"`:

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
    "@types/three": "^0.169.0",
    "typescript": "^5.6.2",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  },
  "dependencies": {
    "three": "^0.169.0"
  }
}
```

(Keep the actual installed Vitest version from Step 1's `npm install` output — update the number above if it differs.)

- [ ] **Step 3: Create the Vitest config**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

(`environment: 'node'` is correct here — `computeAlpha` is pure arithmetic, no DOM/Canvas needed. `cutoutWhiteBackground` and `loadCutoutCanvas`, added in Task 2, do need a real browser and are verified manually in Task 6, not under Vitest.)

- [ ] **Step 4: Write the failing test**

`src/imageCutout.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { computeAlpha, DEFAULT_FEATHER, DEFAULT_THRESHOLD } from './imageCutout';

describe('computeAlpha', () => {
  it('makes pure white fully transparent', () => {
    expect(computeAlpha(255, 255, 255, DEFAULT_THRESHOLD, DEFAULT_FEATHER)).toBe(0);
  });

  it('keeps pure black fully opaque', () => {
    expect(computeAlpha(0, 0, 0, DEFAULT_THRESHOLD, DEFAULT_FEATHER)).toBe(255);
  });

  it('keeps a pixel at the feather floor fully opaque', () => {
    // featherStart = threshold - feather = 235 - 15 = 220
    expect(computeAlpha(220, 220, 220, DEFAULT_THRESHOLD, DEFAULT_FEATHER)).toBe(255);
  });

  it('partially fades a pixel inside the feather band', () => {
    // brightness 227 is 7/15 of the way from 220 (opaque) to 235 (transparent)
    const alpha = computeAlpha(227, 227, 227, DEFAULT_THRESHOLD, DEFAULT_FEATHER);
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(255);
    expect(alpha).toBe(136);
  });

  it('keeps a pixel opaque when only some channels are bright (e.g. a dark label on glass)', () => {
    // min(r,g,b) = 200, which is below the feather floor of 220 -> fully opaque
    expect(computeAlpha(255, 255, 200, DEFAULT_THRESHOLD, DEFAULT_FEATHER)).toBe(255);
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `src/imageCutout.ts` does not exist / `computeAlpha` is not exported.

- [ ] **Step 6: Implement `computeAlpha` and the constants**

`src/imageCutout.ts`:

```ts
export const DEFAULT_THRESHOLD = 235;
export const DEFAULT_FEATHER = 15;

/**
 * Decides how opaque a pixel should be when cutting a product photo out of a
 * near-white background. A pixel counts as background only when all three
 * channels are bright (min(r,g,b) >= threshold), so colored or dark detail
 * (labels, shelves, the product itself) stays opaque even against a bright
 * pixel neighborhood. `feather` softens the transition band just below
 * `threshold` to avoid a jagged/haloed cutout edge.
 */
export function computeAlpha(
  r: number,
  g: number,
  b: number,
  threshold: number,
  feather: number,
): number {
  const brightness = Math.min(r, g, b);
  if (brightness >= threshold) return 0;

  const featherStart = threshold - feather;
  if (brightness <= featherStart) return 255;

  const t = (brightness - featherStart) / feather;
  return Math.round((1 - t) * 255);
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, all 5 assertions in `imageCutout.test.ts` green.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/imageCutout.ts src/imageCutout.test.ts
git commit -m "Add Vitest and computeAlpha pixel-alpha logic for photo cutout"
```

---

### Task 2: `cutoutWhiteBackground` + `loadCutoutCanvas` (browser glue)

**Files:**
- Modify: `src/imageCutout.ts`

**Interfaces:**
- Consumes: `computeAlpha`, `DEFAULT_THRESHOLD`, `DEFAULT_FEATHER` from Task 1 (same file).
- Produces: `cutoutWhiteBackground(image: HTMLImageElement, options?: { threshold?: number; feather?: number }): HTMLCanvasElement`.
- Produces: `loadCutoutCanvas(src: string, options?: { threshold?: number; feather?: number }): Promise<HTMLCanvasElement>` — consumed by Task 4 (`hero3d.ts`) and Task 5 (`heroFallback.ts`).

These two functions need a real `Image`/`document.createElement('canvas')`/2D context, which Vitest's `node` environment does not provide (adding `jsdom` would still leave `getImageData`/`putImageData` unimplemented without the native `canvas` package, which is a heavy, fragile Windows dependency this project has no other use for). They are verified manually in Task 6 once they're wired into the real page, per the spec's own manual-testing approach — no unit test is written for them, and that is intentional, not an oversight.

- [ ] **Step 1: Append the browser-glue functions to `src/imageCutout.ts`**

Add below `computeAlpha`:

```ts
/**
 * Draws `image` onto an offscreen canvas and zeroes out the alpha of
 * near-white background pixels (see computeAlpha). Returns the canvas so
 * callers can use it as a CanvasTexture (hero3d.ts) or a data URL (heroFallback.ts).
 */
export function cutoutWhiteBackground(
  image: HTMLImageElement,
  options?: { threshold?: number; feather?: number },
): HTMLCanvasElement {
  const threshold = options?.threshold ?? DEFAULT_THRESHOLD;
  const feather = options?.feather ?? DEFAULT_FEATHER;

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('imageCutout: 2D canvas context unavailable');
  }

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = computeAlpha(data[i], data[i + 1], data[i + 2], threshold, feather);
    data[i + 3] = Math.min(data[i + 3], alpha);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`imageCutout: failed to load ${src}`));
    image.src = src;
  });
}

/** Loads `src` and returns its white-background-cut canvas in one call. */
export async function loadCutoutCanvas(
  src: string,
  options?: { threshold?: number; feather?: number },
): Promise<HTMLCanvasElement> {
  const image = await loadImage(src);
  return cutoutWhiteBackground(image, options);
}
```

- [ ] **Step 2: Run the full test suite to confirm nothing broke**

Run: `npm test`
Expected: PASS — the existing 5 `computeAlpha` tests still pass; no new tests were added in this step (see rationale above).

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/imageCutout.ts
git commit -m "Add cutoutWhiteBackground and loadCutoutCanvas browser helpers"
```

---

### Task 3: Shared hero config + error panel

**Files:**
- Create: `src/heroConfig.ts`
- Create: `src/heroError.ts`
- Modify: `index.html:30-49`
- Modify: `src/style.css` (hero section, ~`style.css:114-131`)

**Interfaces:**
- Produces (`heroConfig.ts`): `MACHINE_IMAGE_SRC = '/vendingfresh_machine.webp'`, `HERO_TILT_MAX_DEGREES = 17`, `HERO_ZOOM_MAX = 1.08`, `HERO_Z_PARALLAX = 0.4` — the first three consumed by Task 4 and Task 5, so the two hero variants can never drift apart on these numbers; `HERO_Z_PARALLAX` is consumed only by Task 4 (the spec's z-depth parallax is a 3D-only touch, not required for the CSS fallback).
- Produces (`heroError.ts`): `showHeroErrorPanel(): void` — consumed by Task 4 and Task 5's `.catch()` handlers.

- [ ] **Step 1: Create the shared constants module**

`src/heroConfig.ts`:

```ts
export const MACHINE_IMAGE_SRC = '/vendingfresh_machine.webp';
export const HERO_TILT_MAX_DEGREES = 17;
export const HERO_ZOOM_MAX = 1.08;
export const HERO_Z_PARALLAX = 0.4;
```

- [ ] **Step 2: Add the error panel markup**

In `index.html`, inside `<div class="hero-sticky">`, alongside `#hero-3d` and `#hero-fallback` (after line 35, before `<div class="hero-content">`):

```html
        <div id="hero-error" class="hero-error" hidden>
          <img class="hero-error__logo" src="/vendingfresh_icon_transparent.png" alt="VendingFresh" />
        </div>
```

Full block now reads:

```html
    <section class="hero-wrap" id="hero">
      <div class="hero-sticky">
        <div id="hero-3d" class="hero-3d"></div>
        <div id="hero-fallback" class="hero-fallback" hidden>
          <img class="hero-fallback__photo" alt="VendingFresh — automat chłodniczy" />
        </div>
        <div id="hero-error" class="hero-error" hidden>
          <img class="hero-error__logo" src="/vendingfresh_icon_transparent.png" alt="VendingFresh" />
        </div>
        <div class="hero-content">
```

(The `.hero-fallback__photo` swap-in for `.hero-fallback__shape` is part of Task 5 — shown here so this block is unambiguous; do not remove `.hero-fallback__shape` styling until Task 5.)

- [ ] **Step 3: Add error panel CSS**

In `src/style.css`, extend the existing shared selector at line 114 and add a new rule after it:

```css
.hero-3d,
.hero-fallback,
.hero-error {
  position: absolute;
  inset: 0;
}
```

(replaces the current two-selector rule at `style.css:114-118`)

```css
.hero-error {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-green-dark);
}
.hero-error__logo {
  height: 64px;
  width: auto;
  opacity: 0.9;
}
```

(add after the `.hero-3d canvas` rule, i.e. after `style.css:119-123`)

- [ ] **Step 4: Write the error panel module**

`src/heroError.ts`:

```ts
/** Shown when the machine photo fails to load, in either hero variant. */
export function showHeroErrorPanel(): void {
  const panel = document.getElementById('hero-error');
  if (panel) panel.hidden = false;
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/heroConfig.ts src/heroError.ts index.html src/style.css
git commit -m "Add shared hero motion constants and image-load error panel"
```

---

### Task 4: Rewrite `hero3d.ts` — photo plane, gold glow, tilt/zoom

**Files:**
- Modify: `src/hero3d.ts` (full rewrite)

**Interfaces:**
- Consumes: `loadCutoutCanvas` (Task 2), `MACHINE_IMAGE_SRC`, `HERO_TILT_MAX_DEGREES`, `HERO_ZOOM_MAX`, `HERO_Z_PARALLAX` (Task 3), `showHeroErrorPanel` (Task 3).
- Produces: `initHero3D(container: HTMLElement, getScrollProgress: () => number): void` — unchanged signature, still called the same way from `src/main.ts`.

- [ ] **Step 1: Replace the contents of `src/hero3d.ts`**

```ts
import * as THREE from 'three';
import { loadCutoutCanvas } from './imageCutout';
import {
  HERO_TILT_MAX_DEGREES,
  HERO_ZOOM_MAX,
  HERO_Z_PARALLAX,
  MACHINE_IMAGE_SRC,
} from './heroConfig';
import { showHeroErrorPanel } from './heroError';

const BRAND_GOLD_RGB = '216, 169, 79';
const MACHINE_PLANE_HEIGHT = 3.6;

export function initHero3D(container: HTMLElement, getScrollProgress: () => number): void {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.4, 6.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(createGoldGlow());

  let machine: THREE.Mesh | null = null;

  loadCutoutCanvas(MACHINE_IMAGE_SRC)
    .then((canvas) => {
      machine = createMachinePlane(canvas);
      scene.add(machine);
    })
    .catch((error: unknown) => {
      console.warn('hero3d: nie udało się załadować zdjęcia automatu', error);
      container.hidden = true;
      showHeroErrorPanel();
    });

  function resize(): void {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  }
  resize();
  window.addEventListener('resize', resize);

  function animate(): void {
    requestAnimationFrame(animate);
    if (machine) {
      const progress = getScrollProgress();
      const tiltDegrees = THREE.MathUtils.lerp(
        -HERO_TILT_MAX_DEGREES,
        HERO_TILT_MAX_DEGREES,
        progress,
      );
      machine.rotation.y = THREE.MathUtils.degToRad(tiltDegrees);
      machine.scale.setScalar(THREE.MathUtils.lerp(1, HERO_ZOOM_MAX, progress));
      machine.position.z = THREE.MathUtils.lerp(0, HERO_Z_PARALLAX, progress);
    }
    renderer.render(scene, camera);
  }
  animate();
}

function createMachinePlane(canvas: HTMLCanvasElement): THREE.Mesh {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const aspect = canvas.width / canvas.height;
  const height = MACHINE_PLANE_HEIGHT;
  const width = height * aspect;

  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geometry, material);
}

function createGoldGlow(): THREE.Sprite {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, `rgba(${BRAND_GOLD_RGB}, 0.55)`);
    gradient.addColorStop(1, `rgba(${BRAND_GOLD_RGB}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(6, 6, 1);
  sprite.position.z = -1;
  return sprite;
}
```

This removes the `RoundedBoxGeometry` import and the three directional/ambient lights entirely — `MeshBasicMaterial` is unlit by design (see spec: the photo already carries its own product-shot lighting, so scene lights would only tint it incorrectly).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (in particular, no "declared but never used" for removed imports/lights — `noUnusedLocals`/`noUnusedParameters` are on).

- [ ] **Step 3: Manual smoke check**

Run: `npm run dev`, open the printed local URL in a desktop browser at ≥768px width.
Expected: hero shows the VendingFresh machine photo (no white box around it) with a soft gold glow behind it; scrolling through the hero section tilts it left/right within a small range and zooms in slightly; scrolling past the hero releases the sticky canvas as before.

- [ ] **Step 4: Commit**

```bash
git add src/hero3d.ts
git commit -m "Render hero as tilted photo plane instead of RoundedBoxGeometry placeholder"
```

---

### Task 5: Rewrite `heroFallback.ts` — photo + CSS tilt

**Files:**
- Modify: `src/heroFallback.ts` (full rewrite)
- Modify: `index.html:34` (already updated in Task 3 — `.hero-fallback__shape` div replaced with `.hero-fallback__photo` img; nothing left to do here)
- Modify: `src/style.css:173-181` (replace `.hero-fallback__shape` rule with `.hero-fallback__photo`)

**Interfaces:**
- Consumes: `loadCutoutCanvas` (Task 2), `HERO_TILT_MAX_DEGREES`, `HERO_ZOOM_MAX`, `MACHINE_IMAGE_SRC` (Task 3), `showHeroErrorPanel` (Task 3).
- Produces: `initHeroFallback(container: HTMLElement, getScrollProgress: () => number): void` — unchanged signature.

- [ ] **Step 1: Replace `.hero-fallback__shape` CSS with `.hero-fallback__photo`**

In `src/style.css`, replace the block at `style.css:173-181`:

```css
.hero-fallback__photo {
  width: min(70vw, 320px);
  height: auto;
  filter: drop-shadow(0 0 40px rgba(216, 169, 79, 0.45));
  will-change: transform;
}
```

- [ ] **Step 2: Replace the contents of `src/heroFallback.ts`**

```ts
import { loadCutoutCanvas } from './imageCutout';
import { HERO_TILT_MAX_DEGREES, HERO_ZOOM_MAX, MACHINE_IMAGE_SRC } from './heroConfig';
import { showHeroErrorPanel } from './heroError';

export function initHeroFallback(container: HTMLElement, getScrollProgress: () => number): void {
  const photo = container.querySelector<HTMLImageElement>('.hero-fallback__photo');
  if (!photo) return;

  function update(): void {
    const progress = getScrollProgress();
    const tiltDegrees = progress * (HERO_TILT_MAX_DEGREES * 2) - HERO_TILT_MAX_DEGREES;
    const scale = 1 + progress * (HERO_ZOOM_MAX - 1);
    photo!.style.transform = `perspective(900px) rotateY(${tiltDegrees}deg) scale(${scale})`;
  }

  loadCutoutCanvas(MACHINE_IMAGE_SRC)
    .then((canvas) => {
      photo.src = canvas.toDataURL('image/png');
      window.addEventListener('scroll', update, { passive: true });
      update();
    })
    .catch((error: unknown) => {
      console.warn('heroFallback: nie udało się załadować zdjęcia automatu', error);
      container.hidden = true;
      showHeroErrorPanel();
    });
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual smoke check**

In a desktop browser dev-tools device toolbar, emulate a viewport narrower than 768px (or throttle to force `supportsWebGL()` false), reload the page.
Expected: hero shows the same cut-out machine photo, tilting left/right and zooming slightly on scroll, matching the desktop 3D version's feel; no leftover gradient box from the old placeholder.

- [ ] **Step 5: Commit**

```bash
git add src/heroFallback.ts src/style.css
git commit -m "Render mobile/no-WebGL hero fallback with the same photo and CSS tilt"
```

---

### Task 6: Full manual verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the automated checks one more time**

Run: `npm test && npx tsc --noEmit`
Expected: both pass.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds; `dist/` contains the built assets including `vendingfresh_machine.webp`.

- [ ] **Step 3: Preview and walk the spec's testing checklist**

Run: `npm run preview`, open the printed URL, and check each item from
`docs/superpowers/specs/2026-08-05-vendingfresh-hero-photo-design.md` § Testowanie:

- [ ] No white halo/border around the cut-out machine, at both the widest and narrowest points of the tilt range.
- [ ] No part of the machine is clipped at either tilt extreme (`-17°`/`+17°`).
- [ ] The gold glow renders behind the machine, not in front of it.
- [ ] Mobile/no-WebGL fallback (device toolbar, <768px width) shows the same photo with the same tilt/zoom behavior as desktop.
- [ ] No noticeable FPS drop versus the previous box placeholder (spot-check via browser dev tools Performance/FPS meter while scrolling through the hero).

- [ ] **Step 4: Record the result**

If every item above passes, no further commit is needed — this task is verification-only. If any item fails, open a follow-up task (do not silently patch): note which checklist item failed and what was observed, then fix it as its own commit before re-running this task's checklist from Step 3.
