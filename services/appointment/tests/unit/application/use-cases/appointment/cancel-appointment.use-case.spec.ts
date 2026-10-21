import { beforeEach, describe, expect, it, type mock } from 'bun:test';

import type { SaveOffersParams } from '@/application/port/booking-offer-repository.port';
import { CancelAppointmentUseCase } from '@/application/use-cases/appointment/cancel-appointment.use-case';
import { AppointmentEntity, AppointmentStatus } from '@/domain/entities/appointment.entity';
import { BookingOfferStatus } from '@/domain/entities/booking-offer.entity';
import { MessageAuthor } from '@/domain/entities/booking-request.entity';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import {
  AppointmentAlreadyCancelledError,
  AppointmentNotFoundError,
  ExternalServiceUnavailableError,
} from '@/domain/errors/appointment.error';
import { buildAppointment, buildBookingRequest, buildOffer } from '@tests/unit/support/builders';
import {
  createAppointmentRepositoryMock,
  createBookingOfferRepositoryMock,
  createBookingRequestRepositoryMock,
  createCacheMock,
  createDepositGatewayMock,
  createEventPublisherMock,
  createNotifierMock,
} from '@tests/unit/support/mocks';

const paidAt = new Date('2026-10-16T15:00:00.000Z');

describe('CancelAppointmentUseCase', () => {
  let appointments: ReturnType<typeof createAppointmentRepositoryMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let deposits: ReturnType<typeof createDepositGatewayMock>;
  let notifier: ReturnType<typeof createNotifierMock>;
  let offers: ReturnType<typeof createBookingOfferRepositoryMock>;
  let requests: ReturnType<typeof createBookingRequestRepositoryMock>;
  let useCase: CancelAppointmentUseCase;

  beforeEach(() => {
    appointments = createAppointmentRepositoryMock();
    publisher = createEventPublisherMock();
    cache = createCacheMock();
    deposits = createDepositGatewayMock();
    notifier = createNotifierMock();
    offers = createBookingOfferRepositoryMock();
    requests = createBookingRequestRepositoryMock();
    useCase = new CancelAppointmentUseCase(
      appointments,
      publisher,
      cache,
      deposits,
      notifier,
      offers,
      requests,
    );
  });

  it('marks the paid offer as cancelled and tells the client in the conversation', async () => {
    const paidOffer = buildOffer().markPaid('appointment-1', paidAt);
    offers.findById = async () => paidOffer;
    requests.findById = async () => buildBookingRequest();
    appointments.findById = async () =>
      AppointmentEntity.restore({
        ...buildAppointment().attachCheckout('cs_1').confirmPayment(paidAt).toSafeJSON(),
        galeryId: null,
        bookingRequestId: 'request-1',
        bookingOfferId: 'offer-1',
      });

    await useCase.execute({ id: 'appointment-1', userId: 'user-1' });

    const [{ offers: saved, message }] = (offers.save as ReturnType<typeof mock>).mock.calls[0] as [
      SaveOffersParams,
    ];
    expect(saved[0].status).toBe(BookingOfferStatus.CANCELLED);
    expect(message.author).toBe(MessageAuthor.SYSTEM);
    expect(message.body).toContain('reembolsado');
  });

  it('leaves offers alone when the appointment did not come from one', async () => {
    appointments.findById = async () => buildAppointment();

    await useCase.execute({ id: 'appointment-1', userId: 'user-1' });

    expect(offers.save).not.toHaveBeenCalled();
  });

  it('cancels the appointment and releases the flash', async () => {
    appointments.findById = async () => buildAppointment();

    await useCase.execute({ id: 'appointment-1', userId: 'user-1' });

    expect(appointments.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: AppointmentStatus.CANCELLED }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'appointment.cancelled',
        payload: { appointmentId: 'appointment-1', artistId: 'user-1', galeryId: 'galery-1' },
      }),
    );
    expect(cache.invalidate).toHaveBeenCalledWith('appointment:public:blocked-times:user-1');
  });

  it('refunds the deposit of a paid appointment before cancelling', async () => {
    appointments.findById = async () =>
      buildAppointment().attachCheckout('cs_1').confirmPayment(paidAt);

    await useCase.execute({ id: 'appointment-1', userId: 'user-1' });

    expect(deposits.refund).toHaveBeenCalledWith({
      appointmentId: 'appointment-1',
      checkoutSessionId: 'cs_1',
    });
    expect(appointments.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AppointmentStatus.CANCELLED,
        refundId: 're_1',
        refundedAt: expect.any(Date),
      }),
    );
    expect(deposits.expireCheckout).not.toHaveBeenCalled();
    expect(notifier.cancelledWithRefund).toHaveBeenCalledWith(
      expect.objectContaining({ refundId: 're_1' }),
    );
  });

  it('keeps the appointment untouched when the refund fails', async () => {
    appointments.findById = async () =>
      buildAppointment().attachCheckout('cs_1').confirmPayment(paidAt);
    deposits.refund = async () => {
      throw new ExternalServiceUnavailableError();
    };

    await expect(useCase.execute({ id: 'appointment-1', userId: 'user-1' })).rejects.toBeInstanceOf(
      ExternalServiceUnavailableError,
    );
    expect(appointments.update).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(notifier.cancelledWithRefund).not.toHaveBeenCalled();
  });

  it('expires the open checkout of a pending appointment', async () => {
    appointments.findById = async () => buildAppointment().attachCheckout('cs_1');

    await useCase.execute({ id: 'appointment-1', userId: 'user-1' });

    expect(deposits.expireCheckout).toHaveBeenCalledWith('cs_1');
    expect(deposits.refund).not.toHaveBeenCalled();
    expect(appointments.update).toHaveBeenCalled();
    expect(notifier.cancelledWithRefund).not.toHaveBeenCalled();
  });

  it('still cancels when expiring the checkout fails', async () => {
    appointments.findById = async () => buildAppointment().attachCheckout('cs_1');
    deposits.expireCheckout = async () => {
      throw new ExternalServiceUnavailableError();
    };

    await useCase.execute({ id: 'appointment-1', userId: 'user-1' });

    expect(appointments.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: AppointmentStatus.CANCELLED }),
    );
    expect(publisher.publish).toHaveBeenCalled();
  });

  it('throws when the appointment does not exist', async () => {
    await expect(useCase.execute({ id: 'missing', userId: 'user-1' })).rejects.toBeInstanceOf(
      AppointmentNotFoundError,
    );
  });

  it('forbids cancelling appointments of another artist', async () => {
    appointments.findById = async () => buildAppointment({ userId: 'user-2' });

    await expect(useCase.execute({ id: 'appointment-1', userId: 'user-1' })).rejects.toBeInstanceOf(
      ForbiddenResourceAccessError,
    );
  });

  it('rejects an appointment that is already cancelled without refunding again', async () => {
    appointments.findById = async () =>
      buildAppointment()
        .attachCheckout('cs_1')
        .confirmPayment(paidAt)
        .cancel()
        .recordRefund('re_1', paidAt);

    await expect(useCase.execute({ id: 'appointment-1', userId: 'user-1' })).rejects.toBeInstanceOf(
      AppointmentAlreadyCancelledError,
    );
    expect(deposits.refund).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(notifier.cancelledWithRefund).not.toHaveBeenCalled();
  });
});
