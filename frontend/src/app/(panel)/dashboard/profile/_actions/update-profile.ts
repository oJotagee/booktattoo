'use server';

import { revalidatePath } from 'next/cache';

import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

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
    const { data } = await api.put<UpdateProfileOutput>('/users/me', input, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/dashboard/', 'layout');

    return { data };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível atualizar o perfil') };
  }
}
