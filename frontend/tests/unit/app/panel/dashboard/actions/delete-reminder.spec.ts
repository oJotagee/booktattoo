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

const { deleteReminder } = await import('@/app/(panel)/dashboard/_actions/delete-reminder');

describe('deleteReminder', () => {
  beforeEach(() => {
    api.delete.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await deleteReminder('reminder-1');

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('deletes the reminder with the bearer token and revalidates the dashboard', async () => {
    const result = await deleteReminder('reminder-1');

    expect(api.delete).toHaveBeenCalledWith('/reminders/reminder-1', {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(result).toEqual({ data: 'reminder-1' });
  });

  it('returns the API error message when the request fails with one', async () => {
    api.delete.mockImplementationOnce(async () => {
      throw createAxiosError(404, { error: 'ReminderNotFoundError', message: 'Lembrete com ID reminder-1 não encontrado.' });
    });

    const result = await deleteReminder('reminder-1');

    expect(result).toEqual({ error: 'Lembrete com ID reminder-1 não encontrado.' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns a generic error message when the request fails without one', async () => {
    api.delete.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await deleteReminder('reminder-1');

    expect(result).toEqual({ error: 'Não foi possível excluir o lembrete' });
  });
});
