import { track } from './analytics';

export interface ConfiguratorState {
  model: string;
  linia: string;
  czestotliwosc: string;
  produkty: string[];
  produktInne: string;
  opakowanie: string;
  opakowanieInne: string;
  modelAutomatu: string;
  kolorObudowy: string;
  liczbaAutomatow: string;
  opcjeLinii: string[];
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
    linia: '',
    czestotliwosc: '',
    produkty: [],
    produktInne: '',
    opakowanie: '',
    opakowanieInne: '',
    modelAutomatu: '',
    kolorObudowy: '',
    liczbaAutomatow: '',
    opcjeLinii: [],
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
      if (state.model === 'pelna_obsluga') {
        return state.produkty.length === 0 && state.produktInne.trim() === ''
          ? 'Wybierz, jakie produkty mają być w automacie.'
          : null;
      }
      return state.produkty.length === 0 && state.produktInne.trim() === ''
        ? 'Wybierz co najmniej jeden produkt albo opisz go w polu "inne".'
        : null;
    case 2:
      if (state.opakowanie.trim() === '') return 'Wybierz sposób pakowania.';
      if (state.opakowanie === 'inne' && state.opakowanieInne.trim() === '') return 'Wpisz, jak zapakowany jest Twój produkt.';
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
  if (state.model === 'pelna_obsluga') {
    return `Proponowany kierunek: gotowy automat z naszym asortymentem, dobrany do liczby osób na miejscu. ${MODEL_LABELS.pelna_obsluga}`;
  }
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

// Pełna obsługa = a ready-made machine stocked from our range, so the
// packaging/temperature step (2) does not apply and is skipped.
export function nextStep(step: number, model: string): number {
  return model === 'pelna_obsluga' && step === 1 ? 3 : step + 1;
}

/** Step number and total as shown to the visitor (pełna obsługa has one step fewer). */
export function displayStep(step: number, total: number, model: string): [number, number] {
  return model === 'pelna_obsluga' ? [step > 2 ? step - 1 : step, total - 1] : [step, total];
}

export function prevStep(step: number, model: string): number {
  return model === 'pelna_obsluga' && step === 3 ? 1 : step - 1;
}

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
    state.linia = state.model === 'pelna_obsluga' ? '' : (form!.querySelector<HTMLInputElement>('input[name="linia"]:checked')?.value ?? '');
    form!.dataset.linia = state.linia;
    state.modelAutomatu = state.linia === 'smart' || state.linia === 'premium'
      ? (form!.querySelector<HTMLInputElement>('input[name="model-automatu"]:checked')?.value ?? '')
      : '';
    // Radio groups inside the visible line block, e.g. "Wersja temperaturowa: LM".
    state.opcjeLinii = Array.from(
      form!.querySelectorAll<HTMLElement>(`[data-linia-opts="${CSS.escape(state.linia)}"] [data-lead-label]`),
    ).flatMap((group) => {
      const checked = group.querySelector<HTMLInputElement>('input:checked');
      return checked ? [`${group.dataset.leadLabel}: ${checked.value}`] : [];
    });
    state.liczbaAutomatow = state.linia === 'smart' ? (document.getElementById('liczba-automatow') as HTMLInputElement | null)?.value ?? '' : '';
    state.kolorObudowy = state.linia === 'smart' ? (document.getElementById('kolor-obudowy') as HTMLInputElement | null)?.value ?? '' : '';
    state.czestotliwosc = form!.querySelector<HTMLInputElement>('input[name="czestotliwosc"]:checked')?.value ?? '';
    state.produkty = Array.from(
      form!.querySelectorAll<HTMLInputElement>('input[name="produkty"]:checked'),
    ).map((el) => el.value);
    state.produktInne = (document.getElementById('produkt-inne') as HTMLInputElement | null)?.value ?? '';
    state.opakowanie = form!.querySelector<HTMLInputElement>('input[name="opakowanie"]:checked')?.value ?? '';
    state.opakowanieInne = (document.getElementById('opakowanie-inne') as HTMLInputElement | null)?.value ?? '';
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
    const [shown, total] = displayStep(currentStep, TOTAL_STEPS, form!.dataset.model ?? '');
    progressBar!.style.width = `${(shown / total) * 100}%`;
    progressLabel!.textContent = `Krok ${shown} z ${total}`;
    backBtn!.hidden = currentStep === 1;
    nextBtn!.textContent = currentStep === TOTAL_STEPS ? 'Wyślij zgłoszenie' : 'Dalej';
    if (errorEl) errorEl.textContent = '';
  }

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      syncStateFromDom();
      currentStep = prevStep(currentStep, state.model);
      renderStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    syncStateFromDom();
    const error = validateStep(currentStep, state);
    if (error) {
      if (errorEl) errorEl.textContent = error;
      track('konfigurator_blad', { krok: currentStep });
      return;
    }
    if (currentStep < TOTAL_STEPS) {
      if (currentStep === 1) track('konfigurator_model', { model: state.model });
      currentStep = nextStep(currentStep, state.model);
      renderStep();
      // One event per step reached → a funnel in GA4 shows where people drop off.
      track('konfigurator_krok', { krok: currentStep, model: state.model });
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
      w.gtag?.('event', 'konfigurator_wyslany', { model: state.model });
    } catch {
      if (errorEl) errorEl.textContent = 'Nie udało się wysłać formularza. Spróbuj ponownie albo zadzwoń.';
    } finally {
      nextBtn!.removeAttribute('disabled');
    }
  }

  form.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement | null;
    if (target?.name === 'model') {
      form.dataset.model = target.value;
      const hiddenGroup = target.value === 'pelna_obsluga' ? 'custom' : 'pelna';
      form
        .querySelectorAll<HTMLInputElement>(`[data-group="${hiddenGroup}"] input:checked`)
        .forEach((input) => (input.checked = false));
      renderStep();
    }
    if (target?.name === 'linia') {
      form.dataset.linia = target.value;
      // Options of the other line stay hidden — don't send them with the lead.
      form
        .querySelectorAll<HTMLInputElement>(`[data-linia-opts]:not([data-linia-opts="${CSS.escape(target.value)}"]) input:checked`)
        .forEach((input) => (input.checked = false));
    }
  });

  // Deep link from /oferta: /konfigurator?model=pelna_obsluga preselects the option.
  const preset = new URLSearchParams(window.location.search).get('model');
  const presetInput = preset ? form.querySelector<HTMLInputElement>(`input[name="model"][value="${CSS.escape(preset)}"]`) : null;
  if (presetInput) {
    presetInput.checked = true;
    form.dataset.model = presetInput.value;
  }
  form.dataset.linia = form.querySelector<HTMLInputElement>('input[name="linia"]:checked')?.value ?? '';

  renderStep();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initConfigurator);
}
