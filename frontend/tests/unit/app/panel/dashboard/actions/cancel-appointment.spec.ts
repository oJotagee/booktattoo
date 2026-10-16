import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');
const revalidatePath = mock(() => undefined);

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('next/cache', () => ({ revalidatePath }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { cancelAppointment } = await import('@/app/(panel)/dashboard/_actions/cancel-appointment');

describe('cancelAppointment', () => {
  beforeEach(() => {
    api.patch.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await cancelAppointment('appointment-1');

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('cancels the appointment and revalidates the dashboard', async () => {
    const result = await cancelAppointment('appointment-1');

    expect(api.patch).toHaveBeenCalledWith('/appointments/appointment-1/cancel', undefined, {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(result).toEqual({ data: 'appointment-1' });
  });

  it('returns the API error message when the request fails with one', async () => {
    api.patch.mockImplementationOnce(async () => {
      throw createAxiosError(409, {
        error: 'AppointmentAlreadyCancelledError',
        message: 'Este agendamento já foi cancelado.',
      });
    });

    const result = await cancelAppointment('appointment-1');

    expect(result).toEqual({ error: 'Este agendamento já foi cancelado.' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
