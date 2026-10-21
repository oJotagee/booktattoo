export type ParticipantAuthor = 'ARTIST' | 'CLIENT';

export type MessageAuthor = ParticipantAuthor | 'SYSTEM';

export type ConversationStatus = 'OPEN' | 'CLOSED';

export interface ConversationMessage {
  id: string;
  author: MessageAuthor;
  body: string;
  createdAt: string;
}

export type BookingOfferStatus = 'PENDING' | 'PAID' | 'WITHDRAWN' | 'CANCELLED';

export interface BookingOffer {
  id: string;
  status: BookingOfferStatus;
  title: string;
  scheduledAt: string;
  duration: number;
  price: number;
  depositAmount: number;
  paymentInProgress: boolean;
  expired: boolean;
}
