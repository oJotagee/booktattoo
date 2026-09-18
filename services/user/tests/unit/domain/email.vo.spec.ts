import { describe, expect, it } from 'bun:test';

import { InvalidEmailError } from '@/domain/errors/email.error';
import { Email } from '@/domain/value-objects/email.vo';

describe('Email', () => {
  it('creates a valid email trimming surrounding whitespace', () => {
    const email = Email.create({ value: '  john.doe@example.com  ' });

    expect(email.toString()).toBe('john.doe@example.com');
  });

  it('throws InvalidEmailError when the value is empty', () => {
    expect(() => Email.create({ value: '   ' })).toThrow(InvalidEmailError);
  });

  it('throws InvalidEmailError when the value is not a valid email', () => {
    expect(() => Email.create({ value: 'not-an-email' })).toThrow(InvalidEmailError);
  });

  it('considers two emails with the same value equal', () => {
    const a = Email.create({ value: 'john.doe@example.com' });
    const b = Email.create({ value: 'john.doe@example.com' });

    expect(a.equals(b)).toBe(true);
  });

  it('considers two emails with different values not equal', () => {
    const a = Email.create({ value: 'john.doe@example.com' });
    const b = Email.create({ value: 'jane.doe@example.com' });

    expect(a.equals(b)).toBe(false);
  });
});
