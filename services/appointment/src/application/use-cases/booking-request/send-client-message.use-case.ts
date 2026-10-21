import { Inject, Injectable } from '@nestjs/common';

import { type MessageOutput, toMessageOutput } from './booking-request.output';
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
  BookingRequestMessageEntity,
  MessageAuthor,
} from '@/domain/entities/booking-request.entity';
import {
  BookingRequestClosedError,
  ClientMessageLimitError,
} from '@/domain/errors/booking-request.error';
import { resolveConversation } from './find-client-conversation.use-case';

export const MAX_UNANSWERED_CLIENT_MESSAGES = 5;

@Injectable()
export class SendClientMessageUseCase {
  constructor(
    @Inject(BOOKING_REQUEST_REPOSITORY)
    private readonly requests: BookingRequestRepository,
    @Inject(BOOKING_LINK)
    private readonly links: BookingLink,
    @Inject(BOOKING_REQUEST_NOTIFIER)
    private readonly notifier: BookingRequestNotifier,
  ) {}

  async execute({ token, body }: { token: string; body: string }): Promise<MessageOutput> {
    const request = await resolveConversation(this.links, this.requests, token);
    if (!request.isOpen) throw new BookingRequestClosedError();

    const history = await this.requests.findMessages(request.id);
    if (unansweredClientMessages(history) >= MAX_UNANSWERED_CLIENT_MESSAGES) {
      throw new ClientMessageLimitError();
    }

    const message = BookingRequestMessageEntity.create({
      id: crypto.randomUUID(),
      bookingRequestId: request.id,
      author: MessageAuthor.CLIENT,
      body,
    });
    const updated = request.receiveMessage(message);

    await this.requests.addMessage(updated, message);
    await this.notifier.clientReplied(updated, message);

    return toMessageOutput(message);
  }
}

function unansweredClientMessages(history: BookingRequestMessageEntity[]): number {
  let count = 0;

  for (let index = history.length - 1; index >= 0; index--) {
    if (history[index].author !== MessageAuthor.CLIENT) break;
    count++;
  }

  return count;
}
