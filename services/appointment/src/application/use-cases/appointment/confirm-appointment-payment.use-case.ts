import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  APPOINTMENT_NOTIFIER,
  type AppointmentNotifier,
} from '../../port/appointment-notifier.port';
import type { AppointmentRepository } from '../../port/appointment-repository.port';
import { DEPOSIT_GATEWAY, type DepositGateway } from '../../port/deposit-gateway.port';
import { APPOINTMENT_REPOSITORY } from '../../port/appointment-repository.port';
import {
  BOOKING_OFFER_REPOSITORY,
  type BookingOfferRepository,
} from '../../port/booking-offer-repository.port';
import {
  BOOKING_REQUEST_REPOSITORY,
  type BookingRequestRepository,
} from '../../port/booking-request-repository.port';
import { offerPaidMessage } from '../booking-offer/offer-messages';
import type { AppointmentEntity } from '@/domain/entities/appointment.entity';
import { BookingRequestMessageEntity } from '@/domain/entities/booking-request.entity';

type ConfirmAppointmentPaymentInput = {
  appointmentId: string;
  checkoutSessionId: string;
  paidAt: Date;
};

@Injectable()
export class ConfirmAppointmentPaymentUseCase {
  private readonly logger = new Logger(ConfirmAppointmentPaymentUseCase.name);

  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointments: AppointmentRepository,
    @Inject(DEPOSIT_GATEWAY)
    private readonly deposits: DepositGateway,
    @Inject(APPOINTMENT_NOTIFIER)
    private readonly notifier: AppointmentNotifier,
    @Inject(BOOKING_OFFER_REPOSITORY)
    private readonly offers: BookingOfferRepository,
    @Inject(BOOKING_REQUEST_REPOSITORY)
    private readonly requests: BookingRequestRepository,
  ) {}

  async execute({
    appointmentId,
    checkoutSessionId,
    paidAt,
  }: ConfirmAppointmentPaymentInput): Promise<void> {
    const appointment = await this.appointments.findById(appointmentId);

    if (!appointment) {
      this.logger.warn(`Sinal pago para o agendamento ${appointmentId}, que não existe`);
      return;
    }

    // Reentrega do evento: já confirmado
    if (appointment.paidAt) return;

    if (!appointment.isPending) {
      const { refundId } = await this.deposits.refund({ appointmentId, checkoutSessionId });
      const refunded = appointment.recordLatePayment(paidAt).recordRefund(refundId, new Date());

      await this.appointments.update(refunded);
      this.logger.warn(
        `Sinal pago para o agendamento ${appointmentId} com status ${appointment.status}; estornado (${refundId})`,
      );
      await this.notifier.latePaymentRefunded(refunded);
      return;
    }

    const confirmed = appointment.confirmPayment(paidAt);

    await this.appointments.update(confirmed);
    if (confirmed.bookingOfferId) await this.markOfferPaid(confirmed.bookingOfferId, confirmed);
    await this.notifier.confirmed(confirmed);
  }

  private async markOfferPaid(offerId: string, appointment: AppointmentEntity): Promise<void> {
    const [offer, request] = await Promise.all([
      this.offers.findById(offerId),
      appointment.bookingRequestId ? this.requests.findById(appointment.bookingRequestId) : null,
    ]);

    if (!offer?.isPending || !request) {
      this.logger.warn(
        `Proposta ${offerId} do agendamento ${appointment.id} não estava pendente ao confirmar o sinal`,
      );
      return;
    }

    const message = BookingRequestMessageEntity.system(request.id, offerPaidMessage(offer));

    await this.offers.save({
      offers: [offer.markPaid(appointment.id, appointment.paidAt ?? new Date())],
      request: request.receiveMessage(message),
      message,
    });
  }
}
