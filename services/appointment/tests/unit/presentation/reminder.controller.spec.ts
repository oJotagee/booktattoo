import { describe, expect, it, mock } from 'bun:test';

import type { SessionPayload } from '@bookink/shared/auth';
import { ReminderController } from '@/presentation/controllers/reminder.controller';

function buildController() {
  const createReminder = { execute: mock(async () => ({ id: 'reminder-1' })) };
  const findReminderById = { execute: mock(async () => ({ id: 'reminder-1' })) };
  const findRemindersByUser = {
    execute: mock(async () => ({
      list: [{ id: 'reminder-1' }],
      pagination: { total: 1, page: 1, perPage: 10, totalPages: 1 },
    })),
  };
  const updateReminder = { execute: mock(async () => ({ id: 'reminder-1' })) };
  const deleteReminder = { execute: mock(async () => undefined) };

  const controller = new ReminderController(
    createReminder as never,
    findReminderById as never,
    findRemindersByUser as never,
    updateReminder as never,
    deleteReminder as never,
  );

  return {
    controller,
    createReminder,
    findReminderById,
    findRemindersByUser,
    updateReminder,
    deleteReminder,
  };
}

const payload: SessionPayload = { sub: 'user-1', email: 'john.doe@example.com' };

describe('ReminderController', () => {
  it('delegates listing the user reminders to FindRemindersByUserUseCase', async () => {
    const { controller, findRemindersByUser } = buildController();

    await controller.findMine(payload, { limit: 5, offset: 10 });

    expect(findRemindersByUser.execute).toHaveBeenCalledWith({
      userId: payload.sub,
      limit: 5,
      offset: 10,
    });
  });

  it('delegates fetching a reminder by id to FindReminderByIdUseCase', async () => {
    const { controller, findReminderById } = buildController();

    await controller.findById('reminder-1', payload);

    expect(findReminderById.execute).toHaveBeenCalledWith({
      id: 'reminder-1',
      userId: payload.sub,
    });
  });

  it('delegates creating a reminder to CreateReminderUseCase', async () => {
    const { controller, createReminder } = buildController();
    const body = { description: 'Comprar agulhas 3RL' };

    await controller.create(payload, body);

    expect(createReminder.execute).toHaveBeenCalledWith({ userId: payload.sub, ...body });
  });

  it('delegates updating a reminder to UpdateReminderUseCase', async () => {
    const { controller, updateReminder } = buildController();
    const body = { description: 'Comprar agulhas 5RL' };

    await controller.update(payload, 'reminder-1', body);

    expect(updateReminder.execute).toHaveBeenCalledWith({
      reminderId: 'reminder-1',
      userId: payload.sub,
      ...body,
    });
  });

  it('delegates deleting a reminder to DeleteReminderUseCase', async () => {
    const { controller, deleteReminder } = buildController();

    await controller.remove('reminder-1', payload);

    expect(deleteReminder.execute).toHaveBeenCalledWith({
      id: 'reminder-1',
      userId: payload.sub,
    });
  });
});
