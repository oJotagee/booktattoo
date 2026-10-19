import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { screen, within } from '@testing-library/react';

import { resetNextMocks, setSearchParams } from '../../../support/next';
import { renderWithProviders } from '../../../support/render';
import type { DayAppointment } from '@/app/(panel)/dashboard/_data-access/get-day-appointments';

function buildAppointment(overrides: Partial<DayAppointment> = {}): DayAppointment {
  return {
    id: 'appointment-1',
    clientName: 'Mariana Costa',
    clientEmail: 'mariana@email.com',
    clientPhone: '11999999999',
    scheduledAt: '2026-10-16T12:00:00.000Z',
    time: '09:00',
    duration: 60,
    price: 28000,
    depositAmount: 8000,
    status: 'CONFIRMED',
    galeryId: 'galery-1',
    galeryTitle: 'Rosa Tradicional',
    galeryImageUrl: null,
    paidAt: '2026-10-15T12:00:00.000Z',
    refundedAt: null,
    ...overrides,
  };
}

const getDayAppointments = mock(
  async (_input: { date: string }): Promise<DayAppointment[]> => [
    buildAppointment(),
    buildAppointment({
      id: 'appointment-2',
      clientName: 'Rafael Lima',
      time: '14:00',
      duration: 30,
      status: 'PENDING',
      galeryTitle: 'Espada Medieval',
      paidAt: null,
    }),
  ],
);

const cancelAppointment = mock(async (_id: string) => ({ data: 'appointment-1' }));

mock.module('@/app/(panel)/dashboard/_data-access/get-day-appointments', () => ({
  getDayAppointments,
}));
mock.module('@/app/(panel)/dashboard/_actions/cancel-appointment', () => ({ cancelAppointment }));

const { DayAgendaList } = await import(
  '@/app/(panel)/dashboard/_components/day-agenda/day-agenda-list'
);

const TIMES = ['09:00', '09:30', '10:00', '14:00'];
const FUTURE_DATE = '2030-01-15';
const PAST_DATE = '2020-01-15';

describe('DayAgendaList', () => {
  beforeEach(() => {
    resetNextMocks();
    getDayAppointments.mockClear();
  });

  it('loads the appointments of the date in the URL', async () => {
    setSearchParams(`date=${FUTURE_DATE}`);

    renderWithProviders(<DayAgendaList times={TIMES} />);

    expect(await screen.findByText('Mariana Costa')).toBeInTheDocument();
    expect(getDayAppointments).toHaveBeenCalledWith({ date: FUTURE_DATE });
    expect(screen.getByText('15/01/2030')).toBeInTheDocument();
  });

  it('keeps every slot and marks the ones an appointment spans as reserved', async () => {
    setSearchParams(`date=${FUTURE_DATE}`);

    renderWithProviders(<DayAgendaList times={TIMES} />);

    await screen.findByText('Mariana Costa');
    const rows = screen.getAllByRole('listitem');

    // 09:00 (1h) ocupa também 09:30; 10:00 fica livre; 14:00 é o pendente
    expect(rows).toHaveLength(TIMES.length);
    expect(within(rows[0]).getByText('09:00')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Confirmado')).toBeInTheDocument();
    expect(within(rows[0]).getByText(/09:00 – 10:00/)).toBeInTheDocument();
    expect(within(rows[1]).getByText('09:30')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Reservado · Mariana Costa')).toBeInTheDocument();
    expect(within(rows[2]).getByText('10:00')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Livre')).toBeInTheDocument();
    expect(within(rows[3]).getByText('Rafael Lima')).toBeInTheDocument();
    expect(within(rows[3]).getByText('Pendente')).toBeInTheDocument();
  });

  it('opens the details from a reserved slot too', async () => {
    setSearchParams(`date=${FUTURE_DATE}`);
    const { user } = renderWithProviders(<DayAgendaList times={TIMES} />);

    await user.click(
      await screen.findByRole('button', {
        name: 'Ver agendamento de Mariana Costa (horário 09:30)',
      }),
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('opens the appointment details', async () => {
    setSearchParams(`date=${FUTURE_DATE}`);
    const { user } = renderWithProviders(<DayAgendaList times={TIMES} />);

    await user.click(
      await screen.findByRole('button', { name: 'Ver agendamento de Mariana Costa' }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('mariana@email.com')).toBeInTheDocument();
    expect(within(dialog).getByText('(11) 99999-9999')).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Cancelar agendamento' }),
    ).toBeInTheDocument();
  });

  it('marks free slots of a past day as closed and explains why', async () => {
    setSearchParams(`date=${PAST_DATE}`);

    renderWithProviders(<DayAgendaList times={TIMES} />);

    await screen.findByText('Mariana Costa');
    const rows = screen.getAllByRole('listitem');

    expect(
      screen.getByText('Este dia já passou — os horários livres não podem mais ser agendados.'),
    ).toBeInTheDocument();
    expect(within(rows[2]).getByText('Encerrado')).toBeInTheDocument();
    expect(
      within(rows[2]).getByText('Horário encerrado — não é possível agendar'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Livre')).toBeNull();
    expect(within(rows[0]).getByText('Confirmado')).toBeInTheDocument();
  });

  it('shows the reserved slots by default and lets the artist collapse them', async () => {
    setSearchParams(`date=${FUTURE_DATE}`);
    const { user } = renderWithProviders(<DayAgendaList times={TIMES} />);

    await screen.findByText('Mariana Costa');
    const toggle = screen.getByRole('button', {
      name: 'Recolher horários reservados de Mariana Costa',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveTextContent('1 horário');
    expect(screen.getByText('Reservado · Mariana Costa')).toBeInTheDocument();

    await user.click(toggle);

    expect(screen.queryByText('Reservado · Mariana Costa')).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(TIMES.length - 1);
    const expand = screen.getByRole('button', {
      name: 'Mostrar horários reservados de Mariana Costa',
    });
    expect(expand).toHaveAttribute('aria-expanded', 'false');

    await user.click(expand);

    expect(screen.getByText('Reservado · Mariana Costa')).toBeInTheDocument();
  });

  it('has no collapse button for a single-slot appointment', async () => {
    setSearchParams(`date=${FUTURE_DATE}`);

    renderWithProviders(<DayAgendaList times={TIMES} />);

    await screen.findByText('Rafael Lima');
    expect(screen.queryByRole('button', { name: /horários reservados de Rafael Lima/ })).toBeNull();
  });

  it('asks the artist to set working hours when there are none', async () => {
    getDayAppointments.mockImplementationOnce(async () => []);

    renderWithProviders(<DayAgendaList times={[]} />);

    expect(
      await screen.findByText(
        'Defina seus horários de atendimento no perfil para montar a agenda.',
      ),
    ).toBeInTheDocument();
  });
});
