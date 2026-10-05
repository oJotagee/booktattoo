import { beforeEach, describe, expect, it } from 'bun:test';

import { FindReminderByIdUseCase } from '@/application/use-cases/reminder/find-reminder-by-id.use-case';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { ReminderNotFoundError } from '@/domain/errors/reminder.error';
import { buildReminder } from '@tests/unit/support/builders';
import { createReminderRepositoryMock } from '@tests/unit/support/mocks';

describe('FindReminderByIdUseCase', () => {
  let reminders: ReturnType<typeof createReminderRepositoryMock>;
  let useCase: FindReminderByIdUseCase;

  beforeEach(() => {
    reminders = createReminderRepositoryMock();
    useCase = new FindReminderByIdUseCase(reminders);
  });

  it('returns the reminder data when the reminder exists', async () => {
    const reminder = buildReminder({ id: 'reminder-1' });
    reminders.findById = async () => reminder;

    const result = await useCase.execute({ id: 'reminder-1', userId: 'user-1' });

    expect(result).toEqual({
      id: reminder.id,
      description: reminder.description,
      userId: reminder.userId,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    });
  });

  it('throws ReminderNotFoundError when the reminder does not exist', async () => {
    reminders.findById = async () => null;

    await expect(useCase.execute({ id: 'missing-reminder', userId: 'user-1' })).rejects.toThrow(
      ReminderNotFoundError,
    );
  });

  it('throws ForbiddenResourceAccessError when the reminder belongs to another user', async () => {
    reminders.findById = async () => buildReminder({ id: 'reminder-1', userId: 'user-1' });

    await expect(useCase.execute({ id: 'reminder-1', userId: 'user-2' })).rejects.toThrow(
      ForbiddenResourceAccessError,
    );
  });
});
