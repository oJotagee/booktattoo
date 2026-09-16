export class InvalidRefreshTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRefreshTokenError';
  }
}

export class RefreshTokenNotFoundError extends Error {
  constructor() {
    super('Refresh token não encontrado.');
    this.name = 'RefreshTokenNotFoundError';
  }
}

export class RefreshTokenExpiredError extends Error {
  constructor() {
    super('Refresh token expirado.');
    this.name = 'RefreshTokenExpiredError';
  }
}

export class RefreshTokenRevokedError extends Error {
  constructor() {
    super('Refresh token revogado.');
    this.name = 'RefreshTokenRevokedError';
  }
}
