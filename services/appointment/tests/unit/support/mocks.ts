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
import type { DepositGateway } from '@/application/port/deposit-gateway.port';
import type { AppointmentNotifier } from '@/application/port/appointment-notifier.port';
import type { AppointmentEntity } from '@/domain/entities/appointment.entity';
import type { ReminderRepository } from '@/application/port/reminder-repository.port';
import type { BookingLink } from '@/application/port/booking-link.port';
import type {
  BookingOfferRepository,
  OfferGuardContext,
  SaveOffersParams,
} from '@/application/port/booking-offer-repository.port';
import type { BookingOfferEntity } from '@/domain/entities/booking-offer.entity';
import type { BookingRequestNotifier } from '@/application/port/booking-request-notifier.port';
import type {
  BookingRequestRepository,
  BookingRequestSummary,
  CreateWithFirstMessageParams,
  OpenRequestContext,
} from '@/application/port/booking-request-repository.port';
import type {
  BookingRequestEntity,
  BookingRequestMessageEntity,
} from '@/domain/entities/booking-request.entity';

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
  context: AvailabilityContext = {
    sameDay: [],
    galeryTaken: false,
    clientHasPending: false,
    offerAvailable: true,
  },
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
    recordPayment: mock(async () => true),
  };
}

export function createArtistGatewayMock(
  artist: ArtistSnapshot | null = buildArtistSnapshot(),
): ArtistGateway {
  return {
    findById: mock(async () => artist),
    findContact: mock(async () =>
      artist ? { name: artist.name, email: 'ana@estudio.com' } : null,
    ),
  };
}

export function createBookingRequestRepositoryMock(
  context: OpenRequestContext = { clientHasOpenRequest: false },
): BookingRequestRepository & { messages: BookingRequestMessageEntity[] } {
  const repository = {
    messages: [] as BookingRequestMessageEntity[],
    findById: mock(async (): Promise<BookingRequestEntity | null> => null),
    findByUser: mock(async () => ({ items: [] as BookingRequestSummary[], total: 0 })),
    findMessages: mock(async () => repository.messages),
    createWithFirstMessage: mock(async ({ assertCanOpen }: CreateWithFirstMessageParams) =>
      assertCanOpen(context),
    ),
    addMessage: mock(async () => undefined),
    update: mock(async () => undefined),
  };

  return repository;
}

export function createBookingLinkMock(): BookingLink {
  return {
    sign: mock((id: string) => `signed.${id}`),
    verify: mock((token: string) => (token.startsWith('signed.') ? token.slice(7) : null)),
  };
}

export function createBookingRequestNotifierMock(): BookingRequestNotifier {
  return {
    opened: mock(async () => undefined),
    clientReplied: mock(async () => undefined),
    artistReplied: mock(async () => undefined),
    offerSent: mock(async () => undefined),
  };
}

export function createBookingOfferRepositoryMock(
  pending: BookingOfferEntity | null = null,
  paymentInProgress = false,
  guardContext: OfferGuardContext = { offerPending: true, offerBooked: paymentInProgress },
): BookingOfferRepository {
  return {
    findById: mock(async () => pending),
    findPending: mock(async () => pending),
    findCurrent: mock(async () => pending),
    hasPaymentInProgress: mock(async () => paymentInProgress),
    save: mock(async ({ guard }: SaveOffersParams) => guard?.assert(guardContext)),
  };
}

export function createCatalogGatewayMock(
  galery: GalerySnapshot | null = buildGalerySnapshot(),
): CatalogGateway {
  return { findGaleryById: mock(async () => galery) };
}

export function createDepositGatewayMock(): DepositGateway {
  return {
    create: mock(async () => ({
      checkoutSessionId: 'cs_1',
      url: 'https://checkout.stripe.com/deposit',
    })),
    refund: mock(async () => ({ refundId: 're_1' })),
    expireCheckout: mock(async () => undefined),
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
    paymentsEnabled: true,
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

export function createNotifierMock(): AppointmentNotifier {
  return {
    confirmed: mock(async () => undefined),
    cancelledWithRefund: mock(async () => undefined),
    latePaymentRefunded: mock(async () => undefined),
  };
}
