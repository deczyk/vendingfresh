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

export function buildLeadsRequestBody(payload) {
  const produkty = Array.isArray(payload.produkty) && payload.produkty.length > 0
    ? payload.produkty.join(', ')
    : (payload.produktInne || '');
  const platnosci = Array.isArray(payload.platnosci) && payload.platnosci.length > 0
    ? payload.platnosci.join(', ')
    : '';

  const notes = [
    `Kim jest: ${payload.kim || '—'}`,
    `Produkty: ${produkty || '—'}`,
    `Opakowanie: ${payload.opakowanie || '—'} (wymiary: ${payload.wymiary || '—'})`,
    `Temperatura: ${payload.temperatura || '—'}`,
    `Wolumen: ${payload.wolumenDzienny || '—'} (liczba produktów: ${payload.liczbaProduktow || '—'})`,
    `Lokalizacja: ${payload.lokalizacja || '—'} (${payload.miejscowoscTyp || '—'})`,
    `Płatności i dodatki: ${platnosci || '—'}`,
    `Finansowanie: ${payload.finansowanie || '—'}`,
  ].join('\n');

  return {
    source: 'kontakt',
    marka: 'vendingfresh',
    zainteresowanie: 'Konfigurator VendingFresh',
    produkt: produkty,
    imie: payload.imie || '',
    telefon: payload.telefon || '',
    email: payload.email || '',
    miejscowosc: payload.miejscowoscKontakt || '',
    website: payload.website || '',
    notes,
  };
}

async function sendToLeadsApi(payload) {
  const response = await fetch(LEADS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildLeadsRequestBody(payload)),
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
    await sendToLeadsApi(req.body.payload);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('konfigurator handler error', err);
    res.status(500).json({ error: 'Nie udało się zapisać zgłoszenia.' });
  }
}
