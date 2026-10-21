import { beforeEach, describe, expect, it, type mock } from 'bun:test';

import type { SaveOffersParams } from '@/application/port/booking-offer-repository.port';
import { DepositBookingService } from '@/application/services/deposit-booking.service';
import { FindBlockedTimesUseCase } from '@/application/use-cases/appointment/find-blocked-times.use-case';
import { ConfirmAppointmentPaymentUseCase } from '@/application/use-cases/appointment/confirm-appointment-payment.use-case';
import { CreateBookingOfferUseCase } from '@/application/use-cases/booking-offer/create-booking-offer.use-case';
import { PayBookingOfferUseCase } from '@/application/use-cases/booking-offer/pay-booking-offer.use-case';
import { WithdrawBookingOfferUseCase } from '@/application/use-cases/booking-offer/withdraw-booking-offer.use-case';
import { CloseBookingRequestUseCase } from '@/application/use-cases/booking-request/close-booking-request.use-case';
import { AppointmentEntity, AppointmentStatus } from '@/domain/entities/appointment.entity';
import { BookingOfferStatus } from '@/domain/entities/booking-offer.entity';
import { BookingRequestStatus, MessageAuthor } from '@/domain/entities/booking-request.entity';
import {
  ArtistUnavailableError,
  SlotInThePastError,
  SlotUnavailableError,
} from '@/domain/errors/appointment.error';
import {
  BookingOfferUnavailableError,
  InvalidBookingOfferError,
  OfferPaymentInProgressError,
} from '@/domain/errors/booking-request.error';
import { buildAppointment, buildBookingRequest, buildOffer } from '@tests/unit/support/builders';
import {
  buildArtistSnapshot,
  createAppointmentRepositoryMock,
  createArtistGatewayMock,
  createBookingLinkMock,
  createBookingOfferRepositoryMock,
  createBookingRequestNotifierMock,
  createBookingRequestRepositoryMock,
  createCacheMock,
  createDepositGatewayMock,
  createEventPublisherMock,
  createNotifierMock,
} from '@tests/unit/support/mocks';

const offerInput = {
  id: 'request-1',
  userId: 'user-1',
  title: 'Rosa fineline',
  date: '2030-01-15',
  time: '09:00',
  duration: 60,
  price: 60000,
  depositAmount: 15000,
};

function savedOffers(offers: ReturnType<typeof createBookingOfferRepositoryMock>) {
  return (offers.save as ReturnType<typeof mock>).mock.calls[0][0] as SaveOffersParams;
}

describe('CreateBookingOfferUseCase', () => {
  let requests: ReturnType<typeof createBookingRequestRepositoryMock>;
  let appointments: ReturnType<typeof createAppointmentRepositoryMock>;
  let notifier: ReturnType<typeof createBookingRequestNotifierMock>;

  function buildUseCase(
    offers = createBookingOfferRepositoryMock(),
    artist = buildArtistSnapshot(),
  ) {
    const artists = createArtistGatewayMock(artist);

    return new CreateBookingOfferUseCase(
      requests,
      offers,
      artists,
      notifier,
      new FindBlockedTimesUseCase(appointments, artists, createCacheMock()),
    );
  }

  beforeEach(() => {
    requests = createBookingRequestRepositoryMock();
    requests.findById = async () => buildBookingRequest();
    appointments = createAppointmentRepositoryMock();
    notifier = createBookingRequestNotifierMock();
  });

  it('saves the offer with a system message and emails the client', async () => {
    const offers = createBookingOfferRepositoryMock();

    await buildUseCase(offers).execute(offerInput);

    const { offers: saved, message } = savedOffers(offers);
    expect(saved).toHaveLength(1);
    expect(saved[0].scheduledAt).toEqual(new Date('2030-01-15T12:00:00.000Z'));
    expect(message.author).toBe(MessageAuthor.SYSTEM);
    expect(message.body).toContain('Rosa fineline');
    expect(notifier.offerSent).toHaveBeenCalledTimes(1);
  });

  it('withdraws the previous pending offer', async () => {
    const offers = createBookingOfferRepositoryMock(buildOffer({ id: 'old' }));

    await buildUseCase(offers).execute(offerInput);

    const statuses = savedOffers(offers).offers.map((offer) => [offer.id, offer.status]);
    expect(statuses[0]).toEqual(['old', BookingOfferStatus.WITHDRAWN]);
    expect(statuses[1][1]).toBe(BookingOfferStatus.PENDING);
  });

  it('refuses to replace an offer the client is paying', async () => {
    const offers = createBookingOfferRepositoryMock(buildOffer(), true);

    await expect(buildUseCase(offers).execute(offerInput)).rejects.toThrow(
      OfferPaymentInProgressError,
    );
  });

  it('refuses times outside the schedule or already taken', async () => {
    await expect(buildUseCase().execute({ ...offerInput, time: '08:00' })).rejects.toThrow(
      SlotUnavailableError,
    );

    appointments.findInRange = async () => [
      buildAppointment({ scheduledAt: new Date('2030-01-15T12:00:00.000Z') }),
    ];
    await expect(buildUseCase().execute(offerInput)).rejects.toThrow(SlotUnavailableError);
  });

  it('validates the amounts and the date', async () => {
    await expect(buildUseCase().execute({ ...offerInput, depositAmount: 70000 })).rejects.toThrow(
      InvalidBookingOfferError,
    );
    await expect(buildUseCase().execute({ ...offerInput, date: '2020-01-15' })).rejects.toThrow(
      SlotInThePastError,
    );
  });

  it('requires the artist to receive payments', async () => {
    await expect(
      buildUseCase(undefined, buildArtistSnapshot({ paymentsEnabled: false })).execute(offerInput),
    ).rejects.toThrow(ArtistUnavailableError);
  });
});

