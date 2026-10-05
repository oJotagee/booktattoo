import { Inject, Injectable } from '@nestjs/common';

import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import type { ReminderRepository } from '../../port/reminder-repository.port';
import { REMINDER_REPOSITORY } from '../../port/reminder-repository.port';
import { ReminderNotFoundError } from '@/domain/errors/reminder.error';

type UpdateReminderInput = {
  reminderId: string;
  userId: string;
  description: string;
};

type UpdateReminderOutput = {
  id: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UpdateReminderUseCase {
  constructor(
    @Inject(REMINDER_REPOSITORY)
    private readonly reminders: ReminderRepository,
  ) {}

  async execute({
    reminderId,
    userId,
    description,
  }: UpdateReminderInput): Promise<UpdateReminderOutput> {
    const reminder = await this.reminders.findById(reminderId);
    if (!reminder) throw new ReminderNotFoundError(reminderId);

    if (reminder.userId !== userId) throw new ForbiddenResourceAccessError();

    const updatedReminder = reminder.updateDescription(description);

    await this.reminders.update(updatedReminder);

    return {
      id: updatedReminder.id,
      description: updatedReminder.description,
      userId: updatedReminder.userId,
      createdAt: updatedReminder.createdAt,
      updatedAt: updatedReminder.updatedAt,
    };
  }
}
