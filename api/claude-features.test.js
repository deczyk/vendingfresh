import { describe, expect, it, vi } from 'vitest';
import { buildLeadPrompt, fallbackLeadSummary, summarizeLead } from './_lib/lead-summary.js';
import {
  cleanProposals,
  fitWords,
  brandName,
  createRateLimiter,
  fallbackSlogans,
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

  it('returns the model text, and a rule-based summary without a key or on failure', async () => {
    expect(await summarizeLead({}, fakeClient('PODSUMOWANIE: test'))).toBe('PODSUMOWANIE: test');
    expect(await summarizeLead({ model: 'zakup' }, null)).toMatch(/^\(automatyczne podsumowanie bez AI\)/);
    const failing = { messages: { create: vi.fn().mockRejectedValue(new Error('boom')) } };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await summarizeLead({}, failing)).toMatch(/PRIORYTET:/);
  });

  it('rule-based summary proposes cooling, a lift and flags gaps', () => {
    const text = fallbackLeadSummary({ model: 'zakup', produkty: ['jajka', 'sery'], lokalizacja: 'zewnatrz', telefon: '600' });
    expect(text).toMatch(/chłodzeniem/);
    expect(text).toMatch(/winda do jajek/);
    expect(text).toMatch(/wersja outdoor/);
    expect(text).toMatch(/brak wymiarów/);
    expect(fallbackLeadSummary({ model: 'pelna_obsluga', produkty: ['napoje_zimne'] })).toMatch(/gotowy automat/);
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
    expect(out[1].nazwa).toHaveLength(26);
    expect(out[1].haslo).toHaveLength(30);
  });

  it('shortens names to whole words and drops the legal form', () => {
    expect(fitWords('Gospodarstwo Rolne Jan Kowalski i Synowie', 20)).toBe('Gospodarstwo Rolne');
    expect(fitWords('Piekarnia u Zenka Nowaka', 16)).toBe('Piekarnia');
    expect(fitWords('Superdługanazwafirmybezspacji', 10)).toBe('Superdługa');
    expect(brandName('Eko-Farma Zielona Dolina Sp. z o.o.')).toBe('Eko-Farma Zielona Dolina');
    expect(brandName('„Mleczarnia Wiśniewski” s.c.')).toBe('Mleczarnia Wiśniewski');
    expect(brandName('ABC S.A.')).toBe('ABC');
  });

  it('asks for structured JSON and parses it', async () => {
    const client = fakeClient(JSON.stringify({ propozycje: [{ nazwa: 'Kwiatomat Róża', haslo: 'bukiety 24/7' }] }));
    const out = await generateSlogans({ nazwa: 'Kwiaciarnia Róża', produkt: 'kwiaty' }, client);
    expect(out).toEqual([{ nazwa: 'Kwiatomat Róża', haslo: 'bukiety 24/7' }]);
    const params = client.messages.create.mock.calls[0][0];
    expect(params.output_config.format.type).toBe('json_schema');
    expect(params.model).toBe('claude-haiku-4-5');
  });

  it('falls back to template proposals that include the company name', () => {
    const out = fallbackSlogans({ nazwa: 'Piekarnia u Zenka', produkt: 'pieczywo' });
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ nazwa: 'Piekarnia u Zenka', haslo: 'świeże prosto z pieca' });
    expect(out[1]).toEqual({ nazwa: 'Chlebomat', haslo: 'Piekarnia u Zenka' });
    expect(out.every((p) => p.nazwa.length <= 26 && p.haslo.length <= 30)).toBe(true);
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
