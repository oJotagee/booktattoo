import { Inject, Injectable } from '@nestjs/common';

import { FindBlockedTimesUseCase } from '../appointment/find-blocked-times.use-case';
import { findOwnedRequest } from '../booking-request/find-artist-booking-request.use-case';
import { type OfferOutput, currentOfferOutput } from '../booking-request/booking-request.output';
import { ARTIST_GATEWAY, type ArtistGateway } from '../../port/artist-gateway.port';
import {
  BOOKING_OFFER_REPOSITORY,
  type BookingOfferRepository,
} from '../../port/booking-offer-repository.port';
import {
  BOOKING_REQUEST_NOTIFIER,
  type BookingRequestNotifier,
} from '../../port/booking-request-notifier.port';
import {
  BOOKING_REQUEST_REPOSITORY,
  type BookingRequestRepository,
} from '../../port/booking-request-repository.port';
import { BookingOfferEntity } from '@/domain/entities/booking-offer.entity';
import { BookingRequestMessageEntity } from '@/domain/entities/booking-request.entity';
import {
  ArtistUnavailableError,
  InvalidAppointmentError,
  SlotInThePastError,
  SlotUnavailableError,
} from '@/domain/errors/appointment.error';
import { BookingRequestClosedError } from '@/domain/errors/booking-request.error';
import { pendingOfferGuard } from './withdraw-booking-offer.use-case';
import {
  isSlotSequenceAvailable,
  isValidDate,
  requiredSlots,
  toScheduledAt,
} from '@/domain/schedule';
import { offerSentMessage } from './offer-messages';

const BOOKABLE_ARTIST_STATUS = 'ACTIVE';

type CreateBookingOfferInput = {
  id: string;
  userId: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  depositAmount: number;
};

@Injectable()
export class CreateBookingOfferUseCase {
  constructor(
    @Inject(BOOKING_REQUEST_REPOSITORY)
    private readonly requests: BookingRequestRepository,
    @Inject(BOOKING_OFFER_REPOSITORY)
    private readonly offers: BookingOfferRepository,
    @Inject(ARTIST_GATEWAY)
    private readonly artists: ArtistGateway,
    @Inject(BOOKING_REQUEST_NOTIFIER)
    private readonly notifier: BookingRequestNotifier,
    private readonly findBlockedTimes: FindBlockedTimesUseCase,
  ) {}

  async execute(input: CreateBookingOfferInput): Promise<OfferOutput> {
    const request = await findOwnedRequest(this.requests, input.id, input.userId);
    if (!request.isOpen) throw new BookingRequestClosedError();

    const artist = await this.artists.findById(request.userId);
    if (!artist || artist.status !== BOOKABLE_ARTIST_STATUS || !artist.paymentsEnabled) {
      throw new ArtistUnavailableError();
    }

    if (!isValidDate(input.date)) throw new InvalidAppointmentError('Data inválida.');
    if (!artist.times.includes(input.time)) throw new SlotUnavailableError();

    const scheduledAt = toScheduledAt(input.date, input.time);
    if (scheduledAt.getTime() <= Date.now()) throw new SlotInThePastError();

    const offer = BookingOfferEntity.create({
      id: crypto.randomUUID(),
      bookingRequestId: request.id,
      title: input.title,
      scheduledAt,
      duration: input.duration,
      price: input.price,
      depositAmount: input.depositAmount,
    });

    const blocked = await this.findBlockedTimes.execute({ artistId: artist.id, date: input.date });
    if (
      !isSlotSequenceAvailable(input.time, requiredSlots(offer.duration), artist.times, blocked)
    ) {
      throw new SlotUnavailableError();
    }

    const previous = await this.offers.findPending(request.id);
    const message = BookingRequestMessageEntity.system(request.id, offerSentMessage(offer));

    await this.offers.save({
      offers: previous ? [previous.withdraw(), offer] : [offer],
      request: request.receiveMessage(message),
      message,
      guard: previous ? pendingOfferGuard(previous.id) : undefined,
    });
    await this.notifier.offerSent(request, offer);

    return (await currentOfferOutput(this.offers, request.id)) as OfferOutput;
  }
}
