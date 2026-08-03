# VendingFresh — Landing Page Design

## Cel
Interaktywna strona marki VendingFresh (automaty chłodnicze/vendingowe) z sekcją hero
prezentującą model 3D automatu obracany w zależności od scrollowania (w duchu prezentacji
produktowych Apple), zbudowana na razie z kształtem zastępczym — docelowy model `.glb`
zostanie podłączony później.

## Stack
- Vite + vanilla TypeScript, bez frameworka UI.
- Three.js do renderu 3D w przeglądarce (real-time WebGL, nie sekwencja obrazków).
- Statyczny output, hostowalny na dowolnym static hostingu.

## Struktura plików
```
vendingfresh/
├── index.html
├── src/
│   ├── main.ts          # inicjalizacja, nav, sekcje
│   ├── hero3d.ts         # scena Three.js + logika scroll→obrót
│   ├── heroFallback.ts   # uproszczony hero dla słabych/mobilnych urządzeń
│   ├── style.css         # zmienne marki, typografia, layout
├── public/
│   ├── vendingfresh_icon_transparent.png
│   ├── vendingfresh_icon.png
│   └── vendingfresh_logo_full.png
└── vite.config.ts
```

## Mechanika hero: scroll → obrót 3D
- Sekcja hero to wysoki kontener (`300vh`) z `position: sticky` canvasem Three.js
  wypełniającym viewport.
- Postęp scrolla w obrębie sekcji (`0→1`) mapowany liniowo na rotację modelu (`0 → 2π`).
- Po osiągnięciu postępu `1` sticky canvas "puszcza" i reszta strony scrolluje normalnie
  nad hero.
- Placeholder 3D: `RoundedBoxGeometry` — prostopadłościan z zaokrąglonymi krawędziami
  przypominający sylwetkę automatu/lodówki, materiał matowy + subtelny highlight,
  oświetlony kilkoma kierunkowymi światłami. Wymiana na `.glb` przez `GLTFLoader`
  odbywa się w jednej funkcji `loadModel()`.

## Fallback mobilny / słaby sprzęt
- Próg: `window.innerWidth < 768` LUB brak wsparcia WebGL.
- Decyzja zapada raz przy starcie strony (bez przełączania w locie).
- Fallback: statyczna CSS-owa "ilustracja" tego samego kształtu (gradientowy zaokrąglony
  prostokąt, subtelny glow, delikatna animacja przy scrollu) zamiast live WebGL.

## Tożsamość wizualna marki

### Kolory (zmienne CSS)
| Zmienna | Wartość | Użycie |
|---|---|---|
| `--color-green-dark` | `#102B23` | główny — tła nav/hero/stopka, tekst na jasnym tle |
| `--color-gold` | `#D8A94F` | akcent — CTA, logotyp "FRESH", hasło marki, dekoracje |
| `--color-green-light` | `#7BA05D` | drugorzędny akcent — dekoracje, ikony |
| `--color-cream` | `#F7F3E9` | tło jasnych sekcji, tekst na ciemnym tle |

### Typografia
- Font: **Montserrat** (Google Fonts), wagi Bold / SemiBold / Regular, fallback `sans-serif`.
- Logotyp tekstowy w nagłówkach: „VENDING” (ciemna zieleń) + „FRESH” (złoto), bez spacji,
  bold, jeden spójny człon.
- Hasło marki: „ŚWIEŻOŚĆ. JAKOŚĆ. ZAUFANIE.” — wersaliki, szeroki letter-spacing, kolor
  złoty na ciemnym tle. Użyte pod logo w nagłówku i w stopce.

### Logo
Rzeczywiste pliki dostarczone przez użytkownika (folder projektu):
- `vendingfresh_icon_transparent.png` — ikona (butelka z listkiem w zaokrąglonej
  ciemnozielonej ramce, przecięta złotą wstążką) — używana w nagłówku obok nazwy.
- `vendingfresh_logo_full.png` — pełne logo z hasłem, do ew. użycia w stopce/materiałach.

### Zastosowanie palety per sekcja
- **Nav**: tło `--color-green-dark`, tekst `--color-cream`, ikona logo + logotyp tekstowy
  po lewej.
- **Hero**: tło `--color-green-dark` (lub gradient do odrobinę jaśniejszego odcienia),
  subtelna złota poświata wokół obracającego się modelu.
- **Sekcje treści** (Produkt, Funkcje): naprzemiennie tło kremowe / ciemnozielone, akcenty
  tekstowe i dekoracyjne w złocie i jasnej zieleni.
- **Przyciski CTA**: tło `--color-gold`, tekst `--color-green-dark`, hover → jaśniejsze
  złoto.
- **Ikony funkcji** (4 punkty: Świeże produkty / Wysoka jakość / Nowoczesne rozwiązania /
  Zaufanie i wsparcie): cienkie ikony konturowe (outline), złote na ciemnozielonym tle.
- **Stopka**: tło ciemnozielone, logo + hasło wyśrodkowane, dane kontaktowe w kremie.

## Sekcje strony
1. **Nav** — logo + nazwa, kotwice do sekcji.
2. **Hero** — model 3D sterowany scrollem.
3. **Produkt** — krótki opis, tło kremowe.
4. **Funkcje** — siatka 4 kart z ikonami outline, tło ciemnozielone.
5. **Kontakt** — dane kontaktowe + `mailto:`, bez backendu, tło kremowe.
6. **Stopka** — logo, hasło, kontakt, tło ciemnozielone.

## Testowanie
Ręczna weryfikacja w przeglądarce (desktop + emulacja mobile): płynność obrotu przy
scrollu, przejście do reszty treści, fallback na wąskim viewporcie, poprawność kolorów/
typografii wobec specyfikacji marki.
