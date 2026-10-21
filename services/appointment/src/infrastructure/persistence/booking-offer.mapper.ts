import type { BookingOfferModel as PrismaBookingOffer } from '@generated/prisma/models';

import {
  BookingOfferEntity,
  type BookingOfferStatus,
} from '@/domain/entities/booking-offer.entity';

export class BookingOfferMapper {
  static toDomain(offer: PrismaBookingOffer): BookingOfferEntity {
    return BookingOfferEntity.restore({
      id: offer.id,
      bookingRequestId: offer.bookingRequestId,
      title: offer.title,
      scheduledAt: offer.scheduledAt,
      duration: offer.duration,
      price: offer.price,
      depositAmount: offer.depositAmount,
      status: offer.status as BookingOfferStatus,
      appointmentId: offer.appointmentId,
      paidAt: offer.paidAt,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    });
  }

  static toPersistence(offer: BookingOfferEntity): PrismaBookingOffer {
    return {
      id: offer.id,
      bookingRequestId: offer.bookingRequestId,
      title: offer.title,
      scheduledAt: offer.scheduledAt,
      duration: offer.duration,
      price: offer.price,
      depositAmount: offer.depositAmount,
      status: offer.status,
      appointmentId: offer.appointmentId,
      paidAt: offer.paidAt,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    };
  }
}
