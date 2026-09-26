'use server';

import { isAxiosError } from 'axios';

import { api } from '@/lib/api';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(input: RegisterInput) {
  try {
    await api.post('/auth/register', input);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) {
      throw new Error('Já existe uma conta com este e-mail.');
    }

    throw new Error('Não foi possível criar sua conta. Tente novamente.');
  }
}
