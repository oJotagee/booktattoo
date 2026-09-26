'use server';

import { revalidatePath } from 'next/cache';
import { isAxiosError } from 'axios';

import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/get-access-token';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'VACATION';

export async function updateUserStatus(status: UserStatus) {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  try {
    await api.patch(
      '/users/me/status',
      { status },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.error === 'UserAlreadyInStatusError') {
      return { status };
    }

    throw error;
  }

  revalidatePath('/dashboard/', 'layout');

  return { status };
}
