import { describe, expect, it } from 'bun:test';

import { loginSchema, registerSchema } from '@/app/(public)/login/_components/schemas';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'john.doe@example.com',
      password: 'secret123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'john.doe@example.com',
      password: '',
    });

    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validInput = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'Secret123!',
  };

  it('accepts a valid payload', () => {
    const result = registerSchema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = registerSchema.safeParse({ ...validInput, name: '' });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ ...validInput, email: 'invalid' });

    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'Ab1!' });

    expect(result.success).toBe(false);
  });

  it('rejects a password without a lowercase letter', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'SECRET123!' });

    expect(result.success).toBe(false);
  });

  it('rejects a password without an uppercase letter', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'secret123!' });

    expect(result.success).toBe(false);
  });

  it('rejects a password without a number', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'Secretive!' });

    expect(result.success).toBe(false);
  });

  it('rejects a password without a symbol', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'Secret123' });

    expect(result.success).toBe(false);
  });
});
