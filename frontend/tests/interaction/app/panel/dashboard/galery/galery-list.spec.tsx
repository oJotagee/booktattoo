import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen, within } from '@testing-library/react';

import { resetNextMocks, router, setPathname, setSearchParams } from '../../../../support/next';
import { renderWithProviders } from '../../../../support/render';
import { buildGalery } from '../../../../support/builders';

mock.module('@/app/(panel)/dashboard/galery/_actions/update-galery-availability', () => ({
  updateGaleryAvailability: mock(async () => ({ data: 'ok' })),
}));

const { GaleryList } = await import('@/app/(panel)/dashboard/galery/_components/galery-list');

const galeries = [
  buildGalery({ id: 'galery-1', title: 'Rosa Tradicional' }),
  buildGalery({ id: 'galery-2', title: 'Cobra Japonesa', style: 'JAPONES' }),
];

function buildPagination(overrides = {}) {
  return { total: 25, page: 2, perPage: 10, totalPages: 3, ...overrides };
}

function getChips() {
  return within(screen.getByRole('group', { name: 'Filtrar por estilo' }));
}

describe('GaleryList', () => {
  beforeEach(() => {
    resetNextMocks();
    setPathname('/dashboard/galery');
  });

  it('renders a card per flash and the new flash link', () => {
    renderWithProviders(
      <GaleryList canCreate galeries={galeries} pagination={buildPagination()} />,
    );

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Novo flash' })).toHaveAttribute(
      'href',
      '/dashboard/galery/new',
    );
  });

  it('disables the new flash button when the plan does not allow creating', () => {
    renderWithProviders(
      <GaleryList canCreate={false} galeries={galeries} pagination={buildPagination()} />,
    );

    const button = screen.getByRole('button', { name: 'Novo flash' });
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('href');
  });

  it('marks the active style chip', () => {
    renderWithProviders(
      <GaleryList canCreate galeries={galeries} pagination={buildPagination()} style="JAPONES" />,
    );

    expect(getChips().getByRole('button', { name: 'Japonês' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(getChips().getByRole('button', { name: 'Todos' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('filters by style and resets the page when a chip is clicked', async () => {
    setSearchParams('page=2');
    const { user } = renderWithProviders(
      <GaleryList canCreate galeries={galeries} pagination={buildPagination()} />,
    );

    await user.click(getChips().getByRole('button', { name: 'Blackwork' }));

    expect(router.push).toHaveBeenCalledWith('/dashboard/galery?style=BLACKWORK');
  });

  it('clears the style filter when "Todos" is clicked', async () => {
    setSearchParams('style=JAPONES&page=3');
    const { user } = renderWithProviders(
      <GaleryList canCreate galeries={galeries} pagination={buildPagination()} style="JAPONES" />,
    );

    await user.click(getChips().getByRole('button', { name: 'Todos' }));

    expect(router.push).toHaveBeenCalledWith('/dashboard/galery?');
  });

  it('filters by style through the mobile select', async () => {
    const { user } = renderWithProviders(
      <GaleryList canCreate galeries={galeries} pagination={buildPagination()} />,
    );

    const select = screen.getByRole('combobox', { name: 'Filtrar por estilo' });
    expect(select).toHaveTextContent('Todos os estilos');

    await user.click(select);
    await user.click(await screen.findByRole('option', { name: 'Realismo' }));

    expect(router.push).toHaveBeenCalledWith('/dashboard/galery?style=REALISMO');
  });

  it('shows the range and navigates between pages keeping the style filter', async () => {
    setSearchParams('style=JAPONES&page=2');
    const { user } = renderWithProviders(
      <GaleryList canCreate galeries={galeries} pagination={buildPagination()} style="JAPONES" />,
    );

    expect(screen.getByText('11–20 de 25')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(router.push).toHaveBeenLastCalledWith('/dashboard/galery?style=JAPONES&page=3');

    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(router.push).toHaveBeenLastCalledWith('/dashboard/galery?style=JAPONES&page=1');
  });

  it('disables the previous button on the first page and next on the last', () => {
    const { rerender } = renderWithProviders(
      <GaleryList canCreate galeries={galeries} pagination={buildPagination({ page: 1 })} />,
    );

    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeEnabled();

    rerender(
      <GaleryList canCreate galeries={galeries} pagination={buildPagination({ page: 3 })} />,
    );

    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
  });

  it('shows the empty state without pagination', () => {
    renderWithProviders(
      <GaleryList
        canCreate
        galeries={[]}
        pagination={buildPagination({ total: 0, page: 1, totalPages: 0 })}
      />,
    );

    expect(screen.getByText('Nenhum flash cadastrado.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Próxima página' })).toBeNull();
  });

  it('mentions the active style in the empty state', () => {
    renderWithProviders(
      <GaleryList
        canCreate
        galeries={[]}
        pagination={buildPagination({ total: 0, page: 1, totalPages: 0 })}
        style="CHICANO"
      />,
    );

    expect(screen.getByText('Nenhum flash Chicano cadastrado.')).toBeInTheDocument();
  });
});
