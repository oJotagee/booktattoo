import { beforeEach, describe, expect, it } from 'bun:test';
import { render } from '@testing-library/react';

import { resetNextMocks, router, setPathname, setSearchParams, toast } from '../../../support/next';

const { BookingReturnToast } = await import(
  '@/app/(public)/_components/booking/booking-return-toast'
);

describe('BookingReturnToast', () => {
  beforeEach(() => {
    resetNextMocks();
    toast.info.mockClear();
    setPathname('/user-1');
  });

  it('shows a single success toast and clears the booking param', () => {
    setSearchParams('booking=success&page=2');

    render(<BookingReturnToast />);

    expect(toast.success).toHaveBeenCalledWith('Sinal pago! Seu horário está reservado.', {
      id: 'booking-return',
    });
    expect(router.replace).toHaveBeenCalledWith('/user-1?page=2', { scroll: false });
  });

  it('reuses the same toast id when the effect runs again', () => {
    setSearchParams('booking=success');

    const { rerender } = render(<BookingReturnToast />);
    rerender(<BookingReturnToast key="remount" />);

    for (const [, options] of toast.success.mock.calls) {
      expect(options).toEqual({ id: 'booking-return' });
    }
  });

  it('shows an info toast when the payment was not completed', () => {
    setSearchParams('booking=cancelled');

    render(<BookingReturnToast />);

    expect(toast.info).toHaveBeenCalledWith(
      'Pagamento não concluído. O horário fica reservado por até 30 minutos.',
      { id: 'booking-return' },
    );
    expect(router.replace).toHaveBeenCalledWith('/user-1', { scroll: false });
  });

  it('does nothing without the booking param', () => {
    render(<BookingReturnToast />);

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
