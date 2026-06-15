import { describe, expect, it } from 'vitest';
import { formatPercent, formatUsd } from './utils';

describe('format helpers', () => {
  it('formats growth percent with explicit sign', () => {
    expect(formatPercent(35.7)).toBe('+35,7%');
    expect(formatPercent(-20.1)).toBe('-20,1%');
  });

  it('formats USD values for Vietnamese locale reports', () => {
    expect(formatUsd(423.28)).toBe('423,28 $');
  });
});
