# VendingFresh — `/poradnik` (lista + 3 artykuły)

Data: 2026-09-24

## Struktura

`poradnik.html` (lista) + `poradnik/ile-kosztuje-automat-na-jajka.html`, `poradnik/automat-na-chleb-jak-dziala.html`, `poradnik/sprzedaz-zywnosci-z-automatu-przepisy.html` — slugi już zaszyte w linkach na `index.html` z etapu 1, nie do zmiany.

## Lista (`/poradnik`)

Hero + siatka 3 kafelków (reużycie `.guide-card`/`.cards-grid` z homepage) linkujących do artykułów. Miejsce na kolejne artykuły w przyszłości — nagłówek "Poradnik" bez numeracji "3 z X", żeby dało się dopisywać kolejne bez zmiany treści.

## Wspólny szablon artykułu

Prosty układ tekstowy: H1, krótki lead, śródtytuły (`h2`), akapity, lista gdzie pasuje, CTA na końcu do konfiguratora/kalkulatora. Bez cen — zamiast liczb odsyła do kalkulatora/konfiguratora po spersonalizowane wyliczenie. `<article>` z `max-width` (nowa klasa `.article`, prosta: wąska szerokość tekstu dla czytelności, spójna z resztą typografii).

## Treść

1. **Ile kosztuje automat na jajka i kiedy się zwraca?** — czynniki wpływające na koszt (model, konfiguracja, wersja outdoor), czynniki wpływające na czas zwrotu (wolumen, marża, koszty stałe), link do kalkulatora na stronie głównej i do artykułu 3 (przepisy). Fraza SEO: automat na jajka, jajomat.
2. **Automat na chleb: jak to działa i czy piekarni się opłaca?** — mechanizm (temperatura pokojowa, rotacja), kiedy się opłaca piekarni (wydłużenie godzin sprzedaży bez dodatkowego etatu), czynniki opłacalności, link do `/rozwiazania/pieczywo` i kalkulatora. Fraza: automat do chleba, automat na pieczywo.
3. **Sprzedaż żywności z automatu: przepisy, sanepid, oznakowanie** — ogólne zasady: kontrola temperatury i łańcuch chłodniczy, oznakowanie (skład, alergeny, data przydatności, dane producenta), rejestracja działalności w sanepidzie jako punkt sprzedaży, zastrzeżenie że to informacje ogólne i warto skonsultować konkretny przypadek z lokalnym sanepidem/prawnikiem. Fraza: automat vendingowy z żywnością, sklep samoobsługowy 24/7.

## Poza zakresem

JSON-LD Article/BlogPosting (dodamy gdy artykułów będzie więcej), daty publikacji/autorzy (nie mamy jeszcze ustalonego procesu redakcyjnego).
