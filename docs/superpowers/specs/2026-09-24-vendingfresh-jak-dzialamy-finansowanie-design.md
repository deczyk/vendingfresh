# VendingFresh — `/jak-dzialamy` i `/finansowanie`

Data: 2026-09-24

## `/jak-dzialamy` (`jak-dzialamy.html`)

Rozwinięcie sekcji "Jak to działa" ze strony głównej (tam: 6 krótkich kroków klikanych) w pełną podstronę z większym opisem każdego kroku. Reużywa dokładnie ten sam wzorzec `.steps`/`.step-details` i JS (`initHowSteps()` w `main.ts` już nasłuchuje na `#how-steps .step` + `[data-step-detail]` — żadnego nowego JS).

Kroki (rozwinięte, nie kopiowane 1:1 z homepage):
1. Rozmowa i konfigurator — wypełniasz konfigurator (5 min), rozmawiamy o Twoim produkcie i miejscu sprzedaży.
2. Projekt automatu i wycena indywidualna — dobieramy model, konfigurację i wysyłamy wycenę w 24-48 h.
3. Finansowanie — wybierasz leasing albo sprawdzamy dotację ARiMR (link do `/finansowanie`).
4. Dostawa i montaż — transport i instalacja automatu w uzgodnionym miejscu.
5. Szkolenie i start — pokazujemy obsługę, uruchamiamy sprzedaż.
6. Opieka po starcie — serwis, telemetria (opcjonalnie), wsparcie w całej Polsce.

Plus sekcja "Ile to trwa" — orientacyjne ramy czasowe (rozmowa i wycena: 24-48h, montaż po ustaleniu finansowania: zależnie od modelu i dostępności, reszta bez sztywnych terminów — unikamy konkretnych obietnic, których nie możemy dotrzymać). CTA na końcu do konfiguratora.

## `/finansowanie` (`finansowanie.html`)

Dwie wyraźnie oddzielone sekcje (zgodnie z oryginalnym briefem):

**A) Leasing — domyślna ścieżka**: jak działa leasing na automat vendingowy (finansujesz sprzęt, spłacasz w ratach, po zakończeniu umowy automat jest Twój), orientacyjny okres (najczęściej 24-60 miesięcy — bez podawania trybu specyficznego dla klienta, ogólna rama), co jest potrzebne do wniosku (dokumenty firmy/działalności, czasem wycena automatu — my ją przygotowujemy).

**B) Dotacje dla rolników**: blok "Jesteś rolnikiem? Sprawdź, czy Twój projekt kwalifikuje się do dofinansowania ARiMR" z linkiem zewnętrznym do sklepzastodola.pl (bez duplikowania treści poradnika) i adnotacją, że dotacje dotyczą głównie gospodarstw rolnych. **Nie mam dokładnego URL-a konkretnego artykułu o dotacji na sklepzastodola.pl — linkuję do strony głównej sklepzastodola.pl z wyraźną etykietą, do doprecyzowania przez klienta.**

CTA na końcu do konfiguratora (krok "finansowanie" w konfiguratorze i tak pyta o to samo).

## Techniczne

Obie strony: standardowy layout (nav/footer/cookie-banner include, `main.ts`+`cookies.ts`), bez nowego JS/CSS poza tym co już istnieje. Wpisy w `vite.config.ts`, `vercel.json` (rewrite bez `.html`), `public/sitemap.xml`.
