import { createEventEnvelope, EVENT_PUBLISHER, type EventPublisher } from '@bookink/shared/events';
import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import { CATALOG_GATEWAY, type CatalogGateway } from '../../port/catalog-gateway.port';
import { ARTIST_GATEWAY, type ArtistGateway } from '../../port/artist-gateway.port';
import { APPOINTMENT_REPOSITORY } from '../../port/appointment-repository.port';
import { blockedTimesCacheNamespace } from '@/application/cache/public-cache';
import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import type {
  AppointmentRepository,
  AvailabilityContext,
} from '../../port/appointment-repository.port';
import { DEPOSIT_GATEWAY, type DepositGateway } from '../../port/deposit-gateway.port';
import {
  ArtistUnavailableError,
  GaleryUnavailableError,
  InvalidAppointmentError,
  PendingAppointmentLimitError,
  SlotInThePastError,
  SlotUnavailableError,
} from '@/domain/errors/appointment.error';
import {
  buildBlockedTimes,
  dayRange,
  isSlotSequenceAvailable,
  isValidDate,
  requiredSlots,
  toScheduledAt,
  toSlotTime,
} from '@/domain/schedule';

const BOOKABLE_ARTIST_STATUS = 'ACTIVE';

type CreatePublicAppointmentInput = {
  artistId: string;
  galeryId: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
};

type CreatePublicAppointmentOutput = {
  appointmentId: string;
  checkoutUrl: string;
};

@Injectable()
export class CreatePublicAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointments: AppointmentRepository,
    @Inject(ARTIST_GATEWAY)
    private readonly artists: ArtistGateway,
    @Inject(CATALOG_GATEWAY)
    private readonly catalog: CatalogGateway,
    @Inject(DEPOSIT_GATEWAY)
    private readonly checkout: DepositGateway,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute(input: CreatePublicAppointmentInput): Promise<CreatePublicAppointmentOutput> {
    const { artistId, galeryId, date, time } = input;

    if (!isValidDate(date)) throw new InvalidAppointmentError('Data inválida.');

    const [artist, galery] = await Promise.all([
      this.artists.findById(artistId),
      this.catalog.findGaleryById(galeryId),
    ]);

    if (!artist || artist.status !== BOOKABLE_ARTIST_STATUS || !artist.paymentsEnabled) {
      throw new ArtistUnavailableError();
    }
    if (!galery || galery.userId !== artist.id || !galery.available) {
      throw new GaleryUnavailableError();
    }
    if (!artist.times.includes(time)) throw new SlotUnavailableError();

    const scheduledAt = toScheduledAt(date, time);
    if (scheduledAt.getTime() <= Date.now()) throw new SlotInThePastError();

    const appointment = AppointmentEntity.create({
      id: crypto.randomUUID(),
      clientName: input.name,
      clientEmail: input.email,
      clientPhone: input.phone,
      scheduledAt,
      duration: galery.service.duration,
      price: galery.price,
      depositAmount: Math.min(galery.service.depositAmount, galery.price),
      userId: artist.id,
      serviceId: galery.serviceId,
      galeryId: galery.id,
      galeryTitle: galery.title,
      galeryImageUrl: galery.imageUrl,
    });

    await this.appointments.createExclusive({
      appointment,
      day: dayRange(date),
      assertAvailable: ({ sameDay, galeryTaken, clientHasPending }: AvailabilityContext) => {
        if (clientHasPending) throw new PendingAppointmentLimitError();
        if (galeryTaken) throw new GaleryUnavailableError();

        const blocked = buildBlockedTimes(
          sameDay.map((existing) => ({
            time: toSlotTime(existing.scheduledAt, date),
            duration: existing.duration,
          })),
          artist.times,
        );

        if (
          !isSlotSequenceAvailable(time, requiredSlots(appointment.duration), artist.times, blocked)
        ) {
          throw new SlotUnavailableError();
        }
      },
    });
    await this.cache.invalidate(blockedTimesCacheNamespace(artist.id));

    let checkout: Awaited<ReturnType<DepositGateway['create']>>;
    try {
      checkout = await this.checkout.create({
        appointmentId: appointment.id,
        artistId: artist.id,
        amount: appointment.depositAmount,
        title: galery.title,
        imageUrl: galery.imageUrl,
        customerEmail: appointment.clientEmail,
      });
    } catch (error) {
      // Sem checkout o horário não pode ficar preso esperando um pagamento que nunca vem
      await this.appointments.update(appointment.cancel());
      await this.cache.invalidate(blockedTimesCacheNamespace(artist.id));
      throw error;
    }

    await this.appointments.update(appointment.attachCheckout(checkout.checkoutSessionId));

    await this.publisher.publish(
      createEventEnvelope(
        'appointment.created',
        { appointmentId: appointment.id, artistId: artist.id, galeryId: galery.id },
        { correlationId: appointment.id },
      ),
    );

    return { appointmentId: appointment.id, checkoutUrl: checkout.url };
  }
}
