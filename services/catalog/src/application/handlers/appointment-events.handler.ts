import type { AppointmentEvent } from '@bookink/shared/events';
import { Injectable } from '@nestjs/common';

import { SetGaleryAvailabilityUseCase } from '../use-cases/galery/set-galery-availability.use-case';

@Injectable()
export class AppointmentEventsHandler {
  constructor(private readonly setGaleryAvailability: SetGaleryAvailabilityUseCase) {}

  async handle({ type, payload }: AppointmentEvent): Promise<void> {
    if (!payload.galeryId) return;

    switch (type) {
      case 'appointment.created':
        return this.setGaleryAvailability.execute({ galeryId: payload.galeryId, available: false });
      case 'appointment.cancelled':
        return this.setGaleryAvailability.execute({ galeryId: payload.galeryId, available: true });
    }
  }
}
