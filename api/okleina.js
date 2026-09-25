import { getClaudeClient } from './_lib/claude.js';
import { createRateLimiter, generateSlogans, isAllowedOrigin, validateOkleinaInput } from './_lib/okleina.js';

const allow = createRateLimiter({ limit: 6, windowMs: 10 * 60 * 1000 });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!isAllowedOrigin(req.headers.origin)) {
    res.status(403).json({ error: 'Niedozwolone źródło zapytania.' });
    return;
  }

  const input = validateOkleinaInput(req.body);
  if (input.error) {
    res.status(400).json({ error: input.error });
    return;
  }

  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown';
  if (!allow(ip)) {
    res.status(429).json({ error: 'Za dużo prób — spróbuj za kilka minut.' });
    return;
  }

  const client = getClaudeClient();
  if (!client) {
    res.status(503).json({ error: 'Generator jest chwilowo niedostępny.' });
    return;
  }

  try {
    const propozycje = await generateSlogans(input, client);
    if (propozycje.length === 0) throw new Error('empty proposals');
    res.status(200).json({ propozycje });
  } catch (err) {
    console.error('okleina handler error', err?.status ?? '', err?.message ?? err);
    res.status(502).json({ error: 'Nie udało się wymyślić napisów — spróbuj ponownie.' });
  }
}
