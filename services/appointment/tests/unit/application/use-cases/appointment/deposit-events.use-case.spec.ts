import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { ConfirmAppointmentPaymentUseCase } from '@/application/use-cases/appointment/confirm-appointment-payment.use-case';
import { ExpirePendingAppointmentUseCase } from '@/application/use-cases/appointment/expire-pending-appointment.use-case';
import { type AppointmentEntity, AppointmentStatus } from '@/domain/entities/appointment.entity';
import { buildAppointment } from '@tests/unit/support/builders';
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

describe('ConfirmAppointmentPaymentUseCase', () => {
  const input = { appointmentId: 'appointment-1', checkoutSessionId: 'cs_1', paidAt };

  let appointments: ReturnType<typeof createAppointmentRepositoryMock>;
  let deposits: ReturnType<typeof createDepositGatewayMock>;
  let notifier: ReturnType<typeof createNotifierMock>;
  let useCase: ConfirmAppointmentPaymentUseCase;

  beforeEach(() => {
    appointments = createAppointmentRepositoryMock();
    deposits = createDepositGatewayMock();
    notifier = createNotifierMock();
    useCase = new ConfirmAppointmentPaymentUseCase(
      appointments,
      deposits,
      notifier,
      createBookingOfferRepositoryMock(),
      createBookingRequestRepositoryMock(),
    );
  });

  it('confirms a pending appointment', async () => {
    appointments.findById = async () => buildAppointment();

    await useCase.execute(input);

    expect(appointments.recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({ status: AppointmentStatus.CONFIRMED, paidAt }),
      AppointmentStatus.PENDING,
    );
    expect(deposits.refund).not.toHaveBeenCalled();
    expect(notifier.confirmed).toHaveBeenCalledWith(
      expect.objectContaining({ status: AppointmentStatus.CONFIRMED }),
    );
  });

  it('rejects a paid checkout with a mismatched amount or checkout reference', async () => {
    appointments.findById = async () => buildAppointment().attachCheckout('cs_1');

    await useCase.execute({ ...input, amount: 7000, currency: 'brl' });

    expect(appointments.recordPayment).not.toHaveBeenCalled();
    expect(notifier.confirmed).not.toHaveBeenCalled();
  });

  it('ignores a redelivered event', async () => {
    appointments.findById = async () => buildAppointment().confirmPayment(paidAt);

    await useCase.execute(input);

    expect(appointments.recordPayment).not.toHaveBeenCalled();
  });

  it('does not confirm twice when a concurrent delivery confirms first', async () => {
    const reads = [buildAppointment(), buildAppointment().confirmPayment(paidAt)];
    appointments.findById = async () => reads.shift() ?? null;
    appointments.recordPayment = mock(async () => false);

    await useCase.execute(input);

    expect(appointments.recordPayment).toHaveBeenCalledTimes(1);
    expect(notifier.confirmed).not.toHaveBeenCalled();
    expect(deposits.refund).not.toHaveBeenCalled();
  });

  it('refunds when the appointment is cancelled between the read and the confirmation', async () => {
    const reads = [buildAppointment(), buildAppointment().cancel()];
    appointments.findById = async () => reads.shift() ?? null;
    appointments.recordPayment = mock(
      async (_: AppointmentEntity, expected: AppointmentStatus) =>
        expected === AppointmentStatus.CANCELLED,
    );

    await useCase.execute(input);

    expect(deposits.refund).toHaveBeenCalledTimes(1);
    expect(notifier.latePaymentRefunded).toHaveBeenCalledTimes(1);
    expect(notifier.confirmed).not.toHaveBeenCalled();
  });

  it('fails when the payment still cannot be recorded after rereading', async () => {
    appointments.findById = async () => buildAppointment();
    appointments.recordPayment = mock(async () => false);

    await expect(useCase.execute(input)).rejects.toThrow('appointment-1');
    expect(notifier.confirmed).not.toHaveBeenCalled();
  });

  it('refunds a payment that arrives after the appointment was cancelled', async () => {
    appointments.findById = async () => buildAppointment().cancel();

    await useCase.execute(input);

    expect(deposits.refund).toHaveBeenCalledWith({
      appointmentId: 'appointment-1',
      checkoutSessionId: 'cs_1',
    });
    expect(appointments.recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AppointmentStatus.CANCELLED,
        paidAt,
        refundId: 're_1',
        refundedAt: expect.any(Date),
      }),
      AppointmentStatus.CANCELLED,
    );
    expect(notifier.latePaymentRefunded).toHaveBeenCalledWith(
      expect.objectContaining({ refundId: 're_1' }),
    );
    expect(notifier.confirmed).not.toHaveBeenCalled();
  });

  it('does not refund a late payment twice on redelivery', async () => {
    appointments.findById = async () =>
      buildAppointment().cancel().recordLatePayment(paidAt).recordRefund('re_1', paidAt);

    await useCase.execute(input);

    expect(deposits.refund).not.toHaveBeenCalled();
    expect(appointments.recordPayment).not.toHaveBeenCalled();
  });

  it('notifies a late refund once when a concurrent delivery records it first', async () => {
    appointments.findById = async () => buildAppointment().cancel();
    appointments.recordPayment = mock(async () => false);

    await useCase.execute(input);

    expect(notifier.latePaymentRefunded).not.toHaveBeenCalled();
  });

  it('propagates refund failures so the event goes to the DLQ', async () => {
    appointments.findById = async () => buildAppointment().cancel();
    deposits.refund = async () => {
      throw new Error('payment-service fora do ar');
    };

    await expect(useCase.execute(input)).rejects.toThrow('payment-service fora do ar');
    expect(appointments.recordPayment).not.toHaveBeenCalled();
  });
});

describe('ExpirePendingAppointmentUseCase', () => {
  let appointments: ReturnType<typeof createAppointmentRepositoryMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let useCase: ExpirePendingAppointmentUseCase;

  beforeEach(() => {
    appointments = createAppointmentRepositoryMock();
    publisher = createEventPublisherMock();
    cache = createCacheMock();
    useCase = new ExpirePendingAppointmentUseCase(appointments, publisher, cache);
  });

  it('cancels a pending appointment and releases the flash', async () => {
    appointments.findById = async () => buildAppointment();

    await useCase.execute({ appointmentId: 'appointment-1' });

    expect(appointments.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: AppointmentStatus.CANCELLED }),
    );
    expect(publisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'appointment.cancelled' }),
    );
    expect(cache.invalidate).toHaveBeenCalledWith('appointment:public:blocked-times:user-1');
  });

  it('keeps confirmed appointments untouched', async () => {
    appointments.findById = async () => buildAppointment().confirmPayment(paidAt);

    await useCase.execute({ appointmentId: 'appointment-1' });

    expect(appointments.update).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
