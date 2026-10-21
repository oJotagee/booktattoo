import { Inject, Injectable } from '@nestjs/common';

import { ARTIST_GATEWAY, type ArtistGateway } from '../../port/artist-gateway.port';
import { BOOKING_LINK, type BookingLink } from '../../port/booking-link.port';
import {
  BOOKING_REQUEST_NOTIFIER,
  type BookingRequestNotifier,
} from '../../port/booking-request-notifier.port';
import {
  BOOKING_REQUEST_REPOSITORY,
  type BookingRequestRepository,
} from '../../port/booking-request-repository.port';
import {
  BookingRequestEntity,
  BookingRequestMessageEntity,
  MessageAuthor,
} from '@/domain/entities/booking-request.entity';
import {
  BookingRequestUnavailableError,
  OpenBookingRequestLimitError,
} from '@/domain/errors/booking-request.error';

const OPEN_ARTIST_STATUS = 'ACTIVE';

type CreateBookingRequestInput = {
  artistId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

@Injectable()
export class CreateBookingRequestUseCase {
  constructor(
    @Inject(BOOKING_REQUEST_REPOSITORY)
    private readonly requests: BookingRequestRepository,
    @Inject(ARTIST_GATEWAY)
    private readonly artists: ArtistGateway,
    @Inject(BOOKING_LINK)
    private readonly links: BookingLink,
    @Inject(BOOKING_REQUEST_NOTIFIER)
    private readonly notifier: BookingRequestNotifier,
  ) {}

  async execute(input: CreateBookingRequestInput): Promise<{ token: string }> {
    const artist = await this.artists.findById(input.artistId);
    if (!artist || artist.status !== OPEN_ARTIST_STATUS) {
      throw new BookingRequestUnavailableError();
    }

    const request = BookingRequestEntity.create({
      id: crypto.randomUUID(),
      clientName: input.name,
      clientEmail: input.email,
      clientPhone: input.phone,
      userId: artist.id,
    });
    const message = BookingRequestMessageEntity.create({
      id: crypto.randomUUID(),
      bookingRequestId: request.id,
      author: MessageAuthor.CLIENT,
      body: input.message,
    });

    await this.requests.createWithFirstMessage({
      request,
      message,
      assertCanOpen: ({ clientHasOpenRequest }) => {
        if (clientHasOpenRequest) throw new OpenBookingRequestLimitError();
      },
    });

    await this.notifier.opened(request, message);

    return { token: this.links.sign(request.id) };
  }
}
