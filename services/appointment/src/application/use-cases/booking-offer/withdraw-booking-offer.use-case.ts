import { Inject, Injectable } from '@nestjs/common';

import { findOwnedRequest } from '../booking-request/find-artist-booking-request.use-case';
import {
  BOOKING_OFFER_REPOSITORY,
  type BookingOfferRepository,
  type SaveOffersParams,
} from '../../port/booking-offer-repository.port';
import {
  BOOKING_REQUEST_REPOSITORY,
  type BookingRequestRepository,
} from '../../port/booking-request-repository.port';
import type { BookingRequestEntity } from '@/domain/entities/booking-request.entity';
import { BookingRequestMessageEntity } from '@/domain/entities/booking-request.entity';
import {
  BookingOfferUnavailableError,
  OfferPaymentInProgressError,
} from '@/domain/errors/booking-request.error';
import { offerWithdrawnMessage } from './offer-messages';

@Injectable()
export class WithdrawBookingOfferUseCase {
  constructor(
    @Inject(BOOKING_REQUEST_REPOSITORY)
    private readonly requests: BookingRequestRepository,
    @Inject(BOOKING_OFFER_REPOSITORY)
    private readonly offers: BookingOfferRepository,
  ) {}

  async execute({ id, userId }: { id: string; userId: string }): Promise<void> {
    const request = await findOwnedRequest(this.requests, id, userId);

    const withdrawn = await withdrawPendingOffer(this.offers, request);
    if (!withdrawn) throw new BookingOfferUnavailableError();
  }
}

export async function withdrawPendingOffer(
  offers: BookingOfferRepository,
  request: BookingRequestEntity,
): Promise<boolean> {
  const pending = await offers.findPending(request.id);
  if (!pending) return false;

  const message = BookingRequestMessageEntity.system(request.id, offerWithdrawnMessage());

  await offers.save({
    offers: [pending.withdraw()],
    request: request.receiveMessage(message),
    message,
    guard: pendingOfferGuard(pending.id),
  });

  return true;
}

export function pendingOfferGuard(offerId: string): NonNullable<SaveOffersParams['guard']> {
  return {
    offerId,
    assert: ({ offerPending, offerBooked }) => {
      if (offerBooked) throw new OfferPaymentInProgressError();
      if (!offerPending) throw new BookingOfferUnavailableError();
    },
  };
}
