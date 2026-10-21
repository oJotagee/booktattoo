import { Inject, Injectable } from '@nestjs/common';

import { withdrawPendingOffer } from '../booking-offer/withdraw-booking-offer.use-case';
import { findOwnedRequest } from './find-artist-booking-request.use-case';
import {
  BOOKING_OFFER_REPOSITORY,
  type BookingOfferRepository,
} from '../../port/booking-offer-repository.port';
import {
  BOOKING_REQUEST_REPOSITORY,
  type BookingRequestRepository,
} from '../../port/booking-request-repository.port';
import { BookingRequestClosedError } from '@/domain/errors/booking-request.error';

@Injectable()
export class CloseBookingRequestUseCase {
  constructor(
    @Inject(BOOKING_REQUEST_REPOSITORY)
    private readonly requests: BookingRequestRepository,
    @Inject(BOOKING_OFFER_REPOSITORY)
    private readonly offers: BookingOfferRepository,
  ) {}

  async execute({ id, userId }: { id: string; userId: string }): Promise<void> {
    const request = await findOwnedRequest(this.requests, id, userId);
    if (!request.isOpen) throw new BookingRequestClosedError();

    await withdrawPendingOffer(this.offers, request);

    const current = (await this.requests.findById(request.id)) ?? request;
    await this.requests.update(current.close());
  }
}
