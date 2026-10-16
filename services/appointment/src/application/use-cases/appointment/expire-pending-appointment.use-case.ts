import { createEventEnvelope, EVENT_PUBLISHER, type EventPublisher } from '@bookink/shared/events';
import { Inject, Injectable } from '@nestjs/common';

import type { AppointmentRepository } from '../../port/appointment-repository.port';
import { APPOINTMENT_REPOSITORY } from '../../port/appointment-repository.port';

@Injectable()
export class ExpirePendingAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointments: AppointmentRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
  ) {}

  async execute({ appointmentId }: { appointmentId: string }): Promise<void> {
    const appointment = await this.appointments.findById(appointmentId);

    if (!appointment?.isPending) return;

    await this.appointments.update(appointment.cancel());

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
