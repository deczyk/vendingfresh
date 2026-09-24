export interface ConfiguratorState {
  kim: string;
  produkty: string[];
  produktInne: string;
  opakowanie: string;
  wymiary: string;
  temperatura: string;
  wolumenDzienny: string;
  liczbaProduktow: string;
  lokalizacja: string;
  miejscowoscTyp: string;
  platnosci: string[];
  finansowanie: string;
  imie: string;
  telefon: string;
  email: string;
  miejscowoscKontakt: string;
  rodo: boolean;
}

export function createInitialState(): ConfiguratorState {
  return {
    kim: '',
    produkty: [],
    produktInne: '',
    opakowanie: '',
    wymiary: '',
    temperatura: '',
    wolumenDzienny: '',
    liczbaProduktow: '',
    lokalizacja: '',
    miejscowoscTyp: '',
    platnosci: [],
    finansowanie: '',
    imie: '',
    telefon: '',
    email: '',
    miejscowoscKontakt: '',
    rodo: false,
  };
}

export function validateStep(step: number, state: ConfiguratorState): string | null {
  switch (step) {
    case 1:
      return state.kim.trim() === '' ? 'Wybierz, kim jesteś.' : null;
    case 2:
      return state.produkty.length === 0 && state.produktInne.trim() === ''
        ? 'Wybierz co najmniej jeden produkt albo opisz go w polu "inne".'
        : null;
    case 3:
      return state.opakowanie.trim() === '' ? 'Wybierz sposób pakowania.' : null;
    case 4:
      return state.temperatura.trim() === '' ? 'Wybierz temperaturę.' : null;
    case 5:
      return state.wolumenDzienny.trim() === '' ? 'Podaj orientacyjny wolumen sprzedaży.' : null;
    case 6:
      return state.lokalizacja.trim() === '' ? 'Wybierz, gdzie stanie automat.' : null;
    case 7:
      return null;
    case 8:
      return state.finansowanie.trim() === '' ? 'Wybierz sposób finansowania.' : null;
    case 9:
      if (state.telefon.trim() === '' && state.email.trim() === '') {
        return 'Podaj telefon lub e-mail.';
      }
      if (!state.rodo) {
        return 'Zaznacz zgodę RODO, żeby wysłać formularz.';
      }
      return null;
    default:
      return null;
  }
}

export function suggestDirection(state: ConfiguratorState): string {
  const wymagaChlodzenia =
    state.temperatura === 'chlodzenie' ||
    state.produkty.some((p) => ['sery', 'nabial', 'mieso', 'wedliny', 'dania'].includes(p));

  const base = wymagaChlodzenia ? 'SiLine Combi/GF z chłodzeniem' : 'SiLine Snack & Combi';
  const modifiers: string[] = [];

  if (state.produkty.includes('jajka')) modifiers.push('z windą');
  if (state.lokalizacja === 'zewnatrz' || state.lokalizacja === 'publiczne') modifiers.push('wersja outdoor');
  if (state.platnosci.includes('karta_blik')) modifiers.push('płatności bezgotówkowe');

  const kierunek = [base, ...modifiers].join(', ');
  return `Proponowany kierunek: ${kierunek}.`;
}

const TOTAL_STEPS = 9;

