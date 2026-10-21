'use server';

import { bookingTokenHeaders, isBookingToken } from '@/lib/booking-token';
import { getApiErrorMessage } from '@/lib/api-error';
import { api } from '@/lib/api';

export async function payBookingOffer(
  token: string,
): Promise<{ data?: { checkoutUrl: string }; error?: string }> {
  if (!isBookingToken(token)) return { error: 'Conversa não encontrada' };

  try {
    const { data } = await api.post<{ checkoutUrl: string }>(
      '/public/booking-requests/conversation/offer/pay',
      undefined,
      { headers: bookingTokenHeaders(token) },
    );

    return { data: { checkoutUrl: data.checkoutUrl } };
  } catch (error) {
    return { error: getApiErrorMessage(error, 'Não foi possível iniciar o pagamento') };
  }
}
