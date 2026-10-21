'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const OFFER_PAYMENT_TOAST_ID = 'offer-payment-return';

export function OfferPaymentReturnToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const payment = searchParams.get('payment');

  useEffect(() => {
    if (payment !== 'success' && payment !== 'cancelled') return;

    if (payment === 'success') {
      toast.success('Sinal pago! Seu agendamento está confirmado.', {
        id: OFFER_PAYMENT_TOAST_ID,
      });
    } else {
      toast.info('Pagamento não concluído. Você poderá tentar de novo em até 30 minutos.', {
        id: OFFER_PAYMENT_TOAST_ID,
      });
    }

    const params = new URLSearchParams(searchParams);
    params.delete('payment');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [payment, pathname, router, searchParams]);

  return null;
}
