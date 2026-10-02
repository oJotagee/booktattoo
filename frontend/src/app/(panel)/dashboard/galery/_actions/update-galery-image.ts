'use server';

import { revalidatePath } from 'next/cache';
import { isAxiosError } from 'axios';

import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

export type UpdateGaleryImageOutput = {
  id: string;
  imageUrl: string;
  updatedAt: string;
};

export async function updateGaleryImage(
  formData: FormData,
): Promise<{ data?: UpdateGaleryImageOutput; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  const id = formData.get('id');
  const file = formData.get('file');
  if (typeof id !== 'string' || !(file instanceof Blob)) {
    return { error: 'Imagem inválida' };
  }

  const body = new FormData();
  body.append('file', file);

  try {
    const { data } = await api.put<UpdateGaleryImageOutput>(`/galeries/${id}/image`, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    revalidatePath('/dashboard/galery');

    return { data };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível atualizar a imagem do flash' };
  }
}
