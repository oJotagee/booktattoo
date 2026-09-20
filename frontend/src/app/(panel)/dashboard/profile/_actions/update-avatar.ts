'use server';

import { isAxiosError } from 'axios';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { userServiceApi } from '@/lib/user-service-api';

export type UpdateAvatarOutput = {
  id: string;
  image: string;
  updatedAt: string;
};

export async function updateAvatar(
  formData: FormData,
): Promise<{ data?: UpdateAvatarOutput; error?: string }> {
  const session = await auth();
  if (!session?.accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await userServiceApi.put<UpdateAvatarOutput>('/users/me/avatar', formData, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
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
