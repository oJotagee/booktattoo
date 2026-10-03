export class InvalidBillingCustomerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBillingCustomerError';
  }
}

export class BillingCustomerNotFoundError extends Error {
  constructor() {
    super('Nenhuma assinatura encontrada para este usuário.');
    this.name = 'BillingCustomerNotFoundError';
  }
}

export class SubscriptionAlreadyActiveError extends Error {
  constructor() {
    super('Usuário já possui uma assinatura ativa. Use o portal para alterar o plano.');
    this.name = 'SubscriptionAlreadyActiveError';
  }
}

export class InvalidWebhookSignatureError extends Error {
  constructor() {
    super('Assinatura do webhook inválida.');
    this.name = 'InvalidWebhookSignatureError';
  }
}

export class UnknownPriceError extends Error {
  constructor(priceId: string) {
    super(`Price ${priceId} não corresponde a nenhum plano.`);
    this.name = 'UnknownPriceError';
  }
}
