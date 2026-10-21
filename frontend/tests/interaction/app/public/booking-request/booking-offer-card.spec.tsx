import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import { resetNextMocks, toast } from '../../../support/next';
import { renderWithProviders } from '../../../support/render';
import type { BookingOffer } from '@/components/conversation/types';

const TOKEN = 'conversation-1.signature';
const CHECKOUT_URL = 'https://checkout.stripe.com/c/pay/cs_test_123';

const offer: BookingOffer = {
  id: 'offer-1',
  status: 'PENDING',
  title: 'Rosa fineline no antebraço',
  scheduledAt: '2026-11-10T17:00:00.000Z',
  duration: 150,
  price: 80000,
  depositAmount: 20000,
  paymentInProgress: false,
  expired: false,
};

type PayResult = { data?: { checkoutUrl: string }; error?: string };

const payBookingOffer = mock(
  async (_token: string): Promise<PayResult> => ({ data: { checkoutUrl: CHECKOUT_URL } }),
);

mock.module('@/app/(public)/_actions/pay-booking-offer', () => ({ payBookingOffer }));

const { BookingOfferCard } = await import(
  '@/app/(public)/pedido/[token]/_components/booking-offer-card'
);

describe('BookingOfferCard', () => {
  const assign = spyOn(window.location, 'assign').mockImplementation(() => undefined);
  const onPaymentFailed = mock(async () => undefined);

  beforeEach(() => {
    resetNextMocks();
    assign.mockClear();
    onPaymentFailed.mockClear();
    payBookingOffer.mockClear();
    payBookingOffer.mockImplementation(async () => ({ data: { checkoutUrl: CHECKOUT_URL } }));
  });

  afterEach(() => {
    assign.mockClear();
  });

  it('shows the offer details in the studio time zone', () => {
    renderWithProviders(
      <BookingOfferCard token={TOKEN} offer={offer} onPaymentFailed={onPaymentFailed} />,
    );

    expect(screen.getByText('Rosa fineline no antebraço')).toBeInTheDocument();
    expect(screen.getByText(/10 de novembro às 14:00/)).toBeInTheDocument();
    expect(screen.getByText('2h30')).toBeInTheDocument();
    expect(screen.getByText(/800,00/)).toBeInTheDocument();
    expect(screen.getByText(/600,00/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pagar sinal de R\$\s200,00/ })).toBeEnabled();
  });

  it('redirects to the checkout when paying the deposit', async () => {
    const { user } = renderWithProviders(
      <BookingOfferCard token={TOKEN} offer={offer} onPaymentFailed={onPaymentFailed} />,
    );

    await user.click(screen.getByRole('button', { name: /Pagar sinal/ }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith(CHECKOUT_URL));
    expect(payBookingOffer).toHaveBeenCalledWith(TOKEN, expect.anything());
    expect(screen.getByRole('button', { name: /Pagar sinal/ })).toBeDisabled();
  });

  it('shows the error and refreshes the conversation when the slot is taken', async () => {
    payBookingOffer.mockImplementationOnce(async () => ({
      error: 'Este horário não está mais disponível.',
    }));
    const { user } = renderWithProviders(
      <BookingOfferCard token={TOKEN} offer={offer} onPaymentFailed={onPaymentFailed} />,
    );

    await user.click(screen.getByRole('button', { name: /Pagar sinal/ }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Este horário não está mais disponível.'),
    );
    expect(onPaymentFailed).toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });

  it('blocks a new payment while one is in progress', () => {
    renderWithProviders(
      <BookingOfferCard
        token={TOKEN}
        offer={{ ...offer, paymentInProgress: true }}
        onPaymentFailed={onPaymentFailed}
      />,
    );

    expect(screen.getByText(/Há um pagamento em andamento/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pagar sinal/ })).toBeDisabled();
  });

  it('shows the confirmed booking once the deposit is paid', () => {
    renderWithProviders(
      <BookingOfferCard
        token={TOKEN}
        offer={{ ...offer, status: 'PAID' }}
        onPaymentFailed={onPaymentFailed}
      />,
    );

    expect(screen.getByText('Agendamento confirmado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pagar sinal/ })).not.toBeInTheDocument();
  });

  it('hides the payment once the offer time has passed', () => {
    renderWithProviders(
      <BookingOfferCard
        token={TOKEN}
        offer={{ ...offer, expired: true }}
        onPaymentFailed={onPaymentFailed}
      />,
    );

    expect(screen.getByText(/O horário desta proposta já passou/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pagar sinal/ })).not.toBeInTheDocument();
  });

  it('tells the client when the artist cancels the booking', () => {
    renderWithProviders(
      <BookingOfferCard
        token={TOKEN}
        offer={{ ...offer, status: 'CANCELLED' }}
        onPaymentFailed={onPaymentFailed}
      />,
    );

    expect(screen.getByText('Agendamento cancelado')).toBeInTheDocument();
    expect(screen.getByText(/sinal pago foi reembolsado/)).toBeInTheDocument();
    expect(screen.queryByText('Restante no estúdio')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pagar sinal/ })).not.toBeInTheDocument();
  });
});
