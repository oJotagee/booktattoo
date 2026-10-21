import { Inject, Injectable } from '@nestjs/common';

import { BookingRequestStatus, MessageAuthor } from '@/domain/entities/booking-request.entity';
import {
  BOOKING_REQUEST_REPOSITORY,
  type BookingRequestRepository,
} from '../../port/booking-request-repository.port';
import {
  type BookingRequestOutput,
  type MessageOutput,
  toBookingRequestOutput,
  toMessageOutput,
} from './booking-request.output';

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

type FindArtistBookingRequestsInput = {
  userId: string;
  status?: BookingRequestStatus;
  limit?: number;
  offset?: number;
};

type BookingRequestListItem = BookingRequestOutput & {
  lastMessage: MessageOutput | null;
  awaitingReply: boolean;
};

type FindArtistBookingRequestsOutput = {
  list: BookingRequestListItem[];
  pagination: { total: number; page: number; perPage: number; totalPages: number };
};

@Injectable()
export class FindArtistBookingRequestsUseCase {
  constructor(
    @Inject(BOOKING_REQUEST_REPOSITORY)
    private readonly requests: BookingRequestRepository,
  ) {}

  async execute({
    userId,
    status,
    limit,
    offset,
  }: FindArtistBookingRequestsInput): Promise<FindArtistBookingRequestsOutput> {
    const perPage = limit ?? DEFAULT_LIMIT;
    const currentOffset = offset ?? DEFAULT_OFFSET;

    const { items, total } = await this.requests.findByUser({
      userId,
      status: status ?? BookingRequestStatus.OPEN,
      limit: perPage,
      offset: currentOffset,
    });

    return {
      list: items.map(({ request, lastMessage }) => ({
        ...toBookingRequestOutput(request),
        lastMessage: lastMessage ? toMessageOutput(lastMessage) : null,
        awaitingReply: request.isOpen && lastMessage?.author === MessageAuthor.CLIENT,
      })),
      pagination: {
        total,
        page: Math.floor(currentOffset / perPage) + 1,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }
}
