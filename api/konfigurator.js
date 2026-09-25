import { getClaudeClient } from './_lib/claude.js';
import { summarizeLead } from './_lib/lead-summary.js';

const LEADS_ENDPOINT = 'https://www.sklepzastodola.pl/api/leads';
const MAX_PAYLOAD_SIZE = 20000;

export function validateLeadPayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Nieprawidłowe dane.';
  }
  if (body.marka !== 'vendingfresh') {
    return 'Nieprawidłowa marka.';
  }
  if (body.typ !== 'konfigurator' && body.typ !== 'kontakt') {
    return 'Nieprawidłowy typ zgłoszenia.';
  }
  if (!body.payload || typeof body.payload !== 'object') {
    return 'Brak danych formularza.';
  }
  if (JSON.stringify(body.payload).length > MAX_PAYLOAD_SIZE) {
    return 'Zgłoszenie jest za duże.';
  }
  if (body.payload.website) {
    return 'Nieprawidłowe zgłoszenie.';
  }
  return null;
}

export function buildLeadsRequestBody(payload, aiSummary = null) {
  const produkty = Array.isArray(payload.produkty) && payload.produkty.length > 0
    ? payload.produkty.join(', ')
    : (payload.produktInne || '');
  const platnosci = Array.isArray(payload.platnosci) && payload.platnosci.length > 0
    ? payload.platnosci.join(', ')
    : '';

  const modelLabels = {
    zakup: 'zakup na własność',
    wynajem: 'wynajem (klient uzupełnia sam, opłata miesięczna)',
    pelna_obsluga: 'pełna obsługa — gotowy automat (my stawiamy, uzupełniamy i zarabiamy na sprzedaży)',
  };
  const model = modelLabels[payload.model] || payload.model || '—';

  const notes = [
    ...(payload.jezyk ? [`Język strony: ${payload.jezyk} (zapytanie z zagranicznej wersji strony)`] : []),
    `Model współpracy: ${model}`,
    ...(payload.linia ? [`Linia automatów: ${{ smart: 'Smart (Westvend)', premium: 'Premium (Sielaff)', doradzcie: 'do doradzenia' }[payload.linia] || payload.linia}`] : []),
    `Produkty: ${produkty || '—'}`,
    ...(payload.modelAutomatu ? [`Model automatu: ${payload.modelAutomatu}`] : []),
    ...(payload.kolorObudowy ? [`Kolor obudowy: ${payload.kolorObudowy}`] : []),
    ...(payload.liczbaAutomatow && payload.liczbaAutomatow !== '1' ? [`Liczba automatów: ${payload.liczbaAutomatow}`] : []),
    `Opakowanie: ${[payload.opakowanie, payload.opakowanieInne].filter(Boolean).join(' — ') || '—'} (wymiary: ${payload.wymiary || '—'})`,
    `Temperatura: ${payload.temperatura || '—'}`,
    `Wolumen / osoby na miejscu: ${payload.wolumenDzienny || '—'} (liczba produktów: ${payload.liczbaProduktow || '—'})`,
    `Częstotliwość uzupełniania: ${payload.czestotliwosc || '—'}`,
    `Lokalizacja: ${payload.lokalizacja || '—'} (${payload.miejscowoscTyp || '—'})`,
    `Płatności i dodatki: ${platnosci || '—'}`,
  ].join('\n');
  const notesWithSummary = aiSummary ? `${notes}\n\n--- Podsumowanie zgłoszenia (do weryfikacji) ---\n${aiSummary}` : notes;

  return {
    source: 'kontakt',
    marka: 'vendingfresh',
    zainteresowanie: [
      payload.jezyk ? `Zapytanie VendingFresh (${String(payload.jezyk).toUpperCase()})` : 'Konfigurator VendingFresh',
      payload.model ? model : null,
    ].filter(Boolean).join(' — '),
    produkt: produkty,
    imie: payload.imie || '',
    telefon: payload.telefon || '',
    email: payload.email || '',
    miejscowosc: payload.miejscowoscKontakt || '',
    website: payload.website || '',
    notes: notesWithSummary,
  };
}

async function sendToLeadsApi(payload, aiSummary) {
  const response = await fetch(LEADS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildLeadsRequestBody(payload, aiSummary)),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`leads API responded ${response.status}: ${detail}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const error = validateLeadPayload(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  try {
    // Best effort: a missing key or a failed AI call just sends the lead without a summary.
    const aiSummary =
      req.body.typ === 'konfigurator' ? await summarizeLead(req.body.payload, getClaudeClient()) : null;
    await sendToLeadsApi(req.body.payload, aiSummary);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('konfigurator handler error', err);
    res.status(500).json({ error: 'Nie udało się zapisać zgłoszenia.' });
  }
}
