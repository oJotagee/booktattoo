import type { BookingOfferEntity } from '@/domain/entities/booking-offer.entity';
import { formatBRL, formatStudioDateTime } from '@/domain/format';

export function offerSentMessage(offer: BookingOfferEntity): string {
  return `Proposta enviada: ${offer.title}, ${formatStudioDateTime(offer.scheduledAt)}. Valor ${formatBRL(offer.price)}, sinal de ${formatBRL(offer.depositAmount)}.`;
}

export function offerWithdrawnMessage(): string {
  return 'A proposta de agendamento foi retirada.';
}

export function offerCancelledMessage(refunded: boolean): string {
  return refunded
    ? 'Agendamento cancelado pelo tatuador. O sinal foi reembolsado.'
    : 'Agendamento cancelado pelo tatuador.';
}

export function offerPaidMessage(offer: BookingOfferEntity): string {
  return `Sinal pago. Agendamento confirmado para ${formatStudioDateTime(offer.scheduledAt)}.`;
}
