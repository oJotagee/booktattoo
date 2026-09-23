'use server';

import { userServiceApi } from '@/lib/user-service-api';

export type ForgotPasswordInput = {
  email: string;
};

export async function forgotPassword(input: ForgotPasswordInput) {
  try {
    await userServiceApi.post('/auth/forgot-password', input);
  } catch {
    throw new Error('Não foi possível enviar o e-mail. Tente novamente.');
  }
}
