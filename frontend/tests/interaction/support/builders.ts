import type { Galery } from '@/app/(panel)/dashboard/galery/_data-access/get-all-galeries';
import type { Reminder } from '@/app/(panel)/dashboard/_data-access/get-all-reminders';
import type { Service } from '@/app/(panel)/dashboard/services/_data-access/get-all-services';

export function buildGalery(overrides: Partial<Galery> = {}): Galery {
  return {
    id: 'galery-1',
    title: 'Rosa Tradicional',
    imageUrl: 'https://bookink-assets.s3.us-east-2.amazonaws.com/gallery/rosa.png',
    size: '10x15cm',
    price: 28000,
    style: 'TRADICIONAL',
    available: true,
    userId: 'user-1',
    serviceId: 'service-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function buildService(overrides: Partial<Service> = {}): Service {
  return {
    id: 'service-1',
    name: 'Flash pequeno',
    duration: 60,
    depositAmount: 5000,
    status: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function buildReminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: 'reminder-1',
    description: 'Enviar confirmação para Mariana (09:00)',
    userId: 'user-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}
