import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createApiMock } from '../../../../../support/mocks';

const api = createApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');
const revalidatePath = mock(() => undefined);

mock.module('@/lib/api', () => ({ api }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('next/cache', () => ({ revalidatePath }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { createService } = await import('@/app/(panel)/dashboard/services/_actions/create-service');

describe('createService', () => {
  const input = { name: 'Cover-up', duration: 180, depositAmount: 55000 };

  beforeEach(() => {
    api.post.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await createService(input);

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('creates the service with the bearer token and revalidates the services page', async () => {
    const output = {
      id: 'service-1',
      ...input,
      status: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    api.post.mockImplementationOnce(async () => ({ data: output }));

    const result = await createService(input);

    expect(api.post).toHaveBeenCalledWith('/services', input, {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/services');
    expect(result).toEqual({ data: output });
  });

  it('returns the API error message when the request fails with one', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(400, { message: 'Nome inválido' });
    });

    const result = await createService(input);

    expect(result).toEqual({ error: 'Nome inválido' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns a generic error message when the request fails without one', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await createService(input);

    expect(result).toEqual({ error: 'Não foi possível criar o serviço' });
  });
});
