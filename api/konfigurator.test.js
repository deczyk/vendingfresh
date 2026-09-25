import { describe, expect, it } from 'vitest';
import { buildLeadsRequestBody, validateLeadPayload } from './konfigurator.js';

describe('validateLeadPayload', () => {
  it('rejects a missing body', () => {
    expect(validateLeadPayload(null)).toMatch(/Nieprawidłowe/);
  });

  it('rejects a wrong marka', () => {
    expect(validateLeadPayload({ marka: 'inna', typ: 'konfigurator', payload: {} })).toMatch(/marka/);
  });

  it('rejects an unknown typ', () => {
    expect(validateLeadPayload({ marka: 'vendingfresh', typ: 'costam', payload: {} })).toMatch(/typ/);
  });

  it('rejects a missing payload', () => {
    expect(validateLeadPayload({ marka: 'vendingfresh', typ: 'konfigurator' })).toMatch(/danych/);
  });

  it('accepts a valid lead', () => {
    expect(
      validateLeadPayload({ marka: 'vendingfresh', typ: 'konfigurator', payload: { kim: 'piekarnia' } }),
    ).toBeNull();
  });

  it('rejects an oversized payload', () => {
    const bigString = 'x'.repeat(20001);
    expect(
      validateLeadPayload({ marka: 'vendingfresh', typ: 'konfigurator', payload: { notes: bigString } }),
    ).toMatch(/za duże/);
  });

  it('rejects a payload with the honeypot field filled in', () => {
    expect(
      validateLeadPayload({
        marka: 'vendingfresh',
        typ: 'konfigurator',
        payload: { kim: 'piekarnia', website: 'http://spam.example' },
      }),
    ).toMatch(/Nieprawidłowe zgłoszenie/);
  });
});

describe('buildLeadsRequestBody', () => {
  it('maps configurator fields onto the sklepzastodola.pl /api/leads schema', () => {
    const body = buildLeadsRequestBody({
      produkty: ['chleb'],
      produktInne: '',
      opakowanie: 'worek',
      wymiary: '20x10x8 cm',
      temperatura: 'pokojowa',
      wolumenDzienny: '40 szt dziennie',
      liczbaProduktow: '3',
      lokalizacja: 'budynek',
      miejscowoscTyp: 'miasto',
      platnosci: ['karta_blik'],
      imie: 'Jan',
      telefon: '600123456',
      email: 'jan@example.com',
      miejscowoscKontakt: 'Kraków',
      rodo: true,
      website: '',
    });

    expect(body.source).toBe('kontakt');
    expect(body.marka).toBe('vendingfresh');
    expect(body.imie).toBe('Jan');
    expect(body.telefon).toBe('600123456');
    expect(body.email).toBe('jan@example.com');
    expect(body.miejscowosc).toBe('Kraków');
    expect(body.website).toBe('');
    expect(body.produkt).toBe('chleb');
    expect(body.notes).toContain('Opakowanie: worek (wymiary: 20x10x8 cm)');
    expect(body.notes).toContain('Temperatura: pokojowa');
    expect(body.notes).toContain('Model współpracy: —');
  });

  it('falls back to the free-text "inne" product when no checkboxes are selected', () => {
    const body = buildLeadsRequestBody({
      produkty: [], produktInne: 'kawa mielona', opakowanie: '', wymiary: '',
      temperatura: '', wolumenDzienny: '', liczbaProduktow: '', lokalizacja: '',
      miejscowoscTyp: '', platnosci: [], imie: '', telefon: '600000000',
      email: '', miejscowoscKontakt: '', rodo: true, website: '',
    });

    expect(body.produkt).toBe('kawa mielona');
    expect(body.notes).toContain('Produkty: kawa mielona');
  });

  it('includes the chosen cooperation model in notes and interest', () => {
    const body = buildLeadsRequestBody({
      model: 'pelna_obsluga', produkty: ['napoje'], produktInne: '', telefon: '600000000', rodo: true, website: '',
    });

    expect(body.notes).toContain('Model współpracy: pełna obsługa — gotowy automat (my stawiamy, uzupełniamy i zarabiamy na sprzedaży)');
    expect(body.zainteresowanie).toBe('Konfigurator VendingFresh — pełna obsługa — gotowy automat (my stawiamy, uzupełniamy i zarabiamy na sprzedaży)');
  });
});
