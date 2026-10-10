'use server';

import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

export type ForgotPasswordInput = {
  email: string;
};

export async function forgotPassword(input: ForgotPasswordInput): Promise<{ error?: string }> {
  try {
    await api.post('/auth/forgot-password', input);

    return {};
  } catch (error) {
    return {
      error: getApiErrorMessage(error, 'Não foi possível enviar o e-mail. Tente novamente.'),
    };
  }
}
