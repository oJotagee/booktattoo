import type { EventEnvelope } from '../event-envelope';

export type AppointmentChangedPayload = {
  appointmentId: string;
  artistId: string;
  galeryId: string | null;
};

export type AppointmentCreated = EventEnvelope<'appointment.created', AppointmentChangedPayload>;

export type AppointmentCancelled = EventEnvelope<
  'appointment.cancelled',
  AppointmentChangedPayload
>;

export type AppointmentEvent = AppointmentCreated | AppointmentCancelled;

export type AppointmentEventType = AppointmentEvent['type'];
