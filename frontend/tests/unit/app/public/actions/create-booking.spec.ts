import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../support/mocks';

const api = createApiMock();

mock.module('@/lib/api', () => ({ api }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { createBooking } = await import('@/app/(public)/_actions/create-booking');

const input = {
  artistId: 'user-1',
  galeryId: 'galery-1',
  date: '2030-01-15',
  time: '09:30',
  name: 'Mariana Costa',
  email: 'mariana@email.com',
  phone: '(11) 99999-9999',
};

describe('createBooking', () => {
  beforeEach(() => {
    api.post.mockClear();
    api.post.mockImplementation(async () => ({
      data: { appointmentId: 'appointment-1', checkoutUrl: 'https://checkout.stripe.com/x' },
    }));
  });

  it('creates the booking with the phone digits only and returns the checkout url', async () => {
    const result = await createBooking(input);

    expect(api.post).toHaveBeenCalledWith('/public/appointments', {
      artistId: 'user-1',
      galeryId: 'galery-1',
      date: '2030-01-15',
      time: '09:30',
      name: 'Mariana Costa',
      email: 'mariana@email.com',
      phone: '11999999999',
    });
    expect(result).toEqual({
      data: { appointmentId: 'appointment-1', checkoutUrl: 'https://checkout.stripe.com/x' },
    });
  });

  it('validates the input before calling the API', async () => {
    const result = await createBooking({ ...input, time: '' });

    expect(result).toEqual({ error: 'Escolha um horário' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('returns the domain error message from the API', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(409, {
        error: 'SlotUnavailableError',
        message: 'Este horário não está mais disponível. Escolha outro horário.',
      });
    });

    const result = await createBooking(input);

    expect(result).toEqual({
      error: 'Este horário não está mais disponível. Escolha outro horário.',
    });
  });

  it('returns a generic error when the API fails', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(503);
    });

    const result = await createBooking(input);

    expect(result).toEqual({ error: 'Não foi possível concluir o agendamento' });
  });
});
