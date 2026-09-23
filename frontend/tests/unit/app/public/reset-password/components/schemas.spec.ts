import { describe, expect, it } from 'bun:test';

import { resetPasswordSchema } from '@/app/(public)/reset-password/[token]/_components/schemas';

describe('resetPasswordSchema', () => {
  const validInput = {
    password: 'Secret123!',
    confirmPassword: 'Secret123!',
  };

  it('accepts a valid payload with matching passwords', () => {
    const result = resetPasswordSchema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it('rejects when passwords do not match', () => {
    const result = resetPasswordSchema.safeParse({
      ...validInput,
      confirmPassword: 'Different123!',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'Ab1!',
      confirmPassword: 'Ab1!',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password without a lowercase letter', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'SECRET123!',
      confirmPassword: 'SECRET123!',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password without an uppercase letter', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'secret123!',
      confirmPassword: 'secret123!',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password without a number', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'Secretive!',
      confirmPassword: 'Secretive!',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password without a symbol', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'Secret123',
      confirmPassword: 'Secret123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty confirm password', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'Secret123!',
      confirmPassword: '',
    });

    expect(result.success).toBe(false);
  });
});
