import { Inject, Injectable, Logger } from '@nestjs/common';

import type { AppointmentRepository } from '../../port/appointment-repository.port';
import { APPOINTMENT_REPOSITORY } from '../../port/appointment-repository.port';

type ConfirmAppointmentPaymentInput = {
  appointmentId: string;
  paidAt: Date;
};

@Injectable()
export class ConfirmAppointmentPaymentUseCase {
  private readonly logger = new Logger(ConfirmAppointmentPaymentUseCase.name);

  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointments: AppointmentRepository,
  ) {}

  async execute({ appointmentId, paidAt }: ConfirmAppointmentPaymentInput): Promise<void> {
    const appointment = await this.appointments.findById(appointmentId);

    if (!appointment) {
      this.logger.warn(`Sinal pago para o agendamento ${appointmentId}, que não existe`);
      return;
    }

    // Reentrega do evento: já confirmado
    if (appointment.paidAt) return;

    if (!appointment.isPending) {
      this.logger.warn(
        `Sinal pago para o agendamento ${appointmentId} com status ${appointment.status}; precisa de revisão manual`,
      );
      return;
    }

    await this.appointments.update(appointment.confirmPayment(paidAt));
  }
}
