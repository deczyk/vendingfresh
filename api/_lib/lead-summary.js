import { CLAUDE_MODEL, responseText } from './claude.js';

const SYSTEM = `Jesteś asystentem działu sprzedaży VendingFresh (partner Sielaff). Firma oferuje:
- ZAKUP lub WYNAJEM automatu skonfigurowanego pod produkt klienta: rozmiar, liczba i wielkość komór, temperatury, sposób wydawania (spirala, popychacz, winda), okleina z logo i napisami (np. Chlebomat, Kwiatomat, Ciastkomat). Klient sam uzupełnia automat.
- PEŁNĄ OBSŁUGĘ tylko dla szkół, biur i zakładów: gotowy, standardowy automat z asortymentem VendingFresh, bez indywidualnej konfiguracji i okleiny; VendingFresh uzupełnia i serwisuje. Przy dużym ruchu bez kosztów dla klienta, przy małym stała opłata miesięczna.
Dostajesz odpowiedzi z konfiguratora. Napisz po polsku, zwięźle, dla handlowca, który zaraz zadzwoni do klienta. Nie wymyślaj cen ani faktów, których nie ma w danych. Format (zwykły tekst, bez markdownu):
PODSUMOWANIE: 1–2 zdania, kim jest klient i czego chce.
PROPOZYCJA: jaki automat i konfiguracja pasują (lub gotowy automat przy pełnej obsłudze).
UWAGI: ryzyka lub braki w danych (np. brak wymiarów, produkt wymagający chłodzenia, przepisy w szkołach).
PYTANIA NA TELEFON: 2–3 konkretne pytania.
PRIORYTET: gorący / ciepły / zimny — z jednym słowem uzasadnienia.`;

// Only configuration answers go to the model — never name, phone, e-mail or town.
const FIELDS = [
  ['model', 'Model współpracy'],
  ['produkty', 'Produkty'],
  ['produktInne', 'Inne produkty (opis klienta)'],
  ['opakowanie', 'Opakowanie'],
  ['wymiary', 'Wymiary i waga'],
  ['temperatura', 'Temperatura'],
  ['wolumenDzienny', 'Wolumen / osoby na miejscu'],
  ['liczbaProduktow', 'Liczba różnych produktów'],
  ['czestotliwosc', 'Częstotliwość uzupełniania'],
  ['lokalizacja', 'Lokalizacja'],
  ['miejscowoscTyp', 'Miasto czy wieś'],
  ['platnosci', 'Płatności, dopasowanie i dodatki'],
];

export function buildLeadPrompt(payload) {
  return FIELDS.map(([key, label]) => {
    const value = payload?.[key];
    const text = Array.isArray(value) ? value.join(', ') : String(value ?? '').slice(0, 500);
    return `${label}: ${text.trim() || '—'}`;
  }).join('\n');
}

/** Returns the AI summary for a lead, or null if the feature is off or the call fails. */
export async function summarizeLead(payload, client) {
  if (!client) return null;
  try {
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 700,
      system: SYSTEM,
      messages: [{ role: 'user', content: buildLeadPrompt(payload) }],
    });
    return responseText(message) || null;
  } catch (err) {
    console.error('lead summary failed', err?.status ?? '', err?.message ?? err);
    return null;
  }
}
