import { neon } from '@neondatabase/serverless';

const TELEGRAM_WEBHOOK_ENDPOINT = 'REPLACE_ME_TELEGRAM_WEBHOOK_ENDPOINT';

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
  return null;
}

async function saveLead(body) {
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    insert into leads (marka, typ, payload)
    values (${body.marka}, ${body.typ}, ${JSON.stringify(body.payload)}::jsonb)
  `;
}

async function notifyTelegram(body) {
  const text = `[VendingFresh] Nowe zgłoszenie (${body.typ})\n${JSON.stringify(body.payload, null, 2)}`;
  await fetch(TELEGRAM_WEBHOOK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
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
    await saveLead(req.body);
    await notifyTelegram(req.body);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('konfigurator handler error', err);
    res.status(500).json({ error: 'Nie udało się zapisać zgłoszenia.' });
  }
}
