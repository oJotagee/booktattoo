const RESOURCE_LABEL = {
  services: 'serviços',
  galeries: 'itens na galeria',
} as const;

export class PlanExpiredError extends Error {
  constructor() {
    super('Seu período de teste terminou. Assine um plano para continuar.');
    this.name = 'PlanExpiredError';
  }
}

export class PlanLimitReachedError extends Error {
  constructor(resource: keyof typeof RESOURCE_LABEL, limit: number) {
    super(
      `Seu plano permite até ${limit} ${RESOURCE_LABEL[resource]}. Faça upgrade para cadastrar mais.`,
    );
    this.name = 'PlanLimitReachedError';
  }
}

export class PlanAccessUnavailableError extends Error {
  constructor() {
    super('Não foi possível verificar o seu plano agora. Tente novamente.');
    this.name = 'PlanAccessUnavailableError';
  }
}
