import { describe, expect, it } from 'vitest';
import { classifyLink } from './analytics';

describe('classifyLink', () => {
  it('recognises phone and e-mail links', () => {
    expect(classifyLink('tel:+48735115427')).toBe('klik_telefon');
    expect(classifyLink('mailto:kontakt@vendingfresh.pl')).toBe('klik_email');
  });

  it('recognises key conversion pages, relative or absolute', () => {
    expect(classifyLink('/konfigurator?model=pelna_obsluga')).toBe('klik_konfigurator');
    expect(classifyLink('https://vendingfresh.pl/oferta#wynajem')).toBe('klik_oferta');
    expect(classifyLink('/automat-dla-firmy')).toBe('klik_dla_firm');
    expect(classifyLink('/kontakt')).toBe('klik_kontakt');
  });

  it('ignores everything else', () => {
    expect(classifyLink('/rozwiazania/jajka')).toBeNull();
    expect(classifyLink('https://sklepzastodola.pl')).toBeNull();
  });
});
