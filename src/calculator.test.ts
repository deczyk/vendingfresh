import { describe, expect, it } from 'vitest';
import { calculate, CALCULATOR_PRESETS } from './calculator';

describe('calculate', () => {
  it('computes revenue, profit and ROI for the piekarnia preset', () => {
    const result = calculate(CALCULATOR_PRESETS.piekarnia);
    expect(result.monthlyRevenue).toBe(14400);
    expect(result.yearlyRevenue).toBe(172800);
    expect(result.monthlyProfit).toBeCloseTo(4640);
    expect(result.roiMonths).toBeCloseTo(7.543, 2);
  });

  it('returns null ROI when monthly profit is not positive', () => {
    const result = calculate({
      transactionsPerDay: 1,
      basketValue: 3,
      marginPercent: 5,
      investment: 10000,
      monthlyCosts: 1000,
    });
    expect(result.monthlyProfit).toBeLessThanOrEqual(0);
    expect(result.roiMonths).toBeNull();
  });

  it('exposes all four presets required by the homepage buttons', () => {
    expect(Object.keys(CALCULATOR_PRESETS).sort()).toEqual(['bio', 'jajka', 'piekarnia', 'serowarnia']);
  });
});
