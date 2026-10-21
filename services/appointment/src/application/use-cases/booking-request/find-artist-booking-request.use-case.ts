import { Inject, Injectable } from '@nestjs/common';

import type { BookingRequestEntity } from '@/domain/entities/booking-request.entity';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { BookingRequestNotFoundError } from '@/domain/errors/booking-request.error';
import {
  BOOKING_REQUEST_REPOSITORY,
  type BookingRequestRepository,
} from '../../port/booking-request-repository.port';
import {
  type BookingRequestOutput,
  type MessageOutput,
  type OfferOutput,
  currentOfferOutput,
  toBookingRequestOutput,
  toMessageOutput,
} from './booking-request.output';
import {
  BOOKING_OFFER_REPOSITORY,
  type BookingOfferRepository,
} from '../../port/booking-offer-repository.port';

type ArtistBookingRequestOutput = BookingRequestOutput & {
  messages: MessageOutput[];
  offer: OfferOutput | null;
};

@Injectable()
export class FindArtistBookingRequestUseCase {
  constructor(
    @Inject(BOOKING_REQUEST_REPOSITORY)
    private readonly requests: BookingRequestRepository,
    @Inject(BOOKING_OFFER_REPOSITORY)
    private readonly offers: BookingOfferRepository,
  ) {}

  async execute({
    id,
    userId,
  }: {
    id: string;
    userId: string;
  }): Promise<ArtistBookingRequestOutput> {
    const request = await findOwnedRequest(this.requests, id, userId);
    const [messages, offer] = await Promise.all([
      this.requests.findMessages(request.id),
      currentOfferOutput(this.offers, request.id),
    ]);

    return { ...toBookingRequestOutput(request), messages: messages.map(toMessageOutput), offer };
  }
}

export async function findOwnedRequest(
  requests: BookingRequestRepository,
  id: string,
  userId: string,
): Promise<BookingRequestEntity> {
  const request = await requests.findById(id);
  if (!request) throw new BookingRequestNotFoundError();
  if (request.userId !== userId) throw new ForbiddenResourceAccessError();

  return request;
}
