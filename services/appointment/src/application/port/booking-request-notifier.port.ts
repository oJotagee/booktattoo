import type { BookingOfferEntity } from '@/domain/entities/booking-offer.entity';
import type {
  BookingRequestEntity,
  BookingRequestMessageEntity,
} from '@/domain/entities/booking-request.entity';

export const BOOKING_REQUEST_NOTIFIER = Symbol('BOOKING_REQUEST_NOTIFIER');

export interface BookingRequestNotifier {
  opened(request: BookingRequestEntity, message: BookingRequestMessageEntity): Promise<void>;
  clientReplied(request: BookingRequestEntity, message: BookingRequestMessageEntity): Promise<void>;
  artistReplied(request: BookingRequestEntity, message: BookingRequestMessageEntity): Promise<void>;
  offerSent(request: BookingRequestEntity, offer: BookingOfferEntity): Promise<void>;
}
