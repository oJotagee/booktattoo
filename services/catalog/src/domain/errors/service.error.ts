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

export class ServiceDepositAboveGaleryPriceError extends Error {
  constructor() {
    super('O sinal não pode ser maior que o preço total de um flash vinculado a este serviço.');
    this.name = 'ServiceDepositAboveGaleryPriceError';
  }
}
