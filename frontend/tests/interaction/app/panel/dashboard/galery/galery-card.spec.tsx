import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import { resetNextMocks, toast } from '../../../../support/next';
import { renderWithProviders } from '../../../../support/render';
import { buildGalery } from '../../../../support/builders';

const updateGaleryAvailability = mock(
  async (_input: {
    id: string;
    available: boolean;
  }): Promise<{ data?: string; error?: string }> => ({
    data: 'ok',
  }),
);

mock.module('@/app/(panel)/dashboard/galery/_actions/update-galery-availability', () => ({
  updateGaleryAvailability,
}));

const { GaleryCard } = await import('@/app/(panel)/dashboard/galery/_components/galery-card');

describe('GaleryCard', () => {
  beforeEach(() => {
    resetNextMocks();
    updateGaleryAvailability.mockClear();
    updateGaleryAvailability.mockImplementation(async () => ({ data: 'ok' }));
  });

  it('shows the flash details, style badge and edit link', () => {
    renderWithProviders(<GaleryCard galery={buildGalery()} />);

    expect(screen.getByRole('heading', { name: 'Rosa Tradicional' })).toBeInTheDocument();
    expect(screen.getByText('10x15cm')).toBeInTheDocument();
    expect(screen.getByText('R$ 280,00')).toBeInTheDocument();
    expect(screen.getByText('Tradicional')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar Rosa Tradicional' })).toHaveAttribute(
      'href',
      '/dashboard/galery/edit/galery-1',
    );
    expect(screen.queryByText('Indisponível', { selector: 'span.uppercase' })).toBeNull();
  });

  it('marks unavailable flashes', () => {
    renderWithProviders(<GaleryCard galery={buildGalery({ available: false })} />);

    expect(screen.getByRole('img', { name: 'Rosa Tradicional' })).toHaveClass('grayscale');
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('marks the flash as unavailable when toggling the switch', async () => {
    const { user } = renderWithProviders(<GaleryCard galery={buildGalery()} />);

    await user.click(screen.getByRole('switch', { name: 'Marcar como indisponível' }));

    expect(updateGaleryAvailability).toHaveBeenCalledWith(
      { id: 'galery-1', available: false },
      expect.anything(),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Flash indisponível'));
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('reverts the switch and shows the error when the update fails', async () => {
    updateGaleryAvailability.mockImplementation(async () => ({ error: 'Falhou' }));
    const { user } = renderWithProviders(<GaleryCard galery={buildGalery()} />);

    await user.click(screen.getByRole('switch'));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Falhou'));
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('reverts the switch when the request throws', async () => {
    updateGaleryAvailability.mockImplementation(async () => {
      throw new Error('Network');
    });
    const { user } = renderWithProviders(<GaleryCard galery={buildGalery({ available: false })} />);

    await user.click(screen.getByRole('switch'));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Não foi possível atualizar a disponibilidade do flash',
      ),
    );
    expect(screen.getByRole('switch')).not.toBeChecked();
  });
});
