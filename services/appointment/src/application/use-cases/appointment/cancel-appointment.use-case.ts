import { createEventEnvelope, EVENT_PUBLISHER, type EventPublisher } from '@bookink/shared/events';
import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import type { AppointmentRepository } from '../../port/appointment-repository.port';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { APPOINTMENT_REPOSITORY } from '../../port/appointment-repository.port';
import { blockedTimesCacheNamespace } from '@/application/cache/public-cache';
import { AppointmentNotFoundError } from '@/domain/errors/appointment.error';

@Injectable()
export class CancelAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointments: AppointmentRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({ id, userId }: { id: string; userId: string }): Promise<void> {
    const appointment = await this.appointments.findById(id);
    if (!appointment) throw new AppointmentNotFoundError(id);

    if (appointment.userId !== userId) throw new ForbiddenResourceAccessError();

    await this.appointments.update(appointment.cancel());
    await this.cache.invalidate(blockedTimesCacheNamespace(appointment.userId));

    await this.publisher.publish(
      createEventEnvelope(
        'appointment.cancelled',
        {
          appointmentId: appointment.id,
          artistId: appointment.userId,
          galeryId: appointment.galeryId,
        },
        { correlationId: appointment.id },
      ),
    );
  }
}
