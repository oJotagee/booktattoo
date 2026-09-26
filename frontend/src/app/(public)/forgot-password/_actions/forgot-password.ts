'use server';

import { api } from '@/lib/api';

export type ForgotPasswordInput = {
  email: string;
};

export async function forgotPassword(input: ForgotPasswordInput) {
  try {
    await api.post('/auth/forgot-password', input);
  } catch {
    throw new Error('Não foi possível enviar o e-mail. Tente novamente.');
  }
}
