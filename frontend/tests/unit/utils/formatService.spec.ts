import { describe, expect, it } from 'bun:test';

import { formatCurrency, formatDuration, parseCurrencyToCents } from '@/utils/formatService';

describe('formatCurrency', () => {
  it('formats cents as BRL', () => {
    expect(formatCurrency(32000)).toBe('R$ 320,00');
  });

  it('formats values with cents', () => {
    expect(formatCurrency(12345)).toBe('R$ 123,45');
  });

  it('formats thousands with a dot separator', () => {
    expect(formatCurrency(150000)).toBe('R$ 1.500,00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00');
  });
});

describe('parseCurrencyToCents', () => {
  it('parses a formatted BRL value to cents', () => {
    expect(parseCurrencyToCents('R$ 320,00')).toBe(32000);
  });

  it('treats typed digits as cents', () => {
    expect(parseCurrencyToCents('R$ 320,005')).toBe(320005);
  });

  it('returns zero when there are no digits', () => {
    expect(parseCurrencyToCents('R$ ')).toBe(0);
  });

  it('round-trips with formatCurrency', () => {
    expect(parseCurrencyToCents(formatCurrency(150000))).toBe(150000);
  });
});

describe('formatDuration', () => {
  it('formats minutes below one hour', () => {
    expect(formatDuration(45)).toBe('45min');
  });

  it('formats whole hours', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('formats hours with minutes', () => {
    expect(formatDuration(90)).toBe('1h30');
  });

  it('pads minutes below ten', () => {
    expect(formatDuration(65)).toBe('1h05');
  });
});
