import { InvalidReminderError } from '../errors/reminder.error';

type ReminderProps = {
  id: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type ReminderCreateInput = {
  id: string;
  description: string;
  userId: string;
};

type ReminderRestoreInput = {
  id: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class ReminderEntity {
  private constructor(private readonly reminderProps: ReminderProps) {
    ReminderEntity.validate(reminderProps);
  }

  get id(): string {
    return this.reminderProps.id;
  }

  get description(): string {
    return this.reminderProps.description;
  }

  get userId(): string {
    return this.reminderProps.userId;
  }

  get createdAt(): Date {
    return this.reminderProps.createdAt;
  }

  get updatedAt(): Date {
    return this.reminderProps.updatedAt;
  }

  static create(input: ReminderCreateInput): ReminderEntity {
    const now = new Date();

    return new ReminderEntity({
      id: input.id,
      description: input.description.trim(),
      userId: input.userId,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(input: ReminderRestoreInput): ReminderEntity {
    return new ReminderEntity({ ...input });
  }

  updateDescription(description: string): ReminderEntity {
    return new ReminderEntity({
      ...this.reminderProps,
      description: description.trim(),
      updatedAt: new Date(),
    });
  }

  toSafeJSON(): ReminderProps {
    return {
      id: this.id,
      description: this.description,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private static validate(props: ReminderProps) {
    if (!props.id.trim()) throw new InvalidReminderError('Reminder not found.');
    if (!props.description.trim())
      throw new InvalidReminderError('Reminder description cannot be empty.');
  }
}
