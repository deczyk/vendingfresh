import { describe, expect, it, vi } from 'vitest';
import { buildLeadPrompt, summarizeLead } from './_lib/lead-summary.js';
import {
  cleanProposals,
  createRateLimiter,
  generateSlogans,
  isAllowedOrigin,
  validateOkleinaInput,
} from './_lib/okleina.js';

const fakeClient = (text) => ({ messages: { create: vi.fn().mockResolvedValue({ content: [{ type: 'text', text }] }) } });

describe('lead summary', () => {
  it('never sends personal data to the model', () => {
    const prompt = buildLeadPrompt({
      model: 'zakup', produkty: ['kwiaty'], imie: 'Jan Kowalski', telefon: '600123456',
      email: 'jan@example.com', miejscowoscKontakt: 'Kraków',
    });
    expect(prompt).toContain('Produkty: kwiaty');
    expect(prompt).not.toMatch(/Jan|600123456|example\.com|Kraków/);
  });

  it('returns the model text, and null when disabled or failing', async () => {
    expect(await summarizeLead({}, fakeClient('PODSUMOWANIE: test'))).toBe('PODSUMOWANIE: test');
    expect(await summarizeLead({}, null)).toBeNull();
    const failing = { messages: { create: vi.fn().mockRejectedValue(new Error('boom')) } };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await summarizeLead({}, failing)).toBeNull();
  });

  it('uses the cheapest model', async () => {
    const client = fakeClient('ok');
    await summarizeLead({}, client);
    expect(client.messages.create.mock.calls[0][0].model).toBe('claude-haiku-4-5');
  });
});

describe('okleina generator', () => {
  it('validates the name and product', () => {
    expect(validateOkleinaInput({ nazwa: ' Piekarnia  u Zenka ', produkt: 'pieczywo' })).toEqual({ nazwa: 'Piekarnia u Zenka', produkt: 'pieczywo' });
    expect(validateOkleinaInput({ nazwa: 'x', produkt: 'pieczywo' }).error).toBeTruthy();
    expect(validateOkleinaInput({ nazwa: 'Firma', produkt: 'toString' }).error).toBeTruthy();
  });

  it('keeps at most three short, clean proposals', () => {
    const out = cleanProposals({ propozycje: [
      { nazwa: '„Chlebomat”', haslo: 'świeże prosto z pieca' },
      { nazwa: 'A'.repeat(40), haslo: 'B'.repeat(40) },
      { nazwa: '', haslo: 'pusta nazwa' },
      { nazwa: 'Trzy', haslo: '' },
      { nazwa: 'Cztery', haslo: 'x' },
    ] });
    expect(out).toHaveLength(3);
    expect(out[0].nazwa).toBe('Chlebomat');
    expect(out[1].nazwa).toHaveLength(20);
    expect(out[1].haslo).toHaveLength(30);
  });

  it('asks for structured JSON and parses it', async () => {
    const client = fakeClient(JSON.stringify({ propozycje: [{ nazwa: 'Kwiatomat Róża', haslo: 'bukiety 24/7' }] }));
    const out = await generateSlogans({ nazwa: 'Kwiaciarnia Róża', produkt: 'kwiaty' }, client);
    expect(out).toEqual([{ nazwa: 'Kwiatomat Róża', haslo: 'bukiety 24/7' }]);
    const params = client.messages.create.mock.calls[0][0];
    expect(params.output_config.format.type).toBe('json_schema');
    expect(params.model).toBe('claude-haiku-4-5');
  });

  it('rate-limits bursts per key', () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(allow('ip', 0)).toBe(true);
    expect(allow('ip', 10)).toBe(true);
    expect(allow('ip', 20)).toBe(false);
    expect(allow('ip', 2000)).toBe(true);
  });

  it('only accepts requests from our own site', () => {
    expect(isAllowedOrigin('https://vendingfresh.pl')).toBe(true);
    expect(isAllowedOrigin('https://vendingfresh-git-x.vercel.app')).toBe(true);
    expect(isAllowedOrigin('https://evil.example')).toBe(false);
    expect(isAllowedOrigin(undefined)).toBe(false);
  });
});
