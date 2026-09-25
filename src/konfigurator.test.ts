import { describe, expect, it } from 'vitest';
import { createInitialState, nextStep, prevStep, suggestDirection, validateStep } from './konfigurator';

describe('validateStep', () => {
  it('requires at least one product or free text on step 1', () => {
    const state = createInitialState();
    state.model = 'zakup';
    expect(validateStep(1, state)).not.toBeNull();
    state.produktInne = 'kawa mielona';
    expect(validateStep(1, state)).toBeNull();
  });

  it('requires packaging and temperature on step 2', () => {
    const state = createInitialState();
    expect(validateStep(2, state)).toMatch(/pakowania/);
    state.opakowanie = 'worek';
    expect(validateStep(2, state)).toMatch(/temperaturę/);
    state.temperatura = 'pokojowa';
    expect(validateStep(2, state)).toBeNull();
  });

  it('requires a description when packaging is "inne"', () => {
    const state = createInitialState();
    state.opakowanie = 'inne';
    state.temperatura = 'chlodzenie';
    expect(validateStep(2, state)).toMatch(/Wpisz/);
    state.opakowanieInne = 'tacka z folią';
    expect(validateStep(2, state)).toBeNull();
  });

  it('requires a volume estimate on step 3', () => {
    const state = createInitialState();
    expect(validateStep(3, state)).toMatch(/wolumen/);
    state.wolumenDzienny = '40 szt dziennie';
    expect(validateStep(3, state)).toBeNull();
  });

  it('requires a location on step 4', () => {
    const state = createInitialState();
    expect(validateStep(4, state)).toMatch(/gdzie stanie/);
    state.lokalizacja = 'budynek';
    expect(validateStep(4, state)).toBeNull();
  });

  it('has no required fields on step 5 (payments)', () => {
    expect(validateStep(5, createInitialState())).toBeNull();
  });

  it('requires phone or email plus RODO consent on step 6', () => {
    const state = createInitialState();
    expect(validateStep(6, state)).toMatch(/telefon/);
    state.telefon = '123456789';
    expect(validateStep(6, state)).toMatch(/RODO/);
    state.rodo = true;
    expect(validateStep(6, state)).toBeNull();
  });

  it('has no required fields on step 7 (optional calculator)', () => {
    expect(validateStep(7, createInitialState())).toBeNull();
  });
});

describe('suggestDirection', () => {
  it('appends the chosen cooperation model', () => {
    const state = createInitialState();
    state.temperatura = 'pokojowa';
    state.lokalizacja = 'budynek';
    state.model = 'zakup';
    expect(suggestDirection(state)).toBe(
      'Proponowany kierunek: SiLine Snack & Combi. Model: zakup na własność — gotówka, leasing albo dotacja.',
    );
  });

  it('suggests a cooled model for dairy products', () => {
    const state = createInitialState();
    state.temperatura = 'chlodzenie';
    state.produkty = ['sery'];
    state.lokalizacja = 'budynek';
    expect(suggestDirection(state)).toBe('Proponowany kierunek: SiLine Combi/GF z chłodzeniem.');
  });

  it('adds elevator, outdoor and cashless modifiers', () => {
    const state = createInitialState();
    state.temperatura = 'pokojowa';
    state.produkty = ['jajka'];
    state.lokalizacja = 'zewnatrz';
    state.platnosci = ['karta_blik'];
    expect(suggestDirection(state)).toBe(
      'Proponowany kierunek: SiLine Snack & Combi, z windą, wersja outdoor, płatności bezgotówkowe.',
    );
  });
});

describe('suggestDirection for the chosen line', () => {
  it('uses the machine the client picked', () => {
    const state = createInitialState();
    state.linia = 'premium';
    state.modelAutomatu = 'robimat_x';
    expect(suggestDirection(state)).toBe('Proponowany kierunek: Sielaff Robimat X.');
  });

  it('suggests Westvend for the Smart line and warns about outdoor use', () => {
    const state = createInitialState();
    state.linia = 'smart';
    state.produkty = ['jajka'];
    state.lokalizacja = 'zewnatrz';
    expect(suggestDirection(state)).toMatch(/^Proponowany kierunek: Westvend WV Hybrid, uwaga: linia Smart/);
    state.produkty = ['napoje'];
    state.lokalizacja = 'budynek';
    expect(suggestDirection(state)).toBe('Proponowany kierunek: Westvend WV 8.');
  });
});

describe('step navigation', () => {
  it('walks every step in order', () => {
    expect(nextStep(1)).toBe(2);
    expect(nextStep(4)).toBe(5);
    expect(prevStep(3)).toBe(2);
  });
});
