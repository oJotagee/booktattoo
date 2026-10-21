import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import { resetNextMocks, router, toast } from '../../../support/next';
import { renderWithProviders } from '../../../support/render';

type ActionResult = { data?: { token: string }; error?: string };

const createBookingRequest = mock(
  async (_input: Record<string, string>): Promise<ActionResult> => ({
    data: { token: 'conversation-1.signature' },
  }),
);

mock.module('@/app/(public)/_actions/create-booking-request', () => ({ createBookingRequest }));

const { BookingRequestDialog } = await import(
  '@/app/(public)/_components/booking-request/booking-request-dialog'
);

function renderDialog() {
  return renderWithProviders(
    <BookingRequestDialog
      artistId="user-1"
      artistName="Ana Lima"
      open
      onOpenChange={() => undefined}
    />,
  );
}

async function fillForm(user: ReturnType<typeof renderDialog>['user']) {
  await user.type(screen.getByLabelText('Nome completo'), 'Mariana Costa');
  await user.type(screen.getByLabelText('E-mail'), 'mariana@email.com');
  await user.type(screen.getByLabelText('Telefone'), '11999999999');
  await user.type(screen.getByLabelText('Sua ideia'), 'Quero uma rosa fineline no antebraço.');
}

describe('BookingRequestDialog', () => {
  beforeEach(() => {
    resetNextMocks();
    createBookingRequest.mockClear();
  });

  it('shows the form with the artist name', () => {
    renderDialog();

    expect(screen.getByRole('heading', { name: 'Conversar com Ana Lima' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar pedido' })).toBeDisabled();
  });

  it('formats the phone while typing', async () => {
    const { user } = renderDialog();

    await user.type(screen.getByLabelText('Telefone'), '11999999999');

    expect(screen.getByLabelText('Telefone')).toHaveValue('(11) 99999-9999');
  });

  it('sends the request and opens the conversation', async () => {
    const { user } = renderDialog();

    await fillForm(user);
    const submit = screen.getByRole('button', { name: 'Enviar pedido' });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    await waitFor(() =>
      expect(createBookingRequest).toHaveBeenCalledWith(
        {
          name: 'Mariana Costa',
          email: 'mariana@email.com',
          phone: '(11) 99999-9999',
          message: 'Quero uma rosa fineline no antebraço.',
          artistId: 'user-1',
        },
        expect.anything(),
      ),
    );
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/pedido/conversation-1.signature'));
  });

  it('shows the API error and stays on the dialog', async () => {
    createBookingRequest.mockImplementationOnce(async () => ({
      error: 'Você já tem uma conversa aberta com este tatuador.',
    }));
    const { user } = renderDialog();

    await fillForm(user);
    const submit = screen.getByRole('button', { name: 'Enviar pedido' });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Você já tem uma conversa aberta com este tatuador.',
      ),
    );
    expect(router.push).not.toHaveBeenCalled();
  });
});
