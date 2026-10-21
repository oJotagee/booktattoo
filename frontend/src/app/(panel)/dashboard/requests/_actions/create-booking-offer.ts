'use server';

import { revalidatePath } from 'next/cache';

import { offerSchema, type OfferSchemaData } from '../_components/offer-schema';
import type { BookingOffer } from '@/components/conversation/types';
import { getAccessToken } from '@/lib/get-access-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

interface CreateBookingOfferInput extends OfferSchemaData {
  id: string;
}

export async function createBookingOffer({
  id,
  ...input
}: CreateBookingOfferInput): Promise<{ data?: BookingOffer; error?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Usuário não autenticado' };

  const parsed = offerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Proposta inválida' };

  try {
    const { data } = await api.post<BookingOffer>(
      `/booking-requests/${encodeURIComponent(id)}/offer`,
      parsed.data,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    revalidatePath('/dashboard/requests');

    return { data };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível enviar a proposta') };
  }
}
