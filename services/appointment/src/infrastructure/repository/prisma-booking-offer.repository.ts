import { Injectable } from '@nestjs/common';

import { BookingRequestMapper } from '../persistence/booking-request.mapper';
import { BookingOfferMapper } from '../persistence/booking-offer.mapper';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACTIVE_APPOINTMENT_STATUSES,
  AppointmentStatus,
} from '@/domain/entities/appointment.entity';
import {
  type BookingOfferEntity,
  BookingOfferStatus,
} from '@/domain/entities/booking-offer.entity';
import type {
  BookingOfferRepository,
  SaveOffersParams,
} from '@/application/port/booking-offer-repository.port';

@Injectable()
export class PrismaBookingOfferRepository implements BookingOfferRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<BookingOfferEntity | null> {
    const offer = await this.prisma.bookingOffer.findUnique({ where: { id } });

    return offer ? BookingOfferMapper.toDomain(offer) : null;
  }

  async findPending(bookingRequestId: string): Promise<BookingOfferEntity | null> {
    const offer = await this.prisma.bookingOffer.findFirst({
      where: { bookingRequestId, status: BookingOfferStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });

    return offer ? BookingOfferMapper.toDomain(offer) : null;
  }

  async findCurrent(bookingRequestId: string): Promise<BookingOfferEntity | null> {
    const offer = await this.prisma.bookingOffer.findFirst({
      where: { bookingRequestId, status: { not: BookingOfferStatus.WITHDRAWN } },
      orderBy: { createdAt: 'desc' },
    });

    return offer ? BookingOfferMapper.toDomain(offer) : null;
  }

  async hasPaymentInProgress(offerId: string): Promise<boolean> {
    const pending = await this.prisma.appointment.count({
      where: { bookingOfferId: offerId, status: AppointmentStatus.PENDING },
    });

    return pending > 0;
  }

  async save({ offers, request, message, guard }: SaveOffersParams): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${request.userId}))`;

      if (guard) {
        const [offer, booked] = await Promise.all([
          tx.bookingOffer.findUnique({ where: { id: guard.offerId }, select: { status: true } }),
          tx.appointment.count({
            where: { bookingOfferId: guard.offerId, status: { in: ACTIVE_APPOINTMENT_STATUSES } },
          }),
        ]);

        guard.assert({
          offerPending: offer?.status === BookingOfferStatus.PENDING,
          offerBooked: booked > 0,
        });
      }

      for (const offer of offers) {
        const data = BookingOfferMapper.toPersistence(offer);

        await tx.bookingOffer.upsert({ where: { id: offer.id }, create: data, update: data });
      }

      await tx.bookingRequestMessage.create({
        data: BookingRequestMapper.messageToPersistence(message),
      });
      await tx.bookingRequest.update({
        where: { id: request.id },
        data: { lastMessageAt: request.lastMessageAt, updatedAt: request.updatedAt },
      });
    });
  }
}
