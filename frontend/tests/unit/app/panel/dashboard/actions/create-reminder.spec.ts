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

const { createReminder } = await import('@/app/(panel)/dashboard/_actions/create-reminder');

describe('createReminder', () => {
  const input = { description: 'Enviar confirmação para Mariana (09:00)' };

  beforeEach(() => {
    api.post.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await createReminder(input);

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('creates the reminder with the bearer token and revalidates the dashboard', async () => {
    const output = {
      id: 'reminder-1',
      ...input,
      userId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    api.post.mockImplementationOnce(async () => ({ data: output }));

    const result = await createReminder(input);

    expect(api.post).toHaveBeenCalledWith('/reminders', input, {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(result).toEqual({ data: output });
  });

  it('returns the API error message when the request fails with one', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(400, { error: 'InvalidReminderError', message: 'Reminder description cannot be empty.' });
    });

    const result = await createReminder(input);

    expect(result).toEqual({ error: 'Reminder description cannot be empty.' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns a generic error message when the request fails without one', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await createReminder(input);

    expect(result).toEqual({ error: 'Não foi possível criar o lembrete' });
  });
});
