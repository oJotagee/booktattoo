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

const { updateGaleryImage } = await import(
  '@/app/(panel)/dashboard/galery/_actions/update-galery-image'
);

function buildFormData() {
  const formData = new FormData();
  formData.append('id', 'galery-1');
  formData.append('file', new File(['image'], 'rosa.png', { type: 'image/png' }));
  return formData;
}

describe('updateGaleryImage', () => {
  beforeEach(() => {
    api.put.mockClear();
    getAccessToken.mockClear();
    revalidatePath.mockClear();
    getAccessToken.mockImplementation(async () => 'access-token');
  });

  it('returns an error when the user is not authenticated', async () => {
    getAccessToken.mockImplementationOnce(async () => null);

    const result = await updateGaleryImage(buildFormData());

    expect(result).toEqual({ error: 'Usuário não autenticado' });
    expect(api.put).not.toHaveBeenCalled();
  });

  it('returns an error when the id or file is missing', async () => {
    const formData = new FormData();
    formData.append('id', 'galery-1');

    const result = await updateGaleryImage(formData);

    expect(result).toEqual({ error: 'Imagem inválida' });
    expect(api.put).not.toHaveBeenCalled();
  });

  it('uploads only the file to the galery image route', async () => {
    const output = { id: 'galery-1', imageUrl: 'https://cdn/rosa.png', updatedAt: '2026-01-01' };
    api.put.mockImplementationOnce(async () => ({ data: output }));

    const result = await updateGaleryImage(buildFormData());

    const [url, body, config] = api.put.mock.calls[0] as [string, FormData, unknown];
    expect(url).toBe('/galeries/galery-1/image');
    expect(body.get('id')).toBeNull();
    expect(body.get('file')).toBeInstanceOf(Blob);
    expect(config).toEqual({
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'multipart/form-data',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/galery');
    expect(result).toEqual({ data: output });
  });

  it('returns the API error message when the request fails with one', async () => {
    api.put.mockImplementationOnce(async () => {
      throw createAxiosError(400, { error: 'UnsupportedGaleryImageTypeError', message: 'Unsupported image type' });
    });

    const result = await updateGaleryImage(buildFormData());

    expect(result).toEqual({ error: 'Unsupported image type' });
  });

  it('returns a generic error message when the request fails without one', async () => {
    api.put.mockImplementationOnce(async () => {
      throw createAxiosError(500);
    });

    const result = await updateGaleryImage(buildFormData());

    expect(result).toEqual({ error: 'Não foi possível atualizar a imagem do flash' });
  });
});
