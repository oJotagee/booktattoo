import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { CreatePublicAppointmentUseCase } from '@/application/use-cases/appointment/create-public-appointment.use-case';
import { AppointmentStatus, type AppointmentEntity } from '@/domain/entities/appointment.entity';
import { buildAppointment } from '@tests/unit/support/builders';
import {
  ArtistUnavailableError,
  ExternalServiceUnavailableError,
  GaleryUnavailableError,
  InvalidAppointmentError,
  PendingAppointmentLimitError,
  SlotInThePastError,
  SlotUnavailableError,
} from '@/domain/errors/appointment.error';
import {
  buildArtistSnapshot,
  buildGalerySnapshot,
  createAppointmentRepositoryMock,
  createCacheMock,
  createArtistGatewayMock,
  createCatalogGatewayMock,
  createDepositCheckoutGatewayMock,
  createEventPublisherMock,
} from '@tests/unit/support/mocks';

const FUTURE_DATE = '2030-01-15';

const input = {
  artistId: 'user-1',
  galeryId: 'galery-1',
  date: FUTURE_DATE,
  time: '09:30',
  name: 'Mariana Costa',
  email: 'Mariana@Email.com',
  phone: '(11) 99999-9999',
};

describe('CreatePublicAppointmentUseCase', () => {
  let appointments: ReturnType<typeof createAppointmentRepositoryMock>;
  let artists: ReturnType<typeof createArtistGatewayMock>;
  let catalog: ReturnType<typeof createCatalogGatewayMock>;
  let checkout: ReturnType<typeof createDepositCheckoutGatewayMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let cache: ReturnType<typeof createCacheMock>;

  function buildUseCase() {
    return new CreatePublicAppointmentUseCase(
      appointments,
      artists,
      catalog,
      checkout,
      publisher,
      cache,
    );
  }

  beforeEach(() => {
    appointments = createAppointmentRepositoryMock();
    artists = createArtistGatewayMock();
    catalog = createCatalogGatewayMock();
    checkout = createDepositCheckoutGatewayMock();
    publisher = createEventPublisherMock();
    cache = createCacheMock();
  });

  it('creates a pending appointment, opens the deposit checkout and publishes the event', async () => {
    const result = await buildUseCase().execute(input);

    expect(result.checkoutUrl).toBe('https://checkout.stripe.com/deposit');

    const [{ appointment }] = (appointments.createExclusive as ReturnType<typeof mock>).mock
      .calls[0] as [{ appointment: AppointmentEntity }];
    expect(appointment.status).toBe(AppointmentStatus.PENDING);
    expect(appointment.scheduledAt).toEqual(new Date('2030-01-15T12:30:00.000Z'));
    expect(appointment.clientEmail).toBe('mariana@email.com');
    expect(appointment.clientPhone).toBe('11999999999');
    expect(appointment.price).toBe(28000);
    expect(appointment.depositAmount).toBe(8000);
    expect(appointment.duration).toBe(60);

    expect(checkout.create).toHaveBeenCalledWith({
      appointmentId: result.appointmentId,
      artistId: 'user-1',
      amount: 8000,
      title: 'Rosa Tradicional',
      imageUrl: 'https://bucket/gallery/rosa.png',
      customerEmail: 'mariana@email.com',
    });
    expect(appointments.update).toHaveBeenCalledWith(
      expect.objectContaining({ checkoutSessionId: 'cs_1' }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'appointment.created',
        payload: { appointmentId: result.appointmentId, artistId: 'user-1', galeryId: 'galery-1' },
      }),
    );
  });

  it('caps the deposit at the flash price', async () => {
    catalog = createCatalogGatewayMock(
      buildGalerySnapshot({ price: 5000, service: { duration: 60, depositAmount: 8000 } }),
    );

    await buildUseCase().execute(input);

    expect(checkout.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 5000 }));
  });

  it('rejects an invalid date', async () => {
    await expect(buildUseCase().execute({ ...input, date: '2030-02-30' })).rejects.toBeInstanceOf(
      InvalidAppointmentError,
    );
  });

  it('rejects artists that are not taking bookings', async () => {
    artists = createArtistGatewayMock(buildArtistSnapshot({ status: 'VACATION' }));

    await expect(buildUseCase().execute(input)).rejects.toBeInstanceOf(ArtistUnavailableError);
  });

  it('rejects a flash from another artist', async () => {
    catalog = createCatalogGatewayMock(buildGalerySnapshot({ userId: 'user-2' }));

    await expect(buildUseCase().execute(input)).rejects.toBeInstanceOf(GaleryUnavailableError);
  });

  it('rejects a flash that is no longer available', async () => {
    catalog = createCatalogGatewayMock(buildGalerySnapshot({ available: false }));

    await expect(buildUseCase().execute(input)).rejects.toBeInstanceOf(GaleryUnavailableError);
  });

  it('rejects a time outside the artist working hours', async () => {
    await expect(buildUseCase().execute({ ...input, time: '12:00' })).rejects.toBeInstanceOf(
      SlotUnavailableError,
    );
  });

  it('rejects a time in the past', async () => {
    await expect(buildUseCase().execute({ ...input, date: '2020-01-15' })).rejects.toBeInstanceOf(
      SlotInThePastError,
    );
  });

  it('rejects when the sequence overlaps an existing appointment', async () => {
    appointments = createAppointmentRepositoryMock({
      sameDay: [
        buildAppointment({ scheduledAt: new Date('2030-01-15T13:00:00.000Z'), duration: 30 }),
      ],
      galeryTaken: false,
      clientHasPending: false,
    });

    // 09:30 + 60min precisa de 09:30 e 10:00; 10:00 já está ocupado
    await expect(buildUseCase().execute(input)).rejects.toBeInstanceOf(SlotUnavailableError);
    expect(checkout.create).not.toHaveBeenCalled();
  });

  it('rejects a flash that already has an active appointment', async () => {
    appointments = createAppointmentRepositoryMock({
      sameDay: [],
      galeryTaken: true,
      clientHasPending: false,
    });

    await expect(buildUseCase().execute(input)).rejects.toBeInstanceOf(GaleryUnavailableError);
  });

  it('cancels the appointment when the checkout cannot be created', async () => {
    checkout.create = mock(async () => {
      throw new ExternalServiceUnavailableError();
    });

    await expect(buildUseCase().execute(input)).rejects.toBeInstanceOf(
      ExternalServiceUnavailableError,
    );
    expect(appointments.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: AppointmentStatus.CANCELLED }),
    );
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(cache.invalidate).toHaveBeenCalledTimes(2);
  });

  it('invalidates the artist blocked times once the slot is reserved', async () => {
    await buildUseCase().execute(input);

    expect(cache.invalidate).toHaveBeenCalledWith('appointment:public:blocked-times:user-1');
  });

  it('keeps the cache when the slot is not available', async () => {
    appointments = createAppointmentRepositoryMock({
      sameDay: [],
      galeryTaken: true,
      clientHasPending: false,
    });

    await expect(buildUseCase().execute(input)).rejects.toBeInstanceOf(GaleryUnavailableError);
    expect(cache.invalidate).not.toHaveBeenCalled();
  });

  it('rejects a client that already has an appointment waiting for payment', async () => {
    appointments = createAppointmentRepositoryMock({
      sameDay: [],
      galeryTaken: false,
      clientHasPending: true,
    });

    await expect(buildUseCase().execute(input)).rejects.toBeInstanceOf(
      PendingAppointmentLimitError,
    );
    expect(checkout.create).not.toHaveBeenCalled();
    expect(cache.invalidate).not.toHaveBeenCalled();
  });
});
