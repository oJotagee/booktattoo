import { Inject, Injectable, Logger } from '@nestjs/common';

import type { AppointmentRepository } from '../../port/appointment-repository.port';
import { DEPOSIT_GATEWAY, type DepositGateway } from '../../port/deposit-gateway.port';
import { APPOINTMENT_REPOSITORY } from '../../port/appointment-repository.port';

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

      await this.appointments.update(
        appointment.recordLatePayment(paidAt).recordRefund(refundId, new Date()),
      );
      this.logger.warn(
        `Sinal pago para o agendamento ${appointmentId} com status ${appointment.status}; estornado (${refundId})`,
      );
      return;
    }

    await this.appointments.update(appointment.confirmPayment(paidAt));
  }
}
