import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import { resetNextMocks, toast } from '../../../support/next';
import { renderWithProviders } from '../../../support/render';
import { buildReminder } from '../../../support/builders';

const deleteReminder = mock(
  async (_id: string): Promise<{ data?: string; error?: string }> => ({ data: 'reminder-1' }),
);

mock.module('@/app/(panel)/dashboard/_actions/delete-reminder', () => ({ deleteReminder }));

const { ReminderItem } = await import('@/app/(panel)/dashboard/_components/reminder-item');

const reminder = buildReminder({ id: 'reminder-1', description: 'Comprar agulhas 3RL' });

describe('ReminderItem', () => {
  beforeEach(() => {
    resetNextMocks();
    deleteReminder.mockClear();
    deleteReminder.mockImplementation(async () => ({ data: 'reminder-1' }));
  });

  it('shows the description and the delete button', () => {
    renderWithProviders(<ReminderItem reminder={reminder} />);

    expect(screen.getByText('Comprar agulhas 3RL')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Excluir lembrete Comprar agulhas 3RL' }),
    ).toBeEnabled();
  });

  it('deletes the reminder when clicking the delete button', async () => {
    const { user } = renderWithProviders(<ReminderItem reminder={reminder} />);

    await user.click(screen.getByRole('button', { name: 'Excluir lembrete Comprar agulhas 3RL' }));

    expect(deleteReminder).toHaveBeenCalledWith('reminder-1', expect.anything());
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Lembrete excluído com sucesso'),
    );
  });

  it('shows the API error when the deletion fails', async () => {
    deleteReminder.mockImplementation(async () => ({ error: 'Usuario não autorizado' }));
    const { user } = renderWithProviders(<ReminderItem reminder={reminder} />);

    await user.click(screen.getByRole('button', { name: 'Excluir lembrete Comprar agulhas 3RL' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Usuario não autorizado'));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('shows a generic error when the request throws', async () => {
    deleteReminder.mockImplementation(async () => {
      throw new Error('Network');
    });
    const { user } = renderWithProviders(<ReminderItem reminder={reminder} />);

    await user.click(screen.getByRole('button', { name: 'Excluir lembrete Comprar agulhas 3RL' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Não foi possível excluir o lembrete'),
    );
  });
});
