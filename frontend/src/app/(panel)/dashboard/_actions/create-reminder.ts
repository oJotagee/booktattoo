'use server';

import { revalidatePath } from 'next/cache';

import type { Reminder } from '../_data-access/get-all-reminders';
import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

export type CreateReminderInput = {
  description: string;
};

export async function createReminder(
  input: CreateReminderInput,
): Promise<{ data?: Reminder; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  try {
    const { data } = await api.post<Reminder>('/reminders', input, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/dashboard');

    return { data };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível criar o lembrete') };
  }
}
