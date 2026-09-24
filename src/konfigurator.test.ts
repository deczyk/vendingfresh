import { describe, expect, it } from 'vitest';
import { createInitialState, suggestDirection, validateStep } from './konfigurator';

describe('validateStep', () => {
  it('requires a selection on step 1', () => {
    const state = createInitialState();
    expect(validateStep(1, state)).toMatch(/Wybierz/);
    state.kim = 'piekarnia';
    expect(validateStep(1, state)).toBeNull();
  });

  it('requires at least one product or free text on step 2', () => {
    const state = createInitialState();
    expect(validateStep(2, state)).not.toBeNull();
    state.produktInne = 'kawa mielona';
    expect(validateStep(2, state)).toBeNull();
  });

  it('requires phone or email plus RODO consent on step 9', () => {
    const state = createInitialState();
    expect(validateStep(9, state)).toMatch(/telefon/);
    state.telefon = '123456789';
    expect(validateStep(9, state)).toMatch(/RODO/);
    state.rodo = true;
    expect(validateStep(9, state)).toBeNull();
  });
});

describe('suggestDirection', () => {
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
