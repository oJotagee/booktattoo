import { Inject, Injectable } from '@nestjs/common';

import { ARTIST_GATEWAY, type ArtistGateway } from '../../port/artist-gateway.port';
import { BookingRequestNotFoundError } from '@/domain/errors/booking-request.error';
import {
  type MessageOutput,
  type OfferOutput,
  currentOfferOutput,
  toMessageOutput,
} from './booking-request.output';
import {
  BOOKING_OFFER_REPOSITORY,
  type BookingOfferRepository,
} from '../../port/booking-offer-repository.port';
import { BOOKING_LINK, type BookingLink } from '../../port/booking-link.port';
import {
  BOOKING_REQUEST_REPOSITORY,
  type BookingRequestRepository,
} from '../../port/booking-request-repository.port';
import type {
  BookingRequestEntity,
  BookingRequestStatus,
} from '@/domain/entities/booking-request.entity';

const FALLBACK_ARTIST_NAME = 'Tatuador';

type ClientConversationOutput = {
  id: string;
  status: BookingRequestStatus;
  clientName: string;
  artistId: string;
  artistName: string;
  closedAt: Date | null;
  createdAt: Date;
  messages: MessageOutput[];
  offer: OfferOutput | null;
};

@Injectable()
export class FindClientConversationUseCase {
  constructor(
    @Inject(BOOKING_REQUEST_REPOSITORY)
    private readonly requests: BookingRequestRepository,
    @Inject(BOOKING_LINK)
    private readonly links: BookingLink,
    @Inject(ARTIST_GATEWAY)
    private readonly artists: ArtistGateway,
    @Inject(BOOKING_OFFER_REPOSITORY)
    private readonly offers: BookingOfferRepository,
  ) {}

  async execute({ token }: { token: string }): Promise<ClientConversationOutput> {
    const request = await resolveConversation(this.links, this.requests, token);

    const [messages, artist, offer] = await Promise.all([
      this.requests.findMessages(request.id),
      this.artists.findById(request.userId).catch(() => null),
      currentOfferOutput(this.offers, request.id),
    ]);

    return {
      id: request.id,
      status: request.status,
      clientName: request.clientName,
      artistId: request.userId,
      artistName: artist?.name || FALLBACK_ARTIST_NAME,
      closedAt: request.closedAt,
      createdAt: request.createdAt,
      messages: messages.map(toMessageOutput),
      offer,
    };
  }
}

export async function resolveConversation(
  links: BookingLink,
  requests: BookingRequestRepository,
  token: string,
): Promise<BookingRequestEntity> {
  const id = links.verify(token);
  const request = id ? await requests.findById(id) : null;
  if (!request) throw new BookingRequestNotFoundError();

  return request;
}
