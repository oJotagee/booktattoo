import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateReminderUseCase } from '@/application/use-cases/reminder/create-reminder.use-case';
import { InvalidReminderError } from '@/domain/errors/reminder.error';
import { createReminderRepositoryMock } from '@tests/unit/support/mocks';

const input = {
  userId: 'user-1',
  description: 'Comprar agulhas 3RL',
};

describe('CreateReminderUseCase', () => {
  let reminders: ReturnType<typeof createReminderRepositoryMock>;
  let useCase: CreateReminderUseCase;

  beforeEach(() => {
    reminders = createReminderRepositoryMock();
    useCase = new CreateReminderUseCase(reminders);
  });

  it('creates a reminder for the given user', async () => {
    const result = await useCase.execute(input);

    expect(result).toMatchObject({
      userId: 'user-1',
      description: 'Comprar agulhas 3RL',
    });
    expect(result.id).toBeString();
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('persists the reminder', async () => {
    await useCase.execute(input);

    expect(reminders.create).toHaveBeenCalledTimes(1);
  });

  it('throws InvalidReminderError when the description is empty', async () => {
    await expect(useCase.execute({ ...input, description: '   ' })).rejects.toThrow(
      InvalidReminderError,
    );
    expect(reminders.create).not.toHaveBeenCalled();
  });
});
