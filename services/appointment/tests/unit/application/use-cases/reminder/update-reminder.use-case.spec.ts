import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateReminderUseCase } from '@/application/use-cases/reminder/update-reminder.use-case';
import { InvalidReminderError, ReminderNotFoundError } from '@/domain/errors/reminder.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { buildReminder } from '@tests/unit/support/builders';
import { createReminderRepositoryMock } from '@tests/unit/support/mocks';

describe('UpdateReminderUseCase', () => {
  let reminders: ReturnType<typeof createReminderRepositoryMock>;
  let useCase: UpdateReminderUseCase;

  beforeEach(() => {
    reminders = createReminderRepositoryMock();
    useCase = new UpdateReminderUseCase(reminders);
  });

  it('updates the description of an existing reminder', async () => {
    const reminder = buildReminder({ id: 'reminder-1' });
    reminders.findById = async () => reminder;

    const result = await useCase.execute({
      reminderId: 'reminder-1',
      userId: 'user-1',
      description: 'Comprar agulhas 5RL',
    });

    expect(result).toMatchObject({
      id: 'reminder-1',
      description: 'Comprar agulhas 5RL',
      userId: 'user-1',
      createdAt: reminder.createdAt,
    });
    expect(reminders.update).toHaveBeenCalledTimes(1);
  });

  it('throws InvalidReminderError when the new description is empty', async () => {
    reminders.findById = async () => buildReminder({ id: 'reminder-1' });

    await expect(
      useCase.execute({ reminderId: 'reminder-1', userId: 'user-1', description: '  ' }),
    ).rejects.toThrow(InvalidReminderError);
    expect(reminders.update).not.toHaveBeenCalled();
  });

  it('throws ReminderNotFoundError when the reminder does not exist', async () => {
    reminders.findById = async () => null;

    await expect(
      useCase.execute({ reminderId: 'missing-reminder', userId: 'user-1', description: 'Novo' }),
    ).rejects.toThrow(ReminderNotFoundError);
  });

  it('throws ForbiddenResourceAccessError when the reminder belongs to another user', async () => {
    reminders.findById = async () => buildReminder({ id: 'reminder-1', userId: 'user-1' });

    await expect(
      useCase.execute({ reminderId: 'reminder-1', userId: 'user-2', description: 'Novo' }),
    ).rejects.toThrow(ForbiddenResourceAccessError);
    expect(reminders.update).not.toHaveBeenCalled();
  });
});
