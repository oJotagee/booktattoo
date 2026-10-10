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

const { createGalery } = await import('@/app/(panel)/dashboard/galery/_actions/create-galery');

function buildFormData() {
  const formData = new FormData();
  formData.append('file', new File(['image'], 'rosa.png', { type: 'image/png' }));
  formData.append('title', 'Rosa Tradicional');
  return formData;
}

describe('createGalery', () => {
  beforeEach(() => {
    api.post.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await createGalery(buildFormData());

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('sends the multipart form with the bearer token and revalidates the galery page', async () => {
    const output = { id: 'galery-1', title: 'Rosa Tradicional' };
    api.post.mockImplementationOnce(async () => ({ data: output }));
    const formData = buildFormData();

    const result = await createGalery(formData);

    expect(api.post).toHaveBeenCalledWith('/galeries', formData, {
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'multipart/form-data',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/galery');
    expect(result).toEqual({ data: output } as never);
  });

  it('returns the API error message when the request fails with one', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(400, { error: 'InvalidGaleryError', message: 'Estilo inválido' });
    });

    const result = await createGalery(buildFormData());

    expect(result).toEqual({ error: 'Estilo inválido' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns a generic error message when the request fails without one', async () => {
    api.post.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await createGalery(buildFormData());

    expect(result).toEqual({ error: 'Não foi possível criar o flash' });
  });
});
