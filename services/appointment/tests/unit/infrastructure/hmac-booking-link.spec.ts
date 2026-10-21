import { describe, expect, it } from 'bun:test';

import { HmacBookingLink } from '@/infrastructure/crypto/hmac-booking-link';

function linkWith(bookingLinkSecret: string): HmacBookingLink {
  return new HmacBookingLink({
    userServiceUrl: '',
    catalogServiceUrl: '',
    paymentServiceUrl: '',
    internalApiSecret: '',
    frontendUrl: '',
    bookingLinkSecret,
  });
}

const SECRET = 'a'.repeat(32);

describe('HmacBookingLink', () => {
  it('verifies a token it signed', () => {
    const link = linkWith(SECRET);

    expect(link.verify(link.sign('request-1'))).toBe('request-1');
  });

  it('produces url safe tokens', () => {
    expect(linkWith(SECRET).sign('request-1')).toMatch(/^[\w-]+\.[\w-]+$/);
  });

  it('rejects a token with a swapped request id', () => {
    const link = linkWith(SECRET);
    const [, signature] = link.sign('request-1').split('.');
    const forged = `${Buffer.from('request-2').toString('base64url')}.${signature}`;

    expect(link.verify(forged)).toBeNull();
  });

  it('rejects a token signed with another secret', () => {
    const token = linkWith('b'.repeat(32)).sign('request-1');

    expect(linkWith(SECRET).verify(token)).toBeNull();
  });

  it('rejects malformed tokens', () => {
    const link = linkWith(SECRET);

    expect(link.verify('')).toBeNull();
    expect(link.verify('abc')).toBeNull();
    expect(link.verify('a.b.c')).toBeNull();
  });

  it('refuses to start with a short secret', () => {
    expect(() => linkWith('short')).toThrow(/BOOKING_LINK_SECRET/);
  });
});
