import { beforeEach, describe, expect, it } from 'bun:test';

import { CancelAppointmentUseCase } from '@/application/use-cases/appointment/cancel-appointment.use-case';
import { AppointmentStatus } from '@/domain/entities/appointment.entity';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import {
  AppointmentAlreadyCancelledError,
  AppointmentNotFoundError,
} from '@/domain/errors/appointment.error';
import { buildAppointment } from '@tests/unit/support/builders';
import {
  createAppointmentRepositoryMock,
  createCacheMock,
  createEventPublisherMock,
} from '@tests/unit/support/mocks';

describe('CancelAppointmentUseCase', () => {
  let appointments: ReturnType<typeof createAppointmentRepositoryMock>;
  let publisher: ReturnType<typeof createEventPublisherMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let useCase: CancelAppointmentUseCase;

  beforeEach(() => {
    appointments = createAppointmentRepositoryMock();
    publisher = createEventPublisherMock();
    cache = createCacheMock();
    useCase = new CancelAppointmentUseCase(appointments, publisher, cache);
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

  it('rejects an appointment that is already cancelled', async () => {
    appointments.findById = async () => buildAppointment().cancel();

    await expect(useCase.execute({ id: 'appointment-1', userId: 'user-1' })).rejects.toBeInstanceOf(
      AppointmentAlreadyCancelledError,
    );
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
