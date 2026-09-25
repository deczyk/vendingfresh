export interface ConfiguratorState {
  model: string;
  czestotliwosc: string;
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
  imie: string;
  telefon: string;
  email: string;
  miejscowoscKontakt: string;
  rodo: boolean;
  website: string;
}

export function createInitialState(): ConfiguratorState {
  return {
    model: '',
    czestotliwosc: '',
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
    imie: '',
    telefon: '',
    email: '',
    miejscowoscKontakt: '',
    rodo: false,
    website: '',
  };
}

export function validateStep(step: number, state: ConfiguratorState): string | null {
  switch (step) {
    case 1:
      if (state.model.trim() === '') return 'Wybierz, jak chcesz mieć automat: zakup, wynajem albo pełna obsługa.';
      return state.produkty.length === 0 && state.produktInne.trim() === ''
        ? 'Wybierz co najmniej jeden produkt albo opisz go w polu "inne".'
        : null;
    case 2:
      if (state.opakowanie.trim() === '') return 'Wybierz sposób pakowania.';
      if (state.temperatura.trim() === '') return 'Wybierz temperaturę.';
      return null;
    case 3:
      if (state.model === 'pelna_obsluga') {
        return state.wolumenDzienny.trim() === '' ? 'Podaj, ile osób mniej więcej jest na miejscu każdego dnia.' : null;
      }
      return state.wolumenDzienny.trim() === '' ? 'Podaj orientacyjny wolumen sprzedaży.' : null;
    case 4:
      return state.lokalizacja.trim() === '' ? 'Wybierz, gdzie stanie automat.' : null;
    case 5:
      return null;
    case 6:
      if (state.telefon.trim() === '' && state.email.trim() === '') {
        return 'Podaj telefon lub e-mail.';
      }
      if (!state.rodo) {
        return 'Zaznacz zgodę RODO, żeby wysłać formularz.';
      }
      return null;
    case 7:
      return null;
    default:
      return null;
  }
}

export const MODEL_LABELS: Record<string, string> = {
  zakup: 'Model: zakup na własność — gotówka, leasing albo dotacja.',
  wynajem: 'Model: wynajem — Ty uzupełniasz automat, płacisz miesięczną opłatę.',
  pelna_obsluga: 'Model: pełna obsługa — stawiamy automat, uzupełniamy go i serwisujemy. Przy odpowiednim ruchu bez kosztów po Twojej stronie, przy mniejszym stała opłata miesięczna — ustalimy to w wycenie.',
};

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
  const model = MODEL_LABELS[state.model];
  return model ? `Proponowany kierunek: ${kierunek}. ${model}` : `Proponowany kierunek: ${kierunek}.`;
}

const TOTAL_STEPS = 7;

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
    state.model = form!.querySelector<HTMLInputElement>('input[name="model"]:checked')?.value ?? '';
    form!.dataset.model = state.model;
    state.czestotliwosc = form!.querySelector<HTMLInputElement>('input[name="czestotliwosc"]:checked')?.value ?? '';
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
    state.imie = (document.getElementById('imie') as HTMLInputElement | null)?.value ?? '';
    state.telefon = (document.getElementById('telefon') as HTMLInputElement | null)?.value ?? '';
    state.email = (document.getElementById('email') as HTMLInputElement | null)?.value ?? '';
    state.miejscowoscKontakt =
      (document.getElementById('miejscowosc-kontakt') as HTMLInputElement | null)?.value ?? '';
    state.rodo = (document.getElementById('rodo') as HTMLInputElement | null)?.checked ?? false;
    state.website = (document.getElementById('hp-website') as HTMLInputElement | null)?.value ?? '';
  }

  function renderStep(): void {
    stepEls.forEach((el) => {
      el.hidden = Number(el.dataset.step) !== currentStep;
    });
    progressBar!.style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;
    progressLabel!.textContent = `Krok ${currentStep} z ${TOTAL_STEPS}`;
    backBtn!.hidden = currentStep === 1;
    nextBtn!.textContent = currentStep === TOTAL_STEPS ? 'Wyślij zgłoszenie' : 'Dalej';
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

  form.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement | null;
    if (target?.name === 'model') form.dataset.model = target.value;
  });

  // Deep link from /oferta: /konfigurator?model=pelna_obsluga preselects the option.
  const preset = new URLSearchParams(window.location.search).get('model');
  const presetInput = preset ? form.querySelector<HTMLInputElement>(`input[name="model"][value="${CSS.escape(preset)}"]`) : null;
  if (presetInput) {
    presetInput.checked = true;
    form.dataset.model = presetInput.value;
  }

  renderStep();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initConfigurator);
}
