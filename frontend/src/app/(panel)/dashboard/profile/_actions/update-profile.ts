'use server';

import { revalidatePath } from 'next/cache';
import { isAxiosError } from 'axios';

import { getAccessToken } from '@/lib/get-access-token';
import { userServiceApi } from '@/lib/user-service-api';

export type UpdateProfileInput = {
  name?: string;
  address?: string | null;
  phone?: string | null;
  bio?: string | null;
  role?: string | null;
  times?: string[];
};

export type UpdateProfileOutput = {
  id: string;
  name: string;
  image: string | null;
  address: string | null;
  phone: string | null;
  bio: string | null;
  role: string | null;
  times: string[];
  updatedAt: string;
};

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<{ data?: UpdateProfileOutput; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await userServiceApi.put<UpdateProfileOutput>('/users/me', input, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/dashboard/', 'layout');

    return { data };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return { error: error.response.data.message };
    }

    return { error: 'Não foi possível atualizar o perfil' };
  }
}
