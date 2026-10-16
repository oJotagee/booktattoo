import { beforeEach, describe, expect, it } from 'bun:test';

import { ConfirmAppointmentPaymentUseCase } from '@/application/use-cases/appointment/confirm-appointment-payment.use-case';
import { ExpirePendingAppointmentUseCase } from '@/application/use-cases/appointment/expire-pending-appointment.use-case';
import { AppointmentStatus } from '@/domain/entities/appointment.entity';
import { buildAppointment } from '@tests/unit/support/builders';
import {
  createAppointmentRepositoryMock,
  createEventPublisherMock,
} from '@tests/unit/support/mocks';

const paidAt = new Date('2026-10-16T15:00:00.000Z');

describe('ConfirmAppointmentPaymentUseCase', () => {
  let appointments: ReturnType<typeof createAppointmentRepositoryMock>;
  let useCase: ConfirmAppointmentPaymentUseCase;

  beforeEach(() => {
    appointments = createAppointmentRepositoryMock();
    useCase = new ConfirmAppointmentPaymentUseCase(appointments);
  });

  it('confirms a pending appointment', async () => {
    appointments.findById = async () => buildAppointment();

    await useCase.execute({ appointmentId: 'appointment-1', paidAt });

    expect(appointments.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: AppointmentStatus.CONFIRMED, paidAt }),
    );
  });

  it('ignores a redelivered event', async () => {
    appointments.findById = async () => buildAppointment().confirmPayment(paidAt);

    await useCase.execute({ appointmentId: 'appointment-1', paidAt });

    expect(appointments.update).not.toHaveBeenCalled();
  });

  it('does not revive a cancelled appointment', async () => {
    appointments.findById = async () => buildAppointment().cancel();

    await useCase.execute({ appointmentId: 'appointment-1', paidAt });

    expect(appointments.update).not.toHaveBeenCalled();
  });
});

describe('ExpirePendingAppointmentUseCase', () => {
  let appointments: ReturnType<typeof createAppointmentRepositoryMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let useCase: ExpirePendingAppointmentUseCase;

  beforeEach(() => {
    appointments = createAppointmentRepositoryMock();
    publisher = createEventPublisherMock();
    useCase = new ExpirePendingAppointmentUseCase(appointments, publisher);
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
  });

  it('keeps confirmed appointments untouched', async () => {
    appointments.findById = async () => buildAppointment().confirmPayment(paidAt);

    await useCase.execute({ appointmentId: 'appointment-1' });

    expect(appointments.update).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
