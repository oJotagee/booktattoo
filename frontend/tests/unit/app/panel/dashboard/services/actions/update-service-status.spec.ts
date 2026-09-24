import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { createAxiosError, createUserServiceApiMock } from '../../../../../support/mocks';

const userServiceApi = createUserServiceApiMock();
const getAccessToken = mock(async (): Promise<string | null> => 'access-token');
const revalidatePath = mock(() => undefined);

mock.module('@/lib/user-service-api', () => ({ userServiceApi }));
mock.module('@/lib/get-access-token', () => ({ getAccessToken }));
mock.module('next/cache', () => ({ revalidatePath }));
mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { updateServiceStatus } = await import(
  '@/app/(panel)/dashboard/services/_actions/update-service-status'
);

describe('updateServiceStatus', () => {
  beforeEach(() => {
    userServiceApi.patch.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await updateServiceStatus({ id: 'service-1', status: false });

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(userServiceApi.patch).not.toHaveBeenCalled();
  });

  it('patches the status with the bearer token and revalidates the services page', async () => {
    const result = await updateServiceStatus({ id: 'service-1', status: false });

    expect(userServiceApi.patch).toHaveBeenCalledWith(
      '/services/service-1/status',
      { status: false },
      { headers: { Authorization: 'Bearer access-token' } },
    );
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/services');
    expect(result).toEqual({ data: 'Status atualizado com sucesso' });
  });

  it('returns the API error message when the request fails with one', async () => {
    userServiceApi.patch.mockImplementationOnce(async () => {
      throw createAxiosError(403, { message: 'Acesso negado' });
    });

    const result = await updateServiceStatus({ id: 'service-1', status: true });

    expect(result).toEqual({ error: 'Acesso negado' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns a generic error message when the request fails without one', async () => {
    userServiceApi.patch.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await updateServiceStatus({ id: 'service-1', status: true });

    expect(result).toEqual({ error: 'Não foi possível atualizar o status do serviço' });
  });
});
