import type { BookingOfferEntity } from '@/domain/entities/booking-offer.entity';
import type {
  BookingRequestEntity,
  BookingRequestMessageEntity,
} from '@/domain/entities/booking-request.entity';

export const BOOKING_OFFER_REPOSITORY = Symbol('BOOKING_OFFER_REPOSITORY');

export type OfferGuardContext = {
  offerPending: boolean;
  offerBooked: boolean;
};

export type SaveOffersParams = {
  offers: BookingOfferEntity[];
  request: BookingRequestEntity;
  message: BookingRequestMessageEntity;
  guard?: {
    offerId: string;
    assert: (context: OfferGuardContext) => void;
  };
};

export interface BookingOfferRepository {
  findById(id: string): Promise<BookingOfferEntity | null>;
  findPending(bookingRequestId: string): Promise<BookingOfferEntity | null>;
  findCurrent(bookingRequestId: string): Promise<BookingOfferEntity | null>;
  hasPaymentInProgress(offerId: string): Promise<boolean>;
  save(params: SaveOffersParams): Promise<void>;
}
