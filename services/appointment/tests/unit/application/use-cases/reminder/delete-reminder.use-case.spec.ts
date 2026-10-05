import { beforeEach, describe, expect, it } from 'bun:test';

import { DeleteReminderUseCase } from '@/application/use-cases/reminder/delete-reminder.use-case';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { ReminderNotFoundError } from '@/domain/errors/reminder.error';
import { buildReminder } from '@tests/unit/support/builders';
import { createReminderRepositoryMock } from '@tests/unit/support/mocks';

describe('DeleteReminderUseCase', () => {
  let reminders: ReturnType<typeof createReminderRepositoryMock>;
  let useCase: DeleteReminderUseCase;

  beforeEach(() => {
    reminders = createReminderRepositoryMock();
    useCase = new DeleteReminderUseCase(reminders);
  });

  it('deletes the reminder', async () => {
    reminders.findById = async () => buildReminder({ id: 'reminder-1' });

    await useCase.execute({ id: 'reminder-1', userId: 'user-1' });

    expect(reminders.delete).toHaveBeenCalledWith('reminder-1');
  });

  it('throws ReminderNotFoundError when the reminder does not exist', async () => {
    reminders.findById = async () => null;

    await expect(useCase.execute({ id: 'missing-reminder', userId: 'user-1' })).rejects.toThrow(
      ReminderNotFoundError,
    );
    expect(reminders.delete).not.toHaveBeenCalled();
  });

  it('throws ForbiddenResourceAccessError when the reminder belongs to another user', async () => {
    reminders.findById = async () => buildReminder({ id: 'reminder-1', userId: 'user-1' });

    await expect(useCase.execute({ id: 'reminder-1', userId: 'user-2' })).rejects.toThrow(
      ForbiddenResourceAccessError,
    );
    expect(reminders.delete).not.toHaveBeenCalled();
  });
});
