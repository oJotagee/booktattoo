'use server';

import { extractPhoneNumber } from '@/utils/formatPhone';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';
import {
  bookingRequestSchema,
  type BookingRequestSchemaData,
} from '../_components/booking-request/booking-request-schema';

type CreateBookingRequestInput = BookingRequestSchemaData & {
  artistId: string;
};

interface CreateBookingRequestOutput {
  token: string;
}

export async function createBookingRequest({
  artistId,
  ...input
}: CreateBookingRequestInput): Promise<{ data?: CreateBookingRequestOutput; error?: string }> {
  const parsed = bookingRequestSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };

  try {
    const { data } = await api.post<CreateBookingRequestOutput>('/public/booking-requests', {
      artistId,
      ...parsed.data,
      phone: extractPhoneNumber(parsed.data.phone),
    });

    return { data: { token: data.token } };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível enviar o seu pedido') };
  }
}
