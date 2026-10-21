export const BOOKING_LINK = Symbol('BOOKING_LINK');

export interface BookingLink {
  sign(bookingRequestId: string): string;
  verify(token: string): string | null;
}
