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
      return state.produkty.length === 0 && state.produktInne.trim() === ''
        ? 'Wybierz co najmniej jeden produkt albo opisz go w polu "inne".'
        : null;
    case 2:
      if (state.opakowanie.trim() === '') return 'Wybierz sposób pakowania.';
      if (state.opakowanie === 'inne' && state.opakowanieInne.trim() === '') return 'Wpisz, jak zapakowany jest Twój produkt.';
      if (state.temperatura.trim() === '') return 'Wybierz temperaturę.';
      return null;
    case 3:
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
};

const MACHINE_NAMES: Record<string, string> = {
  wv_hybrid: 'Westvend WV Hybrid',
  wv_8: 'Westvend WV 8',
  siline_snack_combi: 'Sielaff SiLine Snack & Combi',
  sn48: 'Sielaff SN48',
  siline_gf: 'Sielaff SiLine GF',
  robimat_x: 'Sielaff Robimat X',
  seria_fk: 'Sielaff seria FK',
  outdoor: 'Sielaff w wersji outdoor',
  siline_public: 'Sielaff SiLine Public',
};

export function suggestDirection(state: ConfiguratorState): string {
  const wymagaChlodzenia =
    state.temperatura === 'chlodzenie' ||
    state.produkty.some((p) => ['sery', 'nabial', 'mieso', 'wedliny', 'dania'].includes(p));
  const naZewnatrz = state.lokalizacja === 'zewnatrz' || state.lokalizacja === 'publiczne';
  const smart = state.linia === 'smart';

  const onlyDrinks = state.produkty.length > 0 && state.produkty.every((p) => p === 'napoje');
  const base =
    MACHINE_NAMES[state.modelAutomatu] ??
    (smart
      ? onlyDrinks ? 'Westvend WV 8' : 'Westvend WV Hybrid'
      : wymagaChlodzenia ? 'SiLine Combi/GF z chłodzeniem' : 'SiLine Snack & Combi');
  const modifiers: string[] = [];

  // The WV Hybrid always has a lift; Sielaff machines get it as an option.
  if (state.produkty.includes('jajka') && !base.includes('Westvend')) modifiers.push('z windą');
  if (naZewnatrz) modifiers.push(smart ? 'uwaga: linia Smart jest do wnętrz i pod zadaszenie — na zewnątrz polecamy Premium outdoor' : 'wersja outdoor');
  if (state.platnosci.includes('karta_blik')) modifiers.push('płatności bezgotówkowe');

  const kierunek = [base, ...modifiers].join(', ');
  const model = MODEL_LABELS[state.model];
  return model ? `Proponowany kierunek: ${kierunek}. ${model}` : `Proponowany kierunek: ${kierunek}.`;
}

const TOTAL_STEPS = 7;

export function nextStep(step: number): number {
  return step + 1;
}

export function prevStep(step: number): number {
  return step - 1;
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
    state.linia = form!.querySelector<HTMLInputElement>('input[name="linia"]:checked')?.value ?? '';
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
    progressBar!.style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;
    progressLabel!.textContent = `Krok ${currentStep} z ${TOTAL_STEPS}`;
    backBtn!.hidden = currentStep === 1;
    nextBtn!.textContent = currentStep === TOTAL_STEPS ? 'Wyślij zgłoszenie' : 'Dalej';
    if (errorEl) errorEl.textContent = '';
  }

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      syncStateFromDom();
      currentStep = prevStep(currentStep);
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
      currentStep = nextStep(currentStep);
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
    if (target?.name === 'linia') {
      form.dataset.linia = target.value;
      // Options of the other line stay hidden — don't send them with the lead.
      form
        .querySelectorAll<HTMLInputElement>(`[data-linia-opts]:not([data-linia-opts="${CSS.escape(target.value)}"]) input:checked`)
        .forEach((input) => (input.checked = false));
    }
  });

  form.dataset.linia = form.querySelector<HTMLInputElement>('input[name="linia"]:checked')?.value ?? '';

  renderStep();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initConfigurator);
}
