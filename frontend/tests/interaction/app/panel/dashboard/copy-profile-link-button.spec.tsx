import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import { resetNextMocks, toast } from '../../../support/next';
import { renderWithProviders } from '../../../support/render';

let session: { user: { id: string } } | null = { user: { id: 'user-1' } };

mock.module('next-auth/react', () => ({
  useSession: () => ({ data: session }),
}));

const { CopyProfileLinkButton } = await import(
  '@/app/(panel)/dashboard/_components/copy-profile-link-button'
);

const writeText = mock(async (_text: string) => undefined);

describe('CopyProfileLinkButton', () => {
  beforeEach(() => {
    resetNextMocks();
    writeText.mockClear();
    writeText.mockImplementation(async () => undefined);
    session = { user: { id: 'user-1' } };
  });

  it('copies the public artist page link', async () => {
    const { user } = renderWithProviders(<CopyProfileLinkButton />);
    mockClipboard();

    await user.click(screen.getByRole('button', { name: /Copiar o link/ }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/user-1`));
    expect(toast.success).toHaveBeenCalledWith('Link copiado! Envie para seus clientes agendarem.');
    expect(screen.getByText('Link copiado')).toBeInTheDocument();
  });

  it('shows the link when the clipboard is not available', async () => {
    writeText.mockImplementation(async () => {
      throw new Error('denied');
    });
    const { user } = renderWithProviders(<CopyProfileLinkButton />);
    mockClipboard();

    await user.click(screen.getByRole('button', { name: /Copiar o link/ }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        `Não foi possível copiar automaticamente. Seu link: ${window.location.origin}/user-1`,
      ),
    );
  });

  it('stays disabled while the session is loading', () => {
    session = null;

    renderWithProviders(<CopyProfileLinkButton />);

    expect(screen.getByRole('button', { name: /Copiar o link/ })).toBeDisabled();
  });
});

// O userEvent.setup() instala o próprio clipboard; o mock precisa vir depois do render
function mockClipboard() {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
}
