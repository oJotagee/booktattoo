import { describe, expect, it } from 'bun:test';

import { extractPhoneNumber, formatPhone } from '@/utils/formatPhone';

describe('formatPhone', () => {
  it('formats a partial DDD', () => {
    expect(formatPhone('11')).toBe('11');
  });

  it('formats a DDD with a partial number', () => {
    expect(formatPhone('119')).toBe('(11) 9');
  });

  it('formats a complete landline number', () => {
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
  });

  it('formats a complete mobile number', () => {
    expect(formatPhone('11933334444')).toBe('(11) 93333-4444');
  });

  it('ignores non-digit characters already present', () => {
    expect(formatPhone('(11) 93333-4444')).toBe('(11) 93333-4444');
  });

  it('truncates input longer than 11 digits', () => {
    const tooLong = '119333344445678';

    expect(formatPhone(tooLong)).toBe(tooLong.slice(0, 15));
  });
});

describe('extractPhoneNumber', () => {
  it('removes parentheses, spaces and dashes', () => {
    expect(extractPhoneNumber('(11) 93333-4444')).toBe('11933334444');
  });

  it('returns digits only for a formatted phone', () => {
    expect(extractPhoneNumber('(11) 3333-4444')).toBe('1133334444');
  });

  it('is a no-op for an already clean number', () => {
    expect(extractPhoneNumber('11933334444')).toBe('11933334444');
  });
});
