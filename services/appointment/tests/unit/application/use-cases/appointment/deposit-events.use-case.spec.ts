import { beforeEach, describe, expect, it } from 'bun:test';

import { ConfirmAppointmentPaymentUseCase } from '@/application/use-cases/appointment/confirm-appointment-payment.use-case';
import { ExpirePendingAppointmentUseCase } from '@/application/use-cases/appointment/expire-pending-appointment.use-case';
import { AppointmentStatus } from '@/domain/entities/appointment.entity';
import { buildAppointment } from '@tests/unit/support/builders';
import {
  createAppointmentRepositoryMock,
  createCacheMock,
  createDepositGatewayMock,
  createEventPublisherMock,
} from '@tests/unit/support/mocks';

const paidAt = new Date('2026-10-16T15:00:00.000Z');

describe('ConfirmAppointmentPaymentUseCase', () => {
  const input = { appointmentId: 'appointment-1', checkoutSessionId: 'cs_1', paidAt };

  let appointments: ReturnType<typeof createAppointmentRepositoryMock>;
  let deposits: ReturnType<typeof createDepositGatewayMock>;
  let useCase: ConfirmAppointmentPaymentUseCase;

  beforeEach(() => {
    appointments = createAppointmentRepositoryMock();
    deposits = createDepositGatewayMock();
    useCase = new ConfirmAppointmentPaymentUseCase(appointments, deposits);
  });

  it('confirms a pending appointment', async () => {
    appointments.findById = async () => buildAppointment();

    await useCase.execute(input);

    expect(appointments.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: AppointmentStatus.CONFIRMED, paidAt }),
    );
    expect(deposits.refund).not.toHaveBeenCalled();
  });

  it('ignores a redelivered event', async () => {
    appointments.findById = async () => buildAppointment().confirmPayment(paidAt);

    await useCase.execute(input);

    expect(appointments.update).not.toHaveBeenCalled();
  });

  it('refunds a payment that arrives after the appointment was cancelled', async () => {
    appointments.findById = async () => buildAppointment().cancel();

    await useCase.execute(input);

    expect(deposits.refund).toHaveBeenCalledWith({
      appointmentId: 'appointment-1',
      checkoutSessionId: 'cs_1',
    });
    expect(appointments.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AppointmentStatus.CANCELLED,
        paidAt,
        refundId: 're_1',
        refundedAt: expect.any(Date),
      }),
    );
  });

  it('does not refund a late payment twice on redelivery', async () => {
    appointments.findById = async () =>
      buildAppointment().cancel().recordLatePayment(paidAt).recordRefund('re_1', paidAt);

    await useCase.execute(input);

    expect(deposits.refund).not.toHaveBeenCalled();
    expect(appointments.update).not.toHaveBeenCalled();
  });

  it('propagates refund failures so the event goes to the DLQ', async () => {
    appointments.findById = async () => buildAppointment().cancel();
    deposits.refund = async () => {
      throw new Error('payment-service fora do ar');
    };

    await expect(useCase.execute(input)).rejects.toThrow('payment-service fora do ar');
    expect(appointments.update).not.toHaveBeenCalled();
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
