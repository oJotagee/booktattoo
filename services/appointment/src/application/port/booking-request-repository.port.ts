import type {
  BookingRequestEntity,
  BookingRequestMessageEntity,
  BookingRequestStatus,
} from '@/domain/entities/booking-request.entity';

export const BOOKING_REQUEST_REPOSITORY = Symbol('BOOKING_REQUEST_REPOSITORY');

export type FindBookingRequestsByUserParams = {
  userId: string;
  status: BookingRequestStatus;
  limit: number;
  offset: number;
};

export type BookingRequestSummary = {
  request: BookingRequestEntity;
  lastMessage: BookingRequestMessageEntity | null;
};

export type OpenRequestContext = {
  clientHasOpenRequest: boolean;
};

export type CreateWithFirstMessageParams = {
  request: BookingRequestEntity;
  message: BookingRequestMessageEntity;
  assertCanOpen: (context: OpenRequestContext) => void;
};

export interface BookingRequestRepository {
  findById(id: string): Promise<BookingRequestEntity | null>;
  findByUser(
    params: FindBookingRequestsByUserParams,
  ): Promise<{ items: BookingRequestSummary[]; total: number }>;
  findMessages(bookingRequestId: string): Promise<BookingRequestMessageEntity[]>;
  createWithFirstMessage(params: CreateWithFirstMessageParams): Promise<void>;
  addMessage(request: BookingRequestEntity, message: BookingRequestMessageEntity): Promise<void>;
  update(request: BookingRequestEntity): Promise<void>;
}
