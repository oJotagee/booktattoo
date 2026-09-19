'use server';

import { isAxiosError } from 'axios';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { userServiceApi } from '@/lib/user-service-api';

export type UpdateProfileInput = {
  name?: string;
  address?: string | null;
  phone?: string | null;
  bio?: string | null;
  times?: string[];
};

export type UpdateProfileOutput = {
  id: string;
  name: string;
  image: string | null;
  address: string | null;
  phone: string | null;
  bio: string | null;
  times: string[];
  updatedAt: string;
};

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<{ data?: UpdateProfileOutput; error?: string }> {
  const session = await auth();
  if (!session?.accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await userServiceApi.put<UpdateProfileOutput>('/users/me', input, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
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
