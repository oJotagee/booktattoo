export class InvalidSubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSubscriptionError';
  }
}
