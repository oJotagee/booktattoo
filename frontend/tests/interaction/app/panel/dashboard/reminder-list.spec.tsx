import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen, waitFor } from '@testing-library/react';

import { resetNextMocks, toast } from '../../../support/next';
import { renderWithProviders } from '../../../support/render';
import { buildReminder } from '../../../support/builders';

type ActionResult = { data?: unknown; error?: string };

const createReminder = mock(
  async (_input: { description: string }): Promise<ActionResult> => ({ data: {} }),
);

const deleteReminder = mock(async (_id: string): Promise<ActionResult> => ({ data: 'ok' }));

mock.module('@/app/(panel)/dashboard/_actions/create-reminder', () => ({ createReminder }));
mock.module('@/app/(panel)/dashboard/_actions/delete-reminder', () => ({ deleteReminder }));

const { ReminderList } = await import('@/app/(panel)/dashboard/_components/reminder-list');

describe('ReminderList', () => {
  beforeEach(() => {
    resetNextMocks();
    createReminder.mockClear();
    createReminder.mockImplementation(async () => ({ data: {} }));
  });

  it('lists the reminders', () => {
    renderWithProviders(
      <ReminderList
        reminders={[
          buildReminder({ id: 'reminder-1', description: 'Enviar confirmação para Mariana' }),
          buildReminder({ id: 'reminder-2', description: 'Comprar agulhas 3RL' }),
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Lembretes' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Enviar confirmação para Mariana')).toBeInTheDocument();
    expect(screen.getByText('Comprar agulhas 3RL')).toBeInTheDocument();
  });

  it('shows an empty state when there are no reminders', () => {
    renderWithProviders(<ReminderList reminders={[]} />);

    expect(screen.getByText('Nenhum lembrete cadastrado.')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).toBeNull();
  });

  it('opens the dialog when clicking the plus button', async () => {
    const { user } = renderWithProviders(<ReminderList reminders={[]} />);

    await user.click(screen.getByRole('button', { name: 'Novo lembrete' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Novo Lembrete')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toHaveValue('');
  });

  it('shows the validation error and does not submit an empty description', async () => {
    const { user } = renderWithProviders(<ReminderList reminders={[]} />);

    await user.click(screen.getByRole('button', { name: 'Novo lembrete' }));
    await user.click(await screen.findByRole('button', { name: 'Cadastrar Lembrete' }));

    expect(await screen.findByText('Descrição é obrigatória')).toBeInTheDocument();
    expect(createReminder).not.toHaveBeenCalled();
  });

  it('creates the reminder and closes the dialog', async () => {
    const { user } = renderWithProviders(<ReminderList reminders={[]} />);

    await user.click(screen.getByRole('button', { name: 'Novo lembrete' }));
    await user.type(await screen.findByLabelText('Descrição'), 'Comprar agulhas 3RL');
    await user.click(screen.getByRole('button', { name: 'Cadastrar Lembrete' }));

    await waitFor(() =>
      expect(createReminder).toHaveBeenCalledWith(
        { description: 'Comprar agulhas 3RL' },
        expect.anything(),
      ),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Lembrete criado com sucesso'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('keeps the dialog open and shows the error when the API fails', async () => {
    createReminder.mockImplementation(async () => ({ error: 'Não foi possível criar o lembrete' }));
    const { user } = renderWithProviders(<ReminderList reminders={[]} />);

    await user.click(screen.getByRole('button', { name: 'Novo lembrete' }));
    await user.type(await screen.findByLabelText('Descrição'), 'Comprar agulhas 3RL');
    await user.click(screen.getByRole('button', { name: 'Cadastrar Lembrete' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Não foi possível criar o lembrete'),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
