export class InvalidServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidServiceError';
  }
}

export class ServiceNotFoundError extends Error {
  constructor(id: string) {
    super(`Serviço com ID ${id} não encontrado.`);
    this.name = 'ServiceNotFoundError';
  }
}
export class ServiceAlreadyInStatusError extends Error {
  constructor(status: boolean) {
    super(`Serviço já está com status ${status ? 'ativo' : 'inativo'}.`);
    this.name = 'ServiceAlreadyInStatusError';
  }
}
