import type { BookingOfferRepository } from '../../port/booking-offer-repository.port';
import type { BookingOfferStatus } from '@/domain/entities/booking-offer.entity';
import type {
  BookingRequestEntity,
  BookingRequestMessageEntity,
  BookingRequestStatus,
  MessageAuthor,
} from '@/domain/entities/booking-request.entity';

export type MessageOutput = {
  id: string;
  author: MessageAuthor;
  body: string;
  createdAt: Date;
};

export type BookingRequestOutput = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: BookingRequestStatus;
  lastMessageAt: Date;
  closedAt: Date | null;
  createdAt: Date;
};

export function toMessageOutput(message: BookingRequestMessageEntity): MessageOutput {
  return {
    id: message.id,
    author: message.author,
    body: message.body,
    createdAt: message.createdAt,
  };
}

export function toBookingRequestOutput(request: BookingRequestEntity): BookingRequestOutput {
  return {
    id: request.id,
    clientName: request.clientName,
    clientEmail: request.clientEmail,
    clientPhone: request.clientPhone,
    status: request.status,
    lastMessageAt: request.lastMessageAt,
    closedAt: request.closedAt,
    createdAt: request.createdAt,
  };
}

export type OfferOutput = {
  id: string;
  status: BookingOfferStatus;
  title: string;
  scheduledAt: Date;
  duration: number;
  price: number;
  depositAmount: number;
  paymentInProgress: boolean;
  expired: boolean;
};

export async function currentOfferOutput(
  offers: BookingOfferRepository,
  bookingRequestId: string,
): Promise<OfferOutput | null> {
  const offer = await offers.findCurrent(bookingRequestId);
  if (!offer) return null;

  return {
    id: offer.id,
    status: offer.status,
    title: offer.title,
    scheduledAt: offer.scheduledAt,
    duration: offer.duration,
    price: offer.price,
    depositAmount: offer.depositAmount,
    paymentInProgress: offer.isPending && (await offers.hasPaymentInProgress(offer.id)),
    expired: offer.isPending && offer.scheduledAt.getTime() <= Date.now(),
  };
}
