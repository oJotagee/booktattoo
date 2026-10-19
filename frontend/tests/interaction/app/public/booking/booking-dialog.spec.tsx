import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { resetNextMocks, toast } from '../../../support/next';
import { renderWithProviders } from '../../../support/render';
import type { PublicGalery } from '@/app/(public)/_data-access/get-all-public-galeries';

type ActionResult = { data?: { appointmentId: string; checkoutUrl: string }; error?: string };

const FUTURE_DATE = '2030-01-15';

const getPublicArtist = mock(async (_id: string) => ({
  id: 'user-1',
  name: 'Ana Lima',
  image: null,
  bio: null,
  role: 'Tradicional',
  status: 'ACTIVE',
  times: ['09:00', '09:30', '10:00', '10:30'],
  paymentsEnabled: true,
}));

const getPublicGalery = mock(async (_id: string) => ({
  ...galery,
  available: true,
  service: { duration: 60, depositAmount: 8000 },
}));

const getBlockedTimes = mock(async (_input: { artistId: string; date: string }) => ['10:00']);

const createBooking = mock(
  async (_input: Record<string, string>): Promise<ActionResult> => ({ error: 'Horário ocupado' }),
);

mock.module('@/app/(public)/_data-access/get-public-artist', () => ({ getPublicArtist }));
mock.module('@/app/(public)/_data-access/get-public-galery', () => ({ getPublicGalery }));
mock.module('@/app/(public)/_data-access/get-blocked-times', () => ({ getBlockedTimes }));
mock.module('@/app/(public)/_actions/create-booking', () => ({ createBooking }));

const { BookingDialog } = await import('@/app/(public)/_components/booking/booking-dialog');

const galery: PublicGalery = {
  id: 'galery-1',
  title: 'Rosa Tradicional',
  imageUrl: 'https://bucket/gallery/rosa.png',
  size: '6 cm',
  price: 28000,
  style: 'TRADICIONAL' as PublicGalery['style'],
  userId: 'user-1',
  artistName: 'Ana Lima',
  serviceId: 'service-1',
};

function renderDialog() {
  return renderWithProviders(<BookingDialog galery={galery} open onOpenChange={() => undefined} />);
}

async function fillStepOne(user: ReturnType<typeof renderDialog>['user']) {
  fireEvent.change(await screen.findByLabelText('Data'), { target: { value: FUTURE_DATE } });
  await user.click(await screen.findByRole('button', { name: '09:00' }));
  await user.type(screen.getByLabelText('Nome completo'), 'Mariana Costa');
  await user.type(screen.getByLabelText('E-mail'), 'mariana@email.com');
  await user.type(screen.getByLabelText('Telefone'), '11999999999');
}

describe('BookingDialog', () => {
  beforeEach(() => {
    resetNextMocks();
    getBlockedTimes.mockClear();
    createBooking.mockClear();
  });

  it('shows the first step with the flash summary', async () => {
    renderDialog();

    expect(screen.getByText('Passo 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('Data, horário e seus dados')).toBeInTheDocument();
    expect(screen.getByText('Rosa Tradicional')).toBeInTheDocument();
    expect(await screen.findByText('Escolha uma data para ver os horários.')).toBeInTheDocument();
  });

  it('blocks booking while the artist cannot receive deposits', async () => {
    getPublicArtist.mockImplementationOnce(async (_id: string) => ({
      id: 'user-1',
      name: 'Ana Lima',
      image: null,
      bio: null,
      role: 'Tradicional',
      status: 'ACTIVE',
      times: ['09:00', '09:30', '10:00', '10:30'],
      paymentsEnabled: false,
    }));

    renderDialog();

    expect(
      await screen.findByText('Este tatuador não está recebendo agendamentos no momento.'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Data')).not.toBeInTheDocument();
  });

  it('disables taken slots and slots without room for the flash duration', async () => {
    renderDialog();

    fireEvent.change(await screen.findByLabelText('Data'), { target: { value: FUTURE_DATE } });

    await waitFor(() =>
      expect(getBlockedTimes).toHaveBeenCalledWith({ artistId: 'user-1', date: FUTURE_DATE }),
    );
    expect(await screen.findByRole('button', { name: '09:00' })).toBeEnabled();
    // 09:30 + 60min precisaria de 10:00, que está ocupado
    expect(screen.getByRole('button', { name: '09:30' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '10:00' })).toBeDisabled();
    // 10:30 é o último slot e não comporta 60min
    expect(screen.getByRole('button', { name: '10:30' })).toBeDisabled();
  });

  it('keeps the continue button disabled until the form is complete', async () => {
    const { user } = renderDialog();
    const continueButton = await screen.findByRole('button', { name: /Continuar para pagamento/ });

    expect(continueButton).toBeDisabled();

    await fillStepOne(user);

    await waitFor(() => expect(continueButton).toBeEnabled());
  });

  it('goes to the payment step with the deposit and back keeping the data', async () => {
    const { user } = renderDialog();

    await fillStepOne(user);
    await user.click(screen.getByRole('button', { name: /Continuar para pagamento/ }));

    expect(await screen.findByText('Pagamento do sinal')).toBeInTheDocument();
    expect(screen.getByText('Passo 2 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pagar sinal R\$\s80,00/ })).toBeInTheDocument();
    expect(screen.getByText(/Restante R\$\s200,00 pago no estúdio/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(await screen.findByText('Data, horário e seus dados')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Mariana Costa');
    expect(screen.getByRole('button', { name: '09:00' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows the API error when the booking fails', async () => {
    const { user } = renderDialog();

    await fillStepOne(user);
    await user.click(screen.getByRole('button', { name: /Continuar para pagamento/ }));
    await user.click(await screen.findByRole('button', { name: /Pagar sinal/ }));

    await waitFor(() =>
      expect(createBooking).toHaveBeenCalledWith(
        {
          date: FUTURE_DATE,
          time: '09:00',
          name: 'Mariana Costa',
          email: 'mariana@email.com',
          phone: '(11) 99999-9999',
          artistId: 'user-1',
          galeryId: 'galery-1',
        },
        expect.anything(),
      ),
    );
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Horário ocupado'));
  });
});
