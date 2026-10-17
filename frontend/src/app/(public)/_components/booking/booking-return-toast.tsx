'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const BOOKING_RETURN_TOAST_ID = 'booking-return';

export function BookingReturnToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const booking = searchParams.get('booking');

  useEffect(() => {
    if (booking !== 'success' && booking !== 'cancelled') return;

    if (booking === 'success') {
      toast.success('Sinal pago! Seu horário está reservado.', { id: BOOKING_RETURN_TOAST_ID });
    } else {
      toast.info('Pagamento não concluído. O horário fica reservado por até 30 minutos.', {
        id: BOOKING_RETURN_TOAST_ID,
      });
    }

    const params = new URLSearchParams(searchParams);
    params.delete('booking');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [booking, pathname, router, searchParams]);

  return null;
}
