# VendingFresh — Hero 3D z realnym zdjęciem automatu

> Ten dokument **nadpisuje** sekcję "Mechanika hero: scroll → obrót 3D" oraz "Fallback
> mobilny / słaby sprzęt" z `2026-08-03-vendingfresh-landing-design.md`. Reszta tamtego
> spec (paleta, typografia, struktura sekcji strony) pozostaje aktualna.

## Cel

Zastąpienie placeholdera `RoundedBoxGeometry` w hero prawdziwym zdjęciem automatu
VendingFresh, bez generowania modelu `.glb` (usługi image-to-3D wymagają płatnej
subskrypcji). Zdjęcie to render/fotografia produktowa pod kątem 3/4 (przód + prawy bok),
na czystym białym tle, plik `public/vendingfresh_machine.webp`.

## Dlaczego nie pełny obrót 360°

Zdjęcie ma "zapieczoną" perspektywę pod jednym konkretnym kątem. Teksturowanie nim
obracającej się bryły 3D powodowałoby rozjazd tekstury z geometrią przy każdym kącie innym
niż ten, pod którym zdjęcie zostało zrobione — efekt płaskiej naklejki na bryle, nie
prawdziwej bryły. Zamiast tego: ograniczony przechył (tilt), w duchu stron produktowych
Apple, które też nie obracają renderów o 360°, tylko subtelnie je przechylają/przybliżają
przy scrollu.

## Architektura

Stack bez zmian (Vite + vanilla TS + Three.js). Zmienia się wewnętrzna implementacja
`hero3d.ts` i `heroFallback.ts` — sygnatury funkcji i sposób wywołania z `main.ts` **nie
zmieniają się**:

```ts
initHero3D(container: HTMLElement, getScrollProgress: () => number): void
initHeroFallback(container: HTMLElement, getScrollProgress: () => number): void
```

`RoundedBoxGeometry` (i import `three/examples/jsm/geometries/RoundedBoxGeometry.js`)
zostaje usunięty — nie jest już potrzebny.

## Nowy moduł: `src/imageCutout.ts`

Jedna funkcja, współdzielona przez `hero3d.ts` i `heroFallback.ts` (działa na Canvas 2D,
nie wymaga WebGL, więc nadaje się do obu wariantów):

```ts
function cutoutWhiteBackground(
  image: HTMLImageElement,
  options?: { threshold?: number; feather?: number },
): HTMLCanvasElement
```

- Rysuje `image` na offscreen `<canvas>`.
- Przechodzi po pikselach (`ImageData`); piksele o jasności powyżej `threshold` (domyślnie
  ok. 235/255 na każdym kanale RGB) dostają `alpha = 0`.
- `feather` (domyślnie ~15 poziomów) tworzy miękkie przejście alpha tuż pod progiem, żeby
  uniknąć poszarpanej/białej obwódki wokół automatu.
- `threshold`/`feather` są parametrami właśnie po to, by dało się to douregulować bez
  zmian w `hero3d.ts`/`heroFallback.ts`, gdyby w przyszłości zdjęcie się zmieniło (np. nie
  na białym tle).
- Zwraca gotowy canvas z przezroczystym tłem.

## `hero3d.ts`

1. Ładuje `public/vendingfresh_machine.webp` jako `HTMLImageElement`.
2. Wycina tło przez `cutoutWhiteBackground`.
3. Tworzy `THREE.CanvasTexture` z wyniku i `THREE.PlaneGeometry` o proporcjach zgodnych z
   realnym zdjęciem (portret, ok. 2:3).
4. Materiał: `THREE.MeshBasicMaterial` (unlit, `transparent: true`, `side: THREE.DoubleSide`)
   — zdjęcie ma już własne, naturalne oświetlenie z renderu produktowego; materiał unlit
   nie przebarwia go scenowymi światłami kierunkowymi.
5. Za płaszczyzną: `THREE.Sprite` z miękkim złotym radialnym gradientem (`BRAND_GOLD`) jako
   poświata — kontynuacja motywu z oryginalnego spec ("subtelna złota poświata wokół
   obracającego się modelu").
6. Scroll → ruch, liniowy `lerp` po `getScrollProgress()` (0→1):
   - `rotation.y`: `-17°` → `+17°`
   - `scale`: `1.0` → `1.08`
   - niewielkie przesunięcie `position.z` dla paralaksy głębi
7. Błąd ładowania obrazu → `console.warn`, w kontenerze renderowany jednolity
   ciemnozielony panel z logo zamiast pustego/białego pola.

## `heroFallback.ts`

Ten sam `cutoutWhiteBackground` canvas, wstawiony do DOM jako obraz. Tilt realizowany
czystym CSS (`transform: perspective(...) rotateY(...) scale(...)`) sterowanym scrollem —
te same zakresy liczbowe co w wariancie 3D (`±17°`, `1.0→1.08`), żeby zachowanie było
spójne między desktopem a mobile/fallbackiem.

## Obsługa błędów — podsumowanie

| Sytuacja | Zachowanie |
|---|---|
| Zdjęcie nie ładuje się | `console.warn`, ciemnozielony panel z logo zamiast hero |
| Zdjęcie ma inne tło niż białe (przyszła zmiana assetu) | dostosować `threshold`/`feather` w wywołaniu `cutoutWhiteBackground` |

## Testowanie

Manualne (desktop + emulacja mobile), rozszerzone o:
- brak białej obwódki wokół wyciętego automatu,
- brak ucięcia fragmentu automatu przy skrajnych kątach tilt (`±17°`),
- złota poświata renderuje się za automatem, nie przed nim,
- fallback mobilny pokazuje to samo zdjęcie z tym samym zachowaniem tilt/zoom,
- brak zauważalnego spadku FPS względem poprzedniego placeholdera.
