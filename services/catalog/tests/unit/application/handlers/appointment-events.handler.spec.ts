import { type AppointmentChangedPayload, createEventEnvelope } from '@bookink/shared/events';
import { describe, expect, it, mock } from 'bun:test';

import { AppointmentEventsHandler } from '@/application/handlers/appointment-events.handler';

const payload: AppointmentChangedPayload = {
  appointmentId: 'appointment-1',
  artistId: 'user-1',
  galeryId: 'galery-1',
};

describe('AppointmentEventsHandler', () => {
  it('reserves the galery when an appointment is created', async () => {
    const setAvailability = { execute: mock(async () => undefined) };
    const handler = new AppointmentEventsHandler(setAvailability as never);

    await handler.handle(createEventEnvelope('appointment.created', payload));

    expect(setAvailability.execute).toHaveBeenCalledWith({
      galeryId: 'galery-1',
      available: false,
    });
  });

  it('releases the galery when an appointment is cancelled', async () => {
    const setAvailability = { execute: mock(async () => undefined) };
    const handler = new AppointmentEventsHandler(setAvailability as never);

    await handler.handle(createEventEnvelope('appointment.cancelled', payload));

    expect(setAvailability.execute).toHaveBeenCalledWith({ galeryId: 'galery-1', available: true });
  });

  it('ignores appointments without a galery', async () => {
    const setAvailability = { execute: mock(async () => undefined) };
    const handler = new AppointmentEventsHandler(setAvailability as never);

    await handler.handle(
      createEventEnvelope('appointment.created', { ...payload, galeryId: null }),
    );

    expect(setAvailability.execute).not.toHaveBeenCalled();
  });
});
