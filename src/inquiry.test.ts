import { describe, expect, it } from 'vitest';
import { toLeadPayload, validateInquiry, type InquiryInput } from './inquiry';

const messages = { product: 'P', contact: 'C', consent: 'R' };
const base: InquiryInput = {
  model: 'wynajem', produkt: 'Chléb a rohlíky', kraj: 'CZ', miasto: 'Ostrava',
  imie: 'Jan', telefon: '', email: 'jan@example.cz', zgoda: true, website: '', jezyk: 'cs',
};

describe('foreign inquiry form', () => {
  it('validates product, contact and consent in order', () => {
    expect(validateInquiry({ ...base, produkt: ' ' }, messages)).toBe('P');
    expect(validateInquiry({ ...base, email: '' }, messages)).toBe('C');
    expect(validateInquiry({ ...base, zgoda: false }, messages)).toBe('R');
    expect(validateInquiry(base, messages)).toBeNull();
  });

  it('maps onto the konfigurator lead payload with language and country', () => {
    expect(toLeadPayload(base)).toMatchObject({
      model: 'wynajem', produktInne: 'Chléb a rohlíky', miejscowoscKontakt: 'Ostrava, CZ',
      email: 'jan@example.cz', rodo: true, jezyk: 'cs',
    });
  });
});
