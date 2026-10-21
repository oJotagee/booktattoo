import { Inject, Injectable } from '@nestjs/common';

import { resolveConversation } from '../booking-request/find-client-conversation.use-case';
import { ARTIST_GATEWAY, type ArtistGateway } from '../../port/artist-gateway.port';
import { BOOKING_LINK, type BookingLink } from '../../port/booking-link.port';
import { DepositBookingService } from '../../services/deposit-booking.service';
import {
  BOOKING_OFFER_REPOSITORY,
  type BookingOfferRepository,
} from '../../port/booking-offer-repository.port';
import {
  BOOKING_REQUEST_REPOSITORY,
  type BookingRequestRepository,
} from '../../port/booking-request-repository.port';
import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { ArtistUnavailableError, SlotInThePastError } from '@/domain/errors/appointment.error';
import {
  BookingOfferUnavailableError,
  BookingRequestClosedError,
} from '@/domain/errors/booking-request.error';
import { toSlotTime, toStudioDate } from '@/domain/schedule';

const BOOKABLE_ARTIST_STATUS = 'ACTIVE';

@Injectable()
export class PayBookingOfferUseCase {
  constructor(
    @Inject(BOOKING_REQUEST_REPOSITORY)
    private readonly requests: BookingRequestRepository,
    @Inject(BOOKING_OFFER_REPOSITORY)
    private readonly offers: BookingOfferRepository,
    @Inject(BOOKING_LINK)
    private readonly links: BookingLink,
    @Inject(ARTIST_GATEWAY)
    private readonly artists: ArtistGateway,
    private readonly booking: DepositBookingService,
  ) {}

  async execute({ token }: { token: string }): Promise<{ checkoutUrl: string }> {
    const request = await resolveConversation(this.links, this.requests, token);
    if (!request.isOpen) throw new BookingRequestClosedError();

    const offer = await this.offers.findPending(request.id);
    if (!offer) throw new BookingOfferUnavailableError();

    const artist = await this.artists.findById(request.userId);
    if (!artist || artist.status !== BOOKABLE_ARTIST_STATUS || !artist.paymentsEnabled) {
      throw new ArtistUnavailableError();
    }
    if (offer.scheduledAt.getTime() <= Date.now()) throw new SlotInThePastError();

    const date = toStudioDate(offer.scheduledAt);
    const appointment = AppointmentEntity.create({
      id: crypto.randomUUID(),
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      clientPhone: request.clientPhone,
      scheduledAt: offer.scheduledAt,
      duration: offer.duration,
      price: offer.price,
      depositAmount: offer.depositAmount,
      userId: request.userId,
      serviceId: null,
      galeryId: null,
      galeryTitle: offer.title,
      galeryImageUrl: null,
      bookingRequestId: request.id,
      bookingOfferId: offer.id,
    });

    return this.booking.reserve({
      appointment,
      artistTimes: artist.times,
      date,
      time: toSlotTime(offer.scheduledAt, date),
      checkout: {
        title: offer.title,
        imageUrl: null,
        returnPath: `/pedido/${token}`,
      },
    });
  }
}
