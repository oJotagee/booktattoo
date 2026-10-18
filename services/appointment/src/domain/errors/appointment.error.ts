export class InvalidAppointmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAppointmentError';
  }
}

export class AppointmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Agendamento com ID ${id} não encontrado.`);
    this.name = 'AppointmentNotFoundError';
  }
}

export class AppointmentAlreadyCancelledError extends Error {
  constructor() {
    super('Este agendamento já foi cancelado.');
    this.name = 'AppointmentAlreadyCancelledError';
  }
}

export class ArtistUnavailableError extends Error {
  constructor() {
    super('Este tatuador não está recebendo agendamentos no momento.');
    this.name = 'ArtistUnavailableError';
  }
}

export class GaleryUnavailableError extends Error {
  constructor() {
    super('Este flash não está mais disponível para agendamento.');
    this.name = 'GaleryUnavailableError';
  }
}

export class SlotUnavailableError extends Error {
  constructor() {
    super('Este horário não está mais disponível. Escolha outro horário.');
    this.name = 'SlotUnavailableError';
  }
}

export class SlotInThePastError extends Error {
  constructor() {
    super('Não é possível agendar em um horário que já passou.');
    this.name = 'SlotInThePastError';
  }
}

export class ExternalServiceUnavailableError extends Error {
  constructor() {
    super('Não foi possível concluir o agendamento agora. Tente novamente em instantes.');
    this.name = 'ExternalServiceUnavailableError';
  }
}

export class PendingAppointmentLimitError extends Error {
  constructor() {
    super(
      'Você já tem um agendamento aguardando pagamento. Conclua o pagamento ou aguarde até 30 minutos para ele expirar antes de agendar outro.',
    );
    this.name = 'PendingAppointmentLimitError';
  }
}
