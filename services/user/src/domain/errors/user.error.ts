export class InvalidUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUserError';
  }
}

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`Usuário com ID ${id} não encontrado.`);
    this.name = 'UserNotFoundError';
  }
}

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Usuário com email ${email} já existe.`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('E-mail ou senha inválidos.');
    this.name = 'InvalidCredentialsError';
  }
}

export class UserAlreadyInStatusError extends Error {
  constructor(status: string) {
    super(`Usuário já está com status ${status}.`);
    this.name = 'UserAlreadyInStatusError';
  }
}

export class UnsupportedAvatarTypeError extends Error {
  constructor(mimetype: string) {
    super(`Tipo de arquivo não suportado para avatar: ${mimetype}.`);
    this.name = 'UnsupportedAvatarTypeError';
  }
}

export class TooManyLoginAttemptsError extends Error {
  constructor(retryAfterSeconds: number) {
    const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
    super(`Muitas tentativas de login. Tente novamente em ${minutes} min.`);
    this.name = 'TooManyLoginAttemptsError';
  }
}
