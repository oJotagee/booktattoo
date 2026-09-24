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

const { updateService } = await import('@/app/(panel)/dashboard/services/_actions/update-service');

describe('updateService', () => {
  const body = { name: 'Cover-up', duration: 180, depositAmount: 55000 };

  beforeEach(() => {
    userServiceApi.put.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await updateService({ id: 'service-1', ...body });

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(userServiceApi.put).not.toHaveBeenCalled();
  });

  it('sends the body without the id to the service route and revalidates the page', async () => {
    const output = {
      id: 'service-1',
      ...body,
      status: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };
    userServiceApi.put.mockImplementationOnce(async () => ({ data: output }));

    const result = await updateService({ id: 'service-1', ...body });

    expect(userServiceApi.put).toHaveBeenCalledWith('/services/service-1', body, {
      headers: { Authorization: 'Bearer access-token' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/services');
    expect(result).toEqual({ data: output });
  });

  it('returns the API error message when the request fails with one', async () => {
    userServiceApi.put.mockImplementationOnce(async () => {
      throw createAxiosError(404, { message: 'Serviço não encontrado' });
    });

    const result = await updateService({ id: 'service-1', ...body });

    expect(result).toEqual({ error: 'Serviço não encontrado' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns a generic error message when the request fails without one', async () => {
    userServiceApi.put.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await updateService({ id: 'service-1', ...body });

    expect(result).toEqual({ error: 'Não foi possível atualizar o serviço' });
  });
});