describe('PayBookingOfferUseCase', () => {
  let requests: ReturnType<typeof createBookingRequestRepositoryMock>;
  let appointments: ReturnType<typeof createAppointmentRepositoryMock>;
  let deposits: ReturnType<typeof createDepositGatewayMock>;

  function buildUseCase(offer = buildOffer()) {
    return new PayBookingOfferUseCase(
      requests,
      createBookingOfferRepositoryMock(offer),
      createBookingLinkMock(),
      createArtistGatewayMock(),
      new DepositBookingService(
        appointments,
        deposits,
        createEventPublisherMock(),
        createCacheMock(),
      ),
    );
  }

  beforeEach(() => {
    requests = createBookingRequestRepositoryMock();
    requests.findById = async () => buildBookingRequest();
    appointments = createAppointmentRepositoryMock();
    deposits = createDepositGatewayMock();
  });

  it('reserves the slot and opens a checkout that returns to the conversation', async () => {
    const result = await buildUseCase().execute({ token: 'signed.request-1' });

    expect(result.checkoutUrl).toBe('https://checkout.stripe.com/deposit');

    const [{ appointment }] = (appointments.createExclusive as ReturnType<typeof mock>).mock
      .calls[0] as [{ appointment: AppointmentEntity }];
    expect(appointment.status).toBe(AppointmentStatus.PENDING);
    expect(appointment.galeryId).toBeNull();
    expect(appointment.galeryTitle).toBe('Rosa fineline no antebraço');
    expect(appointment.bookingRequestId).toBe('request-1');
    expect(appointment.bookingOfferId).toBe('offer-1');
    expect(appointment.depositAmount).toBe(15000);
    expect(deposits.create).toHaveBeenCalledWith(
      expect.objectContaining({ returnPath: '/pedido/signed.request-1', amount: 15000 }),
    );
  });

  it('refuses when there is no pending offer', async () => {
    const offers = createBookingOfferRepositoryMock(null);
    const useCase = new PayBookingOfferUseCase(
      requests,
      offers,
      createBookingLinkMock(),
      createArtistGatewayMock(),
      new DepositBookingService(
        appointments,
        deposits,
        createEventPublisherMock(),
        createCacheMock(),
      ),
    );

    await expect(useCase.execute({ token: 'signed.request-1' })).rejects.toThrow(
      BookingOfferUnavailableError,
    );
  });

  it('refuses offers whose time has passed', async () => {
    await expect(
      buildUseCase(buildOffer({ scheduledAt: new Date('2020-01-15T12:00:00.000Z') })).execute({
        token: 'signed.request-1',
      }),
    ).rejects.toThrow(SlotInThePastError);
  });

  it('rechecks the slot at payment time', async () => {
    appointments = createAppointmentRepositoryMock({
      sameDay: [buildAppointment({ scheduledAt: new Date('2030-01-15T12:00:00.000Z') })],
      galeryTaken: false,
      clientHasPending: false,
      offerAvailable: true,
    });

    await expect(buildUseCase().execute({ token: 'signed.request-1' })).rejects.toThrow(
      SlotUnavailableError,
    );
    expect(deposits.create).not.toHaveBeenCalled();
  });

  it('refuses when the offer was withdrawn while the checkout was being opened', async () => {
    appointments = createAppointmentRepositoryMock({
      sameDay: [],
      galeryTaken: false,
      clientHasPending: false,
      offerAvailable: false,
    });

    await expect(buildUseCase().execute({ token: 'signed.request-1' })).rejects.toThrow(
      BookingOfferUnavailableError,
    );
    expect(deposits.create).not.toHaveBeenCalled();
  });
});

