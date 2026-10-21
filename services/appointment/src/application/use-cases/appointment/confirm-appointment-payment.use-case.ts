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
import { type AppointmentEntity, AppointmentStatus } from '@/domain/entities/appointment.entity';
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

  execute(input: ConfirmAppointmentPaymentInput): Promise<void> {
    return this.handle(input, false);
  }

  private async handle(
    { appointmentId, checkoutSessionId, paidAt }: ConfirmAppointmentPaymentInput,
    reread: boolean,
  ): Promise<void> {
    const appointment = await this.appointments.findById(appointmentId);

    if (!appointment) {
      this.logger.warn(`Sinal pago para o agendamento ${appointmentId}, que não existe`);
      return;
    }

    // Reentrega do evento: já confirmado
    if (appointment.paidAt) return;

    if (!appointment.isPending) {
      // O estorno é idempotente por agendamento no payment-service
      const { refundId } = await this.deposits.refund({ appointmentId, checkoutSessionId });
      const refunded = appointment.recordLatePayment(paidAt).recordRefund(refundId, new Date());

      // Entrega concorrente já registrou o estorno e avisou o cliente
      if (!(await this.appointments.recordPayment(refunded, appointment.status))) return;

      this.logger.warn(
        `Sinal pago para o agendamento ${appointmentId} com status ${appointment.status}; estornado (${refundId})`,
      );
      await this.notifier.latePaymentRefunded(refunded);
      return;
    }

    const confirmed = appointment.confirmPayment(paidAt);

    // Entregas concorrentes do mesmo evento passam juntas pela checagem acima, mas só
    // uma confirma. A outra relê: ou já está pago, ou o agendamento foi cancelado ou
    // expirou no meio do caminho e o pagamento vira estorno
    if (!(await this.appointments.recordPayment(confirmed, AppointmentStatus.PENDING))) {
      if (reread) {
        throw new Error(`Não foi possível registrar o sinal do agendamento ${appointmentId}`);
      }
      return this.handle({ appointmentId, checkoutSessionId, paidAt }, true);
    }

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
