const BOOKING_TOKEN_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export const BOOKING_TOKEN_HEADER = 'X-Booking-Token';

export function isBookingToken(token: string): boolean {
  return token.length <= 512 && BOOKING_TOKEN_PATTERN.test(token);
}

export function bookingTokenHeaders(token: string) {
  return { [BOOKING_TOKEN_HEADER]: token };
}
