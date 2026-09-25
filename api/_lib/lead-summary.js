import { CLAUDE_MODEL, responseText } from './claude.js';

const SYSTEM = `Jesteś asystentem działu sprzedaży VendingFresh (partner Sielaff). Firma wyłącznie SPRZEDAJE automaty (gotówka, leasing albo dotacja ARiMR) — nie wynajmuje ich i nie prowadzi ich obsługi ani uzupełniania. Automat jest skonfigurowany pod produkt klienta: rozmiar, liczba i wielkość komór, temperatury, sposób wydawania (spirala, popychacz, winda), okleina z logo i napisami (np. Chlebomat, Kwiatomat, Ciastkomat). Klient sam uzupełnia automat.
Dostajesz odpowiedzi z konfiguratora. Napisz po polsku, zwięźle, dla handlowca, który zaraz zadzwoni do klienta. Nie wymyślaj cen ani faktów, których nie ma w danych. Format (zwykły tekst, bez markdownu):
PODSUMOWANIE: 1–2 zdania, kim jest klient i czego chce.
PROPOZYCJA: jaki automat i konfiguracja pasują, i czy warto zaproponować leasing.
UWAGI: ryzyka lub braki w danych (np. brak wymiarów, produkt wymagający chłodzenia).
PYTANIA NA TELEFON: 2–3 konkretne pytania.
PRIORYTET: gorący / ciepły / zimny — z jednym słowem uzasadnienia.`;

// Only configuration answers go to the model — never name, phone, e-mail or town.
const FIELDS = [
  ['jezyk', 'Język strony (zapytanie z zagranicy, jeśli podany)'],
  ['model', 'Model współpracy'],
  ['linia', 'Linia automatów (smart = Westvend: WV Hybrid z windą do żywności, WV 8 bez windy do napojów/przekąsek; premium = Sielaff)'],
  ['produkty', 'Produkty'],
  ['produktInne', 'Inne produkty (opis klienta)'],
  ['modelAutomatu', 'Wybrany model automatu'],
  ['kolorObudowy', 'Kolor obudowy (linia Smart)'],
  ['liczbaAutomatow', 'Liczba automatów'],
  ['opcjeLinii', 'Wersja, kolor i panel (linia Premium)'],
  ['opakowanie', 'Opakowanie'],
  ['opakowanieInne', 'Opakowanie — opis klienta'],
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

const COOLED = ['sery', 'nabial', 'mieso', 'wedliny', 'dania', 'nabial_jogurty', 'dania_gotowe', 'kanapki_salatki'];

/** Rule-based summary used when there is no API key or the AI call fails. */
export function fallbackLeadSummary(p = {}) {
  const produkty = [...(Array.isArray(p.produkty) ? p.produkty : []), p.produktInne].filter(Boolean).join(', ') || 'nie podano';
  const proposal = [];
  {
    const cooled = p.temperatura === 'chlodzenie' || (p.produkty ?? []).some((x) => COOLED.includes(x));
    const fragile = (p.produkty ?? []).some((x) => ['jajka', 'kwiaty', 'ciastka', 'przetwory', 'miod'].includes(x));
    if (p.linia === 'smart') {
      proposal.push(fragile || cooled ? 'Westvend WV Hybrid (winda)' : 'Westvend WV 8 lub WV Hybrid');
    } else {
      proposal.push(cooled ? 'automat z chłodzeniem (SN48 2T LM lub SiLine Combi)' : 'SiLine Snack & Combi');
    }
    if ((p.produkty ?? []).includes('jajka')) proposal.push('winda do jajek');
    if ((p.produkty ?? []).includes('kwiaty')) proposal.push('wysokie komory na bukiety, chłodzenie');
    if ((p.produkty ?? []).includes('ciastka')) proposal.push('strefa chłodzona na wyroby z kremem');
    if (['zewnatrz', 'publiczne'].includes(p.lokalizacja)) proposal.push('wersja outdoor');
    if (p.temperatura === 'mieszane') proposal.push('kilka stref temperatur');
  }
  const gaps = [];
  const questions = [];
  if (!p.wymiary) { gaps.push('brak wymiarów opakowań'); questions.push('Jakie są wymiary i waga opakowań?'); }
  if (!p.wolumenDzienny) { gaps.push('brak wolumenu'); questions.push('Ile sztuk sprzedajecie dziennie?'); }
  if (!p.lokalizacja) { gaps.push('brak lokalizacji'); }
  questions.push('Gdzie dokładnie stanie automat i czy jest tam prąd?');
  if (!p.telefon) gaps.push('brak telefonu — kontakt tylko mailowy');
  const score = [p.telefon, p.wolumenDzienny, p.lokalizacja, (p.produkty ?? []).length || p.produktInne].filter(Boolean).length;
  const priority = score >= 4 ? 'gorący' : score >= 2 ? 'ciepły' : 'zimny';
  return [
    '(automatyczne podsumowanie bez AI)',
    `PODSUMOWANIE: ${p.model || 'model nieznany'}; produkty: ${produkty}; lokalizacja: ${p.lokalizacja || '—'}${p.jezyk ? `; zapytanie w języku ${p.jezyk}` : ''}.`,
    `PROPOZYCJA: ${proposal.join(', ')}.`,
    `UWAGI: ${gaps.length ? gaps.join('; ') : 'komplet podstawowych danych'}.`,
    `PYTANIA NA TELEFON: ${questions.slice(0, 3).join(' ')}`,
    `PRIORYTET: ${priority}.`,
  ].join('\n');
}

/** Returns the AI summary for a lead, falling back to the rule-based one without a key or on errors. */
export async function summarizeLead(payload, client) {
  if (!client) return fallbackLeadSummary(payload);
  try {
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 700,
      system: SYSTEM,
      messages: [{ role: 'user', content: buildLeadPrompt(payload) }],
    });
    return responseText(message) || fallbackLeadSummary(payload);
  } catch (err) {
    console.error('lead summary failed, using rule-based summary', err?.status ?? '', err?.message ?? err);
    return fallbackLeadSummary(payload);
  }
}
