import { describe, expect, it } from 'bun:test';

import { forgotPasswordSchema } from '@/app/(public)/forgot-password/_components/schemas';

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'john.doe@example.com' });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'not-an-email' });

    expect(result.success).toBe(false);
  });

  it('rejects a missing email', () => {
    const result = forgotPasswordSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
