import { getClaudeClient } from './_lib/claude.js';
import { createRateLimiter, fallbackSlogans, generateSlogans, isAllowedOrigin, validateOkleinaInput } from './_lib/okleina.js';

const allow = createRateLimiter({ limit: 6, windowMs: 10 * 60 * 1000 });

export default async function handler(req, res) {
  // GET /api/okleina tells whether the AI key is configured (never reveals the key itself).
  if (req.method === 'GET') {
    res.status(200).json({ ai: Boolean(getClaudeClient()) });
    return;
  }
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
  if (client) {
    try {
      const propozycje = await generateSlogans(input, client);
      if (propozycje.length > 0) {
        res.status(200).json({ propozycje, zrodlo: 'ai' });
        return;
      }
    } catch (err) {
      console.error('okleina AI error, using templates', err?.status ?? '', err?.message ?? err);
    }
  }
  // No key or AI unavailable: template proposals so the visitor always gets an answer.
  res.status(200).json({ propozycje: fallbackSlogans(input), zrodlo: 'szablon' });
}
