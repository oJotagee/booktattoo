'use server';

import { isAxiosError } from 'axios';
import { userServiceApi } from '@/lib/user-service-api';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(input: RegisterInput) {
  try {
    await userServiceApi.post('/users/register', input);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) {
      throw new Error('Já existe uma conta com este e-mail.');
    }

    throw new Error('Não foi possível criar sua conta. Tente novamente.');
  }
}
