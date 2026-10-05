export class InvalidReminderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidReminderError';
  }
}

export class ReminderNotFoundError extends Error {
  constructor(id: string) {
    super(`Lembrete com ID ${id} não encontrado.`);
    this.name = 'ReminderNotFoundError';
  }
}
