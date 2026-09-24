import { describe, expect, it } from 'bun:test';

import { serviceSchema } from '@/app/(panel)/dashboard/services/_components/schemas';

describe('serviceSchema', () => {
  const validInput = {
    name: 'Flash Médio (5–10 cm)',
    depositAmount: 32000,
    hours: 2,
    minutes: 30,
  };

  it('accepts a valid payload', () => {
    const result = serviceSchema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it('accepts a duration with only minutes', () => {
    const result = serviceSchema.safeParse({ ...validInput, hours: 0, minutes: 45 });

    expect(result.success).toBe(true);
  });

  it('accepts a duration with only hours', () => {
    const result = serviceSchema.safeParse({ ...validInput, hours: 3, minutes: 0 });

    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = serviceSchema.safeParse({ ...validInput, name: '   ' });

    expect(result.success).toBe(false);
  });

  it('rejects a zero deposit amount', () => {
    const result = serviceSchema.safeParse({ ...validInput, depositAmount: 0 });

    expect(result.success).toBe(false);
  });

  it('rejects negative hours', () => {
    const result = serviceSchema.safeParse({ ...validInput, hours: -1 });

    expect(result.success).toBe(false);
  });

  it('rejects minutes above 59', () => {
    const result = serviceSchema.safeParse({ ...validInput, minutes: 60 });

    expect(result.success).toBe(false);
  });

  it('rejects non-integer minutes', () => {
    const result = serviceSchema.safeParse({ ...validInput, minutes: 10.5 });

    expect(result.success).toBe(false);
  });

  it('rejects an empty hours field (NaN from the number input)', () => {
    const result = serviceSchema.safeParse({ ...validInput, hours: Number.NaN });

    expect(result.success).toBe(false);
  });

  it('rejects a zero total duration on the hours field', () => {
    const result = serviceSchema.safeParse({ ...validInput, hours: 0, minutes: 0 });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['hours']);
    expect(result.error?.issues[0]?.message).toBe('A duração deve ser maior que zero');
  });
});
