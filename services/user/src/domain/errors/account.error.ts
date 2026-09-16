export class InvalidAccountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAccountError';
  }
}

export class AccountNotFoundError extends Error {
  constructor(provider: string, providerAccountId: string) {
    super(`Conta ${provider}/${providerAccountId} não encontrada.`);
    this.name = 'AccountNotFoundError';
  }
}

export class AccountAlreadyLinkedError extends Error {
  constructor(provider: string, providerAccountId: string) {
    super(`Conta ${provider}/${providerAccountId} já está vinculada a outro usuário.`);
    this.name = 'AccountAlreadyLinkedError';
  }
}
