export class ForbiddenResourceAccessError extends Error {
  constructor() {
    super('Você não tem permissão para acessar este recurso.');
    this.name = 'ForbiddenResourceAccessError';
  }
}
