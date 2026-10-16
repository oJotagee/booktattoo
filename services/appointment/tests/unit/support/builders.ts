import { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { ReminderEntity } from '@/domain/entities/reminder.entity';

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
  }> = {},
): AppointmentEntity {
  return AppointmentEntity.create({
    id: overrides.id ?? 'appointment-1',
    clientName: 'Mariana Costa',
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
