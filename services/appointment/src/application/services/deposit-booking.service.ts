import { createEventEnvelope, EVENT_PUBLISHER, type EventPublisher } from '@bookink/shared/events';
import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import { BookingOfferUnavailableError } from '@/domain/errors/booking-request.error';
import { DEPOSIT_GATEWAY, type DepositGateway } from '../port/deposit-gateway.port';
import type { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { blockedTimesCacheNamespace } from '../cache/public-cache';
import {
  APPOINTMENT_REPOSITORY,
  type AppointmentRepository,
  type AvailabilityContext,
} from '../port/appointment-repository.port';
import {
  GaleryUnavailableError,
  PendingAppointmentLimitError,
  SlotUnavailableError,
} from '@/domain/errors/appointment.error';
import {
  buildBlockedTimes,
  dayRange,
  isSlotSequenceAvailable,
  requiredSlots,
  toSlotTime,
} from '@/domain/schedule';

type ReserveWithDepositParams = {
  appointment: AppointmentEntity;
  artistTimes: string[];
  date: string;
  time: string;
  checkout: {
    title: string;
    imageUrl: string | null;
    returnPath?: string;
  };
};

@Injectable()
export class DepositBookingService {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointments: AppointmentRepository,
    @Inject(DEPOSIT_GATEWAY)
    private readonly deposits: DepositGateway,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async reserve({
    appointment,
    artistTimes,
    date,
    time,
    checkout,
  }: ReserveWithDepositParams): Promise<{ checkoutUrl: string }> {
    await this.appointments.createExclusive({
      appointment,
      day: dayRange(date),
      assertAvailable: ({
        sameDay,
        galeryTaken,
        clientHasPending,
        offerAvailable,
      }: AvailabilityContext) => {
        if (!offerAvailable) throw new BookingOfferUnavailableError();
        if (clientHasPending) throw new PendingAppointmentLimitError();
        if (galeryTaken) throw new GaleryUnavailableError();

        const blocked = buildBlockedTimes(
          sameDay.map((existing) => ({
            time: toSlotTime(existing.scheduledAt, date),
            duration: existing.duration,
          })),
          artistTimes,
        );

        if (
          !isSlotSequenceAvailable(time, requiredSlots(appointment.duration), artistTimes, blocked)
        ) {
          throw new SlotUnavailableError();
        }
      },
    });
    await this.cache.invalidate(blockedTimesCacheNamespace(appointment.userId));

    let session: Awaited<ReturnType<DepositGateway['create']>>;
    try {
      session = await this.deposits.create({
        appointmentId: appointment.id,
        artistId: appointment.userId,
        amount: appointment.depositAmount,
        title: checkout.title,
        imageUrl: checkout.imageUrl,
        customerEmail: appointment.clientEmail,
        returnPath: checkout.returnPath,
      });
    } catch (error) {
      // Sem checkout o horário não pode ficar preso esperando um pagamento que nunca vem
      await this.appointments.update(appointment.cancel());
      await this.cache.invalidate(blockedTimesCacheNamespace(appointment.userId));
      throw error;
    }

    await this.appointments.update(appointment.attachCheckout(session.checkoutSessionId));

    await this.publisher.publish(
      createEventEnvelope(
        'appointment.created',
        {
          appointmentId: appointment.id,
          artistId: appointment.userId,
          galeryId: appointment.galeryId,
        },
        { correlationId: appointment.id },
      ),
    );

    return { checkoutUrl: session.url };
  }
}