function initConfigurator(): void {
  const state = createInitialState();
  let currentStep = 1;

  const form = document.getElementById('config-form');
  const stepEls = Array.from(document.querySelectorAll<HTMLElement>('.config-step'));
  const progressBar = document.getElementById('config-progress-bar');
  const progressLabel = document.getElementById('config-progress-label');
  const errorEl = document.getElementById('config-error');
  const backBtn = document.getElementById('config-back');
  const nextBtn = document.getElementById('config-next');
  const resultEl = document.getElementById('config-result');
  const resultText = document.getElementById('config-result-text');
  const progressWrap = document.querySelector('.config-progress');

  if (!form || !progressBar || !progressLabel || !backBtn || !nextBtn) return;

  function syncStateFromDom(): void {
    state.kim = form!.querySelector<HTMLInputElement>('input[name="kim"]:checked')?.value ?? '';
    state.produkty = Array.from(
      form!.querySelectorAll<HTMLInputElement>('input[name="produkty"]:checked'),
    ).map((el) => el.value);
    state.produktInne = (document.getElementById('produkt-inne') as HTMLInputElement | null)?.value ?? '';
    state.opakowanie = form!.querySelector<HTMLInputElement>('input[name="opakowanie"]:checked')?.value ?? '';
    state.wymiary = (document.getElementById('wymiary') as HTMLInputElement | null)?.value ?? '';
    state.temperatura = form!.querySelector<HTMLInputElement>('input[name="temperatura"]:checked')?.value ?? '';
    state.wolumenDzienny = (document.getElementById('wolumen-dzienny') as HTMLInputElement | null)?.value ?? '';
    state.liczbaProduktow = (document.getElementById('liczba-produktow') as HTMLInputElement | null)?.value ?? '';
    state.lokalizacja = form!.querySelector<HTMLInputElement>('input[name="lokalizacja"]:checked')?.value ?? '';
    state.miejscowoscTyp =
      form!.querySelector<HTMLInputElement>('input[name="miejscowosc-typ"]:checked')?.value ?? '';
    state.platnosci = Array.from(
      form!.querySelectorAll<HTMLInputElement>('input[name="platnosci"]:checked'),
    ).map((el) => el.value);
    state.finansowanie = form!.querySelector<HTMLInputElement>('input[name="finansowanie"]:checked')?.value ?? '';
    state.imie = (document.getElementById('imie') as HTMLInputElement | null)?.value ?? '';
    state.telefon = (document.getElementById('telefon') as HTMLInputElement | null)?.value ?? '';
    state.email = (document.getElementById('email') as HTMLInputElement | null)?.value ?? '';
    state.miejscowoscKontakt =
      (document.getElementById('miejscowosc-kontakt') as HTMLInputElement | null)?.value ?? '';
    state.rodo = (document.getElementById('rodo') as HTMLInputElement | null)?.checked ?? false;
  }

  function renderStep(): void {
    stepEls.forEach((el) => {
      el.hidden = Number(el.dataset.step) !== currentStep;
    });
    progressBar!.style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;
    progressLabel!.textContent = `Krok ${currentStep} z ${TOTAL_STEPS}`;
    backBtn!.hidden = currentStep === 1;
    nextBtn!.textContent = currentStep === TOTAL_STEPS ? 'Wyślij' : 'Dalej';
    if (errorEl) errorEl.textContent = '';
  }

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep -= 1;
      renderStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    syncStateFromDom();
    const error = validateStep(currentStep, state);
    if (error) {
      if (errorEl) errorEl.textContent = error;
      return;
    }
    if (currentStep < TOTAL_STEPS) {
      currentStep += 1;
      renderStep();
      return;
    }
    void submit();
  });

  async function submit(): Promise<void> {
    nextBtn!.setAttribute('disabled', 'true');
    try {
      const response = await fetch('/api/konfigurator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marka: 'vendingfresh', typ: 'konfigurator', payload: state }),
      });
      if (!response.ok) throw new Error('Submit failed');

      form!.hidden = true;
      progressWrap?.setAttribute('hidden', 'true');
      if (resultEl) resultEl.hidden = false;
      if (resultText) resultText.textContent = suggestDirection(state);

      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      w.gtag?.('event', 'konfigurator_wyslany');
    } catch {
      if (errorEl) errorEl.textContent = 'Nie udało się wysłać formularza. Spróbuj ponownie albo zadzwoń.';
    } finally {
      nextBtn!.removeAttribute('disabled');
    }
  }

  renderStep();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initConfigurator);
}
