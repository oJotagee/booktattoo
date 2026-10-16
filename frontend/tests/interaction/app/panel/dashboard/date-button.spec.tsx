import { beforeEach, describe, expect, it } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import { resetNextMocks, router, setPathname, setSearchParams } from '../../../support/next';
import { renderWithProviders } from '../../../support/render';

const { DateButton } = await import('@/app/(panel)/dashboard/_components/day-agenda/date-button');

describe('DateButton', () => {
  beforeEach(() => {
    resetNextMocks();
    setPathname('/dashboard');
  });

  it('shows the selected date', () => {
    renderWithProviders(<DateButton date="2026-10-16" />);

    expect(screen.getByRole('button', { name: 'Escolher data da agenda' })).toHaveTextContent(
      '16/10/2026',
    );
  });

  it('opens the calendar on the selected month and navigates to the picked day', async () => {
    setSearchParams('page=2');
    const { user } = renderWithProviders(<DateButton date="2026-10-16" />);

    await user.click(screen.getByRole('button', { name: 'Escolher data da agenda' }));

    expect(await screen.findByText(/outubro 2026/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /20 de outubro de 2026/i }));

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith('/dashboard?page=2&date=2026-10-20', {
        scroll: false,
      }),
    );
  });
});
