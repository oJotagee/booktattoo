import { describe, expect, it } from 'bun:test';

import { BookingOfferStatus } from '@/domain/entities/booking-offer.entity';
import {
  BookingOfferUnavailableError,
  InvalidBookingOfferError,
} from '@/domain/errors/booking-request.error';
import { buildOffer } from '@tests/unit/support/builders';

describe('BookingOfferEntity', () => {
  it('starts pending', () => {
    expect(buildOffer().status).toBe(BookingOfferStatus.PENDING);
  });

  it('becomes paid with the appointment that confirmed it', () => {
    const paidAt = new Date();
    const paid = buildOffer().markPaid('appointment-1', paidAt);

    expect(paid.status).toBe(BookingOfferStatus.PAID);
    expect(paid.appointmentId).toBe('appointment-1');
    expect(paid.paidAt).toBe(paidAt);
  });

  it('only cancels offers that were paid', () => {
    const cancelled = buildOffer().markPaid('appointment-1', new Date()).markCancelled();

    expect(cancelled.status).toBe(BookingOfferStatus.CANCELLED);
    expect(() => buildOffer().markCancelled()).toThrow(BookingOfferUnavailableError);
    expect(() => cancelled.markCancelled()).toThrow(BookingOfferUnavailableError);
  });

  it('only leaves the pending state once', () => {
    const withdrawn = buildOffer().withdraw();

    expect(withdrawn.status).toBe(BookingOfferStatus.WITHDRAWN);
    expect(() => withdrawn.withdraw()).toThrow(BookingOfferUnavailableError);
    expect(() => withdrawn.markPaid('appointment-1', new Date())).toThrow(
      BookingOfferUnavailableError,
    );
  });

  it.each([
    { duration: 45 },
    { duration: 0 },
    { duration: 510 },
    { depositAmount: 49 },
    { price: 10000, depositAmount: 20000 },
  ])('rejects invalid values %o', (overrides) => {
    expect(() => buildOffer(overrides)).toThrow(InvalidBookingOfferError);
  });
});
