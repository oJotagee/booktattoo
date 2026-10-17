import { mock } from 'bun:test';

import type { CachePort } from '@bookink/shared/cache';
import type { EventPublisher } from '@bookink/shared/events';
import type {
  AppointmentRepository,
  AvailabilityContext,
  CreateExclusiveParams,
} from '@/application/port/appointment-repository.port';
import type { ArtistGateway, ArtistSnapshot } from '@/application/port/artist-gateway.port';
import type { CatalogGateway, GalerySnapshot } from '@/application/port/catalog-gateway.port';
import type { DepositCheckoutGateway } from '@/application/port/deposit-checkout-gateway.port';
import type { AppointmentEntity } from '@/domain/entities/appointment.entity';
import type { ReminderRepository } from '@/application/port/reminder-repository.port';

export function createReminderRepositoryMock(): ReminderRepository {
  return {
    findById: mock(async () => null),
    findByUserId: mock(async () => ({ items: [], total: 0 })),
    create: mock(async () => undefined),
    update: mock(async () => undefined),
    delete: mock(async () => undefined),
  };
}

export function createAppointmentRepositoryMock(
  context: AvailabilityContext = { sameDay: [], galeryTaken: false },
): AppointmentRepository {
  return {
    findById: mock(async (): Promise<AppointmentEntity | null> => null),
    findInRange: mock(async (): Promise<AppointmentEntity[]> => []),
    countInRange: mock(async () => 0),
    countActiveWithGalery: mock(async () => 0),
    sumDepositsPaidInRange: mock(async () => 0),
    createExclusive: mock(async ({ assertAvailable }: CreateExclusiveParams) =>
      assertAvailable(context),
    ),
    update: mock(async () => undefined),
  };
}

export function createArtistGatewayMock(
  artist: ArtistSnapshot | null = buildArtistSnapshot(),
): ArtistGateway {
  return { findById: mock(async () => artist) };
}

export function createCatalogGatewayMock(
  galery: GalerySnapshot | null = buildGalerySnapshot(),
): CatalogGateway {
  return { findGaleryById: mock(async () => galery) };
}

export function createDepositCheckoutGatewayMock(): DepositCheckoutGateway {
  return {
    create: mock(async () => ({
      checkoutSessionId: 'cs_1',
      url: 'https://checkout.stripe.com/deposit',
    })),
  };
}

export function createEventPublisherMock(): EventPublisher {
  return { publish: mock(async () => undefined) };
}

export function buildArtistSnapshot(overrides: Partial<ArtistSnapshot> = {}): ArtistSnapshot {
  return {
    id: 'user-1',
    name: 'Ana Lima',
    status: 'ACTIVE',
    times: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30'],
    ...overrides,
  };
}

export function buildGalerySnapshot(overrides: Partial<GalerySnapshot> = {}): GalerySnapshot {
  return {
    id: 'galery-1',
    title: 'Rosa Tradicional',
    imageUrl: 'https://bucket/gallery/rosa.png',
    price: 28000,
    available: true,
    userId: 'user-1',
    serviceId: 'service-1',
    service: { duration: 60, depositAmount: 8000 },
    ...overrides,
  };
}

export function createCacheMock(): CachePort {
  return {
    getOrLoad: mock((_namespace: string, _key: string, loader: () => Promise<unknown>) =>
      loader(),
    ) as CachePort['getOrLoad'],
    invalidate: mock(async () => undefined),
  };
}
