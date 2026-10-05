import { Inject, Injectable } from '@nestjs/common';

import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import type { ReminderRepository } from '../../port/reminder-repository.port';
import { REMINDER_REPOSITORY } from '../../port/reminder-repository.port';
import { ReminderNotFoundError } from '@/domain/errors/reminder.error';

@Injectable()
export class DeleteReminderUseCase {
  constructor(
    @Inject(REMINDER_REPOSITORY)
    private readonly reminders: ReminderRepository,
  ) {}

  async execute({ id, userId }: { id: string; userId: string }): Promise<void> {
    const reminder = await this.reminders.findById(id);
    if (!reminder) throw new ReminderNotFoundError(id);

    if (reminder.userId !== userId) throw new ForbiddenResourceAccessError();

    await this.reminders.delete(id);
  }
}
