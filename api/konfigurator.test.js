import { describe, expect, it } from 'vitest';
import { validateLeadPayload } from './konfigurator.js';

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
});
