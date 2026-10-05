import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { FindRemindersByUserUseCase } from '@/application/use-cases/reminder/find-reminders-by-user.use-case';
import { buildReminder } from '@tests/unit/support/builders';
import { createReminderRepositoryMock } from '@tests/unit/support/mocks';

describe('FindRemindersByUserUseCase', () => {
  let reminders: ReturnType<typeof createReminderRepositoryMock>;
  let useCase: FindRemindersByUserUseCase;

  beforeEach(() => {
    reminders = createReminderRepositoryMock();
    useCase = new FindRemindersByUserUseCase(reminders);
  });

  it('returns the paginated reminders belonging to the user', async () => {
    const reminderA = buildReminder({ id: 'reminder-1', description: 'Comprar agulhas' });
    const reminderB = buildReminder({ id: 'reminder-2', description: 'Limpar a maca' });
    reminders.findByUserId = async () => ({ items: [reminderA, reminderB], total: 2 });

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.list).toHaveLength(2);
    expect(result.list.map((reminder) => reminder.id)).toEqual(['reminder-1', 'reminder-2']);
    expect(result.pagination.total).toBe(2);
  });

  it('returns an empty page when the user has no reminders', async () => {
    const result = await useCase.execute({ userId: 'user-without-reminders' });

    expect(result.list).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('defaults limit and offset when not provided', async () => {
    const findByUserId = mock(async () => ({ items: [], total: 0 }));
    reminders.findByUserId = findByUserId;

    await useCase.execute({ userId: 'user-1' });

    expect(findByUserId).toHaveBeenCalledWith({ userId: 'user-1', limit: 10, offset: 0 });
  });

  it('forwards the given limit and offset', async () => {
    const findByUserId = mock(async () => ({ items: [], total: 0 }));
    reminders.findByUserId = findByUserId;

    await useCase.execute({ userId: 'user-1', limit: 5, offset: 15 });

    expect(findByUserId).toHaveBeenCalledWith({ userId: 'user-1', limit: 5, offset: 15 });
  });

  it('computes page and totalPages from limit, offset and total', async () => {
    reminders.findByUserId = async () => ({ items: [buildReminder()], total: 23 });

    const result = await useCase.execute({ userId: 'user-1', limit: 10, offset: 20 });

    expect(result.pagination).toEqual({ total: 23, page: 3, perPage: 10, totalPages: 3 });
  });
});
