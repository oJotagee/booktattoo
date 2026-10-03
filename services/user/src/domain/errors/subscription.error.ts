export class InvalidSubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSubscriptionError';
  }
}

export class SubscriptionNotFoundError extends Error {
  constructor() {
    super('Usuário não possui assinatura.');
    this.name = 'SubscriptionNotFoundError';
  }
}
