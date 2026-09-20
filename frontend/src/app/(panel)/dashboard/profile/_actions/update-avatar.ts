'use server';

import { isAxiosError } from 'axios';
import { revalidatePath } from 'next/cache';
import { getAccessToken } from '@/lib/get-access-token';
import { userServiceApi } from '@/lib/user-service-api';

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
    const { data } = await userServiceApi.put<UpdateAvatarOutput>('/users/me/avatar', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    revalidatePath('/dashboard/', 'layout');

    return { data };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível atualizar a foto de perfil' };
  }
}
