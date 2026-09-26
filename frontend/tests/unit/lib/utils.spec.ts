import { describe, expect, it } from 'bun:test';

import { getInitials } from '@/lib/utils';

describe('getInitials', () => {
  it('returns the uppercased first letter of each name', () => {
    expect(getInitials('amanda cassajus')).toBe('AC');
  });

  it('works with a single name', () => {
    expect(getInitials('Kenji')).toBe('K');
  });
});
