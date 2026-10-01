export class ForbiddenResourceAccessError extends Error {
  constructor() {
    super('Usuario não autorizado');
    this.name = 'ForbiddenResourceAccessError';
  }
}
