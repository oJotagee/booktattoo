export class InvalidBookingRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBookingRequestError';
  }
}

export class BookingRequestNotFoundError extends Error {
  constructor() {
    super('Conversa não encontrada.');
    this.name = 'BookingRequestNotFoundError';
  }
}

export class BookingRequestClosedError extends Error {
  constructor() {
    super('Esta conversa foi encerrada pelo tatuador.');
    this.name = 'BookingRequestClosedError';
  }
}

export class BookingRequestUnavailableError extends Error {
  constructor() {
    super('Este tatuador não está recebendo pedidos no momento.');
    this.name = 'BookingRequestUnavailableError';
  }
}

export class OpenBookingRequestLimitError extends Error {
  constructor() {
    super(
      'Você já tem uma conversa aberta com este tatuador. Use o link que enviamos por e-mail para continuar por lá.',
    );
    this.name = 'OpenBookingRequestLimitError';
  }
}

export class ClientMessageLimitError extends Error {
  constructor() {
    super('Aguarde a resposta do tatuador antes de enviar mais mensagens.');
    this.name = 'ClientMessageLimitError';
  }
}

export class InvalidBookingOfferError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBookingOfferError';
  }
}

export class BookingOfferUnavailableError extends Error {
  constructor() {
    super('Esta proposta não está mais disponível. Fale com o tatuador pela conversa.');
    this.name = 'BookingOfferUnavailableError';
  }
}

export class OfferPaymentInProgressError extends Error {
  constructor() {
    super(
      'O cliente está pagando esta proposta agora. Aguarde até 30 minutos para o checkout expirar antes de alterá-la.',
    );
    this.name = 'OfferPaymentInProgressError';
  }
}
