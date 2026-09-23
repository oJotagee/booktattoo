export class InvalidPasswordResetTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordResetTokenError';
  }
}

export class PasswordResetTokenNotFoundError extends Error {
  constructor() {
    super('Token de redefinição de senha não encontrado.');
    this.name = 'PasswordResetTokenNotFoundError';
  }
}

export class PasswordResetTokenExpiredError extends Error {
  constructor() {
    super('Token de redefinição de senha expirado.');
    this.name = 'PasswordResetTokenExpiredError';
  }
}

export class PasswordResetTokenUsedError extends Error {
  constructor() {
    super('Token de redefinição de senha já utilizado.');
    this.name = 'PasswordResetTokenUsedError';
  }
}
