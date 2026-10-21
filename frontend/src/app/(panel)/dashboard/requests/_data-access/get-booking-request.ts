'use server';

import { isAxiosError } from 'axios';

import type { BookingRequestDetail } from './get-booking-requests';
import { getAccessToken } from '@/lib/get-access-token';
import { api } from '@/lib/api';

const NOT_FOUND_STATUSES = [400, 403, 404];

export async function getBookingRequest(id: string): Promise<BookingRequestDetail | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Usuário não autenticado');

  try {
    const request = await api.get<BookingRequestDetail>(
      `/booking-requests/${encodeURIComponent(id)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return request.data;
  } catch (error) {
    if (isAxiosError(error) && NOT_FOUND_STATUSES.includes(error.response?.status ?? 0)) {
      return null;
    }

    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
