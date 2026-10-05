import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import { resetNextMocks, toast } from '../../../../support/next';
import { renderWithProviders } from '../../../../support/render';
import { buildGalery } from '../../../../support/builders';

const deleteGalery = mock(
  async (_id: string): Promise<{ data?: string; error?: string }> => ({ data: 'galery-1' }),
);

mock.module('@/app/(panel)/dashboard/galery/_actions/delete-galery', () => ({
  deleteGalery,
}));

const { GaleryCard } = await import('@/app/(panel)/dashboard/galery/_components/galery-card');

describe('GaleryCard', () => {
  beforeEach(() => {
    resetNextMocks();
    deleteGalery.mockClear();
    deleteGalery.mockImplementation(async () => ({ data: 'galery-1' }));
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
    expect(screen.queryByText('Indisponível')).toBeNull();
    expect(screen.queryByRole('switch')).toBeNull();
  });

  it('marks unavailable flashes', () => {
    renderWithProviders(<GaleryCard galery={buildGalery({ available: false })} />);

    expect(screen.getByRole('img', { name: 'Rosa Tradicional' })).toHaveClass('grayscale');
    expect(screen.getByText('Indisponível')).toBeInTheDocument();
  });

  it('asks for confirmation before deleting the flash', async () => {
    const { user } = renderWithProviders(<GaleryCard galery={buildGalery()} />);

    await user.click(screen.getByRole('button', { name: 'Excluir Rosa Tradicional' }));

    expect(screen.getByRole('dialog', { name: 'Excluir item' })).toBeInTheDocument();
    expect(deleteGalery).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(deleteGalery).not.toHaveBeenCalled();
  });

  it('deletes the flash after confirming', async () => {
    const { user } = renderWithProviders(<GaleryCard galery={buildGalery()} />);

    await user.click(screen.getByRole('button', { name: 'Excluir Rosa Tradicional' }));
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(deleteGalery).toHaveBeenCalledWith('galery-1', expect.anything());
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Item excluído com sucesso'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('keeps the dialog open and shows the error when the delete fails', async () => {
    deleteGalery.mockImplementation(async () => ({ error: 'Falhou' }));
    const { user } = renderWithProviders(<GaleryCard galery={buildGalery()} />);

    await user.click(screen.getByRole('button', { name: 'Excluir Rosa Tradicional' }));
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Falhou'));
    expect(screen.getByRole('dialog', { name: 'Excluir item' })).toBeInTheDocument();
  });

  it('shows a generic error when the request throws', async () => {
    deleteGalery.mockImplementation(async () => {
      throw new Error('Network');
    });
    const { user } = renderWithProviders(<GaleryCard galery={buildGalery()} />);

    await user.click(screen.getByRole('button', { name: 'Excluir Rosa Tradicional' }));
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Não foi possível excluir o item'),
    );
  });
});
