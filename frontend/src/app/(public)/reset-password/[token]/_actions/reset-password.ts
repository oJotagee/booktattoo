'use server';

import { isAxiosError } from 'axios';

import { api } from '@/lib/api';

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

export async function resetPassword(input: ResetPasswordInput) {
  try {
    await api.post('/auth/reset-password', input);
  } catch (error) {
    if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 404)) {
      throw new Error('Link inválido ou expirado. Solicite um novo.');
    }

    throw new Error('Não foi possível redefinir sua senha. Tente novamente.');
  }
}
