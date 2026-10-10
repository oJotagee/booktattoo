'use server';

import { isAxiosError } from 'axios';

import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

export async function resetPassword(input: ResetPasswordInput): Promise<{ error?: string }> {
  try {
    await api.post('/auth/reset-password', input);

    return {};
  } catch (error) {
    if (isAxiosError(error) && [404, 410].includes(error.response?.status ?? 0)) {
      return { error: 'Link inválido ou expirado. Solicite um novo.' };
    }

    return {
      error: getApiErrorMessage(error, 'Não foi possível redefinir sua senha. Tente novamente.'),
    };
  }
}
