import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { ReminderEntity } from '@/domain/entities/reminder.entity';
import { BookingOfferEntity } from '@/domain/entities/booking-offer.entity';
import {
  BookingRequestEntity,
  BookingRequestMessageEntity,
  MessageAuthor,
} from '@/domain/entities/booking-request.entity';

export function buildBookingRequest(
  overrides: Partial<{ id: string; userId: string; clientName: string }> = {},
): BookingRequestEntity {
  return BookingRequestEntity.create({
    id: overrides.id ?? 'request-1',
    clientName: overrides.clientName ?? 'Mariana Costa',
    clientEmail: 'Mariana@Email.com',
    clientPhone: '(11) 99999-9999',
    userId: overrides.userId ?? 'user-1',
  });
}

export function buildOffer(
  overrides: Partial<{
    id: string;
    scheduledAt: Date;
    duration: number;
    price: number;
    depositAmount: number;
  }> = {},
): BookingOfferEntity {
  return BookingOfferEntity.create({
    id: overrides.id ?? 'offer-1',
    bookingRequestId: 'request-1',
    title: 'Rosa fineline no antebraço',
    scheduledAt: overrides.scheduledAt ?? new Date('2030-01-15T12:00:00.000Z'),
    duration: overrides.duration ?? 60,
    price: overrides.price ?? 60000,
    depositAmount: overrides.depositAmount ?? 15000,
  });
}

export function buildMessage(
  overrides: Partial<{ id: string; author: MessageAuthor; body: string }> = {},
): BookingRequestMessageEntity {
  return BookingRequestMessageEntity.create({
    id: overrides.id ?? 'message-1',
    bookingRequestId: 'request-1',
    author: overrides.author ?? MessageAuthor.CLIENT,
    body: overrides.body ?? 'Quero uma rosa fineline no antebraço.',
  });
}

export function buildReminder(
  overrides: Partial<{
    id: string;
    description: string;
    userId: string;
  }> = {},
): ReminderEntity {
  return ReminderEntity.create({
    id: overrides.id ?? 'reminder-1',
    description: overrides.description ?? 'Comprar agulhas 3RL',
    userId: overrides.userId ?? 'user-1',
  });
}

export function buildAppointment(
  overrides: Partial<{
    id: string;
    userId: string;
    scheduledAt: Date;
    duration: number;
    price: number;
    depositAmount: number;
    galeryId: string | null;
    clientName: string;
  }> = {},
): AppointmentEntity {
  return AppointmentEntity.create({
    id: overrides.id ?? 'appointment-1',
    clientName: overrides.clientName ?? 'Mariana Costa',
    clientEmail: 'mariana@email.com',
    clientPhone: '(11) 99999-9999',
    scheduledAt: overrides.scheduledAt ?? new Date('2026-10-20T13:00:00.000Z'),
    duration: overrides.duration ?? 60,
    price: overrides.price ?? 28000,
    depositAmount: overrides.depositAmount ?? 8000,
    userId: overrides.userId ?? 'user-1',
    serviceId: 'service-1',
    galeryId: overrides.galeryId === undefined ? 'galery-1' : overrides.galeryId,
    galeryTitle: 'Rosa Tradicional',
    galeryImageUrl: 'https://bucket/gallery/rosa.png',
  });
}