describe('offer lifecycle around the conversation', () => {
  it('marks the offer as paid and posts a system message when the deposit is confirmed', async () => {
    const offers = createBookingOfferRepositoryMock(buildOffer());
    const requests = createBookingRequestRepositoryMock();
    requests.findById = async () => buildBookingRequest();
    const appointments = createAppointmentRepositoryMock();
    appointments.findById = async () =>
      AppointmentEntity.restore({
        ...buildAppointment().toSafeJSON(),
        galeryId: null,
        bookingRequestId: 'request-1',
        bookingOfferId: 'offer-1',
      });

    await new ConfirmAppointmentPaymentUseCase(
      appointments,
      createDepositGatewayMock(),
      createNotifierMock(),
      offers,
      requests,
    ).execute({ appointmentId: 'appointment-1', checkoutSessionId: 'cs_1', paidAt: new Date() });

    const { offers: saved, message } = savedOffers(offers);
    expect(saved[0].status).toBe(BookingOfferStatus.PAID);
    expect(saved[0].appointmentId).toBe('appointment-1');
    expect(message.body).toContain('Sinal pago');
  });

  it('withdraws the pending offer when the artist asks', async () => {
    const offers = createBookingOfferRepositoryMock(buildOffer());
    const requests = createBookingRequestRepositoryMock();
    requests.findById = async () => buildBookingRequest();

    await new WithdrawBookingOfferUseCase(requests, offers).execute({
      id: 'request-1',
      userId: 'user-1',
    });

    expect(savedOffers(offers).offers[0].status).toBe(BookingOfferStatus.WITHDRAWN);
  });

  it('refuses to withdraw an offer that stopped being pending under the lock', async () => {
    const offers = createBookingOfferRepositoryMock(buildOffer(), false, {
      offerPending: false,
      offerBooked: false,
    });
    const requests = createBookingRequestRepositoryMock();
    requests.findById = async () => buildBookingRequest();

    await expect(
      new WithdrawBookingOfferUseCase(requests, offers).execute({
        id: 'request-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow(BookingOfferUnavailableError);
  });

  it('withdraws the pending offer when the conversation is closed', async () => {
    const offers = createBookingOfferRepositoryMock(buildOffer());
    const requests = createBookingRequestRepositoryMock();
    requests.findById = async () => buildBookingRequest();

    await new CloseBookingRequestUseCase(requests, offers).execute({
      id: 'request-1',
      userId: 'user-1',
    });

    expect(savedOffers(offers).offers[0].status).toBe(BookingOfferStatus.WITHDRAWN);
    expect(requests.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: BookingRequestStatus.CLOSED }),
    );
  });

  it('blocks closing while the client is in the checkout', async () => {
    const requests = createBookingRequestRepositoryMock();
    requests.findById = async () => buildBookingRequest();

    await expect(
      new CloseBookingRequestUseCase(
        requests,
        createBookingOfferRepositoryMock(buildOffer(), true),
      ).execute({ id: 'request-1', userId: 'user-1' }),
    ).rejects.toThrow(OfferPaymentInProgressError);
    expect(requests.update).not.toHaveBeenCalled();
  });
});
