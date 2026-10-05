'use server';

import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/get-access-token';

interface GetAllRemindersProps {
  limit: number;
  offset: number;
}

export interface PaginationReminder {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface Reminder {
  id: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OutputReminder {
  list: Reminder[];
  pagination: PaginationReminder;
}

export async function getAllReminders({
  limit,
  offset,
}: GetAllRemindersProps): Promise<OutputReminder> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  try {
    const reminders = await api.get('/reminders', {
      params: {
        limit,
        offset,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      list: reminders.data.list,
      pagination: reminders.data.pagination,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
