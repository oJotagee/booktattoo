'use server';

import { bookingSchema, type BookingSchemaData } from '../_components/booking/booking-schema';
import { extractPhoneNumber } from '@/utils/formatPhone';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

type CreateBookingInput = BookingSchemaData & {
  artistId: string;
  galeryId: string;
};

interface CreateBookingOutput {
  appointmentId: string;
  checkoutUrl: string;
}

export async function createBooking({
  artistId,
  galeryId,
  ...input
}: CreateBookingInput): Promise<{ data?: CreateBookingOutput; error?: string }> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };

  try {
    const { data } = await api.post<CreateBookingOutput>('/public/appointments', {
      artistId,
      galeryId,
      ...parsed.data,
      phone: extractPhoneNumber(parsed.data.phone),
    });

    return { data };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível concluir o agendamento') };
  }
}
