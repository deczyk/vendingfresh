import { describe, expect, it } from 'vitest';
import { getStoredConsent } from './cookies';

function fakeStorage(value: string | null): Pick<Storage, 'getItem'> {
  return { getItem: () => value };
}

describe('getStoredConsent', () => {
  it('returns null when nothing is stored', () => {
    expect(getStoredConsent(fakeStorage(null))).toBeNull();
  });

  it('returns accepted when stored as accepted', () => {
    expect(getStoredConsent(fakeStorage('accepted'))).toBe('accepted');
  });

  it('returns declined when stored as declined', () => {
    expect(getStoredConsent(fakeStorage('declined'))).toBe('declined');
  });

  it('ignores unexpected values', () => {
    expect(getStoredConsent(fakeStorage('garbage'))).toBeNull();
  });
});
