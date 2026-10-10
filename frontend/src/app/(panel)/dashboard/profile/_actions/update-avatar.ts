'use server';

import { revalidatePath } from 'next/cache';

import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

export type UpdateAvatarOutput = {
  id: string;
  image: string;
  updatedAt: string;
};

export async function updateAvatar(
  formData: FormData,
): Promise<{ data?: UpdateAvatarOutput; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await api.put<UpdateAvatarOutput>('/users/me/avatar', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    revalidatePath('/dashboard/', 'layout');

    return { data };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível atualizar a foto de perfil') };
  }
}
