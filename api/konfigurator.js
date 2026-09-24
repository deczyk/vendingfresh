import { neon } from '@neondatabase/serverless';

const TELEGRAM_WEBHOOK_ENDPOINT = 'REPLACE_ME_TELEGRAM_WEBHOOK_ENDPOINT';
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
  } catch (err) {
    console.error('konfigurator handler error (save)', err);
    res.status(500).json({ error: 'Nie udało się zapisać zgłoszenia.' });
    return;
  }

  try {
    await notifyTelegram(req.body);
  } catch (err) {
    console.error('konfigurator handler error (telegram notify)', err);
  }

  res.status(200).json({ ok: true });
}
