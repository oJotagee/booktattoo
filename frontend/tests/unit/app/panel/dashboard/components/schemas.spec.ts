import { describe, expect, it } from 'bun:test';

import { reminderSchema } from '@/app/(panel)/dashboard/_components/schemas';

describe('reminderSchema', () => {
  it('accepts a valid payload', () => {
    const result = reminderSchema.safeParse({ description: 'Comprar agulhas 3RL' });

    expect(result.success).toBe(true);
  });

  it('trims the description', () => {
    const result = reminderSchema.safeParse({ description: '  Comprar agulhas 3RL  ' });

    expect(result.data?.description).toBe('Comprar agulhas 3RL');
  });

  it('rejects an empty description', () => {
    const result = reminderSchema.safeParse({ description: '   ' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Descrição é obrigatória');
  });
});
