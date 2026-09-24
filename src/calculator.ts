export interface CalculatorInputs {
  transactionsPerDay: number;
  basketValue: number;
  marginPercent: number;
  investment: number;
  monthlyCosts: number;
}

export interface CalculatorResult {
  monthlyRevenue: number;
  yearlyRevenue: number;
  monthlyProfit: number;
  roiMonths: number | null;
}

export function calculate(inputs: CalculatorInputs): CalculatorResult {
  const monthlyRevenue = inputs.transactionsPerDay * inputs.basketValue * 30;
  const monthlyProfit = monthlyRevenue * (inputs.marginPercent / 100) - inputs.monthlyCosts;
  const yearlyRevenue = monthlyRevenue * 12;
  const roiMonths = monthlyProfit > 0 ? inputs.investment / monthlyProfit : null;

  return { monthlyRevenue, yearlyRevenue, monthlyProfit, roiMonths };
}

export const CALCULATOR_PRESETS: Record<string, CalculatorInputs> = {
  piekarnia: { transactionsPerDay: 40, basketValue: 12, marginPercent: 35, investment: 35000, monthlyCosts: 400 },
  jajka: { transactionsPerDay: 20, basketValue: 15, marginPercent: 40, investment: 30000, monthlyCosts: 250 },
  serowarnia: { transactionsPerDay: 15, basketValue: 25, marginPercent: 45, investment: 40000, monthlyCosts: 350 },
  bio: { transactionsPerDay: 60, basketValue: 20, marginPercent: 30, investment: 60000, monthlyCosts: 700 },
};

function formatPLN(value: number): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(value);
}

function initCalculator(): void {
  const ids = ['transactions', 'basket', 'margin', 'investment', 'costs'] as const;
  const sliders = Object.fromEntries(
    ids.map((id) => [id, document.getElementById(`calc-${id}`) as HTMLInputElement | null]),
  ) as Record<(typeof ids)[number], HTMLInputElement | null>;

  if (Object.values(sliders).some((el) => el === null)) return;

  const outputs = Object.fromEntries(
    ids.map((id) => [id, document.getElementById(`calc-${id}-out`)]),
  ) as Record<(typeof ids)[number], HTMLElement | null>;

  const revenueMonthEl = document.getElementById('calc-revenue-month');
  const revenueYearEl = document.getElementById('calc-revenue-year');
  const profitEl = document.getElementById('calc-profit');
  const roiEl = document.getElementById('calc-roi');

  function readInputs(): CalculatorInputs {
    return {
      transactionsPerDay: Number(sliders.transactions!.value),
      basketValue: Number(sliders.basket!.value),
      marginPercent: Number(sliders.margin!.value),
      investment: Number(sliders.investment!.value),
      monthlyCosts: Number(sliders.costs!.value),
    };
  }

  function render(): void {
    const inputs = readInputs();
    ids.forEach((id) => {
      if (outputs[id]) outputs[id]!.textContent = sliders[id]!.value;
    });

    const result = calculate(inputs);
    if (revenueMonthEl) revenueMonthEl.textContent = formatPLN(result.monthlyRevenue);
    if (revenueYearEl) revenueYearEl.textContent = formatPLN(result.yearlyRevenue);
    if (profitEl) profitEl.textContent = formatPLN(result.monthlyProfit);
    if (roiEl) roiEl.textContent = result.roiMonths === null ? '—' : `${result.roiMonths.toFixed(1)} mies.`;
  }

  ids.forEach((id) => {
    sliders[id]!.addEventListener('input', render);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = CALCULATOR_PRESETS[btn.dataset.preset ?? ''];
      if (!preset) return;
      sliders.transactions!.value = String(preset.transactionsPerDay);
      sliders.basket!.value = String(preset.basketValue);
      sliders.margin!.value = String(preset.marginPercent);
      sliders.investment!.value = String(preset.investment);
      sliders.costs!.value = String(preset.monthlyCosts);
      render();
    });
  });

  render();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCalculator);
}
