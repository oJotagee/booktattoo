import { Inject, Injectable } from '@nestjs/common';

import { type MessageOutput, toMessageOutput } from './booking-request.output';
import { findOwnedRequest } from './find-artist-booking-request.use-case';
import {
  BOOKING_REQUEST_NOTIFIER,
  type BookingRequestNotifier,
} from '../../port/booking-request-notifier.port';
import {
  BOOKING_REQUEST_REPOSITORY,
  type BookingRequestRepository,
} from '../../port/booking-request-repository.port';
import {
  BookingRequestMessageEntity,
  MessageAuthor,
} from '@/domain/entities/booking-request.entity';

type SendArtistMessageInput = {
  id: string;
  userId: string;
  body: string;
};

@Injectable()
export class SendArtistMessageUseCase {
  constructor(
    @Inject(BOOKING_REQUEST_REPOSITORY)
    private readonly requests: BookingRequestRepository,
    @Inject(BOOKING_REQUEST_NOTIFIER)
    private readonly notifier: BookingRequestNotifier,
  ) {}

  async execute({ id, userId, body }: SendArtistMessageInput): Promise<MessageOutput> {
    const request = await findOwnedRequest(this.requests, id, userId);

    const message = BookingRequestMessageEntity.create({
      id: crypto.randomUUID(),
      bookingRequestId: request.id,
      author: MessageAuthor.ARTIST,
      body,
    });
    const updated = request.receiveMessage(message);

    await this.requests.addMessage(updated, message);
    await this.notifier.artistReplied(updated, message);

    return toMessageOutput(message);
  }
}
