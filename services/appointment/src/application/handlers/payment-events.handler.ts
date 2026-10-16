import type { PaymentDepositEvent } from '@bookink/shared/events';
import { Injectable } from '@nestjs/common';

import { ConfirmAppointmentPaymentUseCase } from '../use-cases/appointment/confirm-appointment-payment.use-case';
import { ExpirePendingAppointmentUseCase } from '../use-cases/appointment/expire-pending-appointment.use-case';

@Injectable()
export class PaymentEventsHandler {
  constructor(
    private readonly confirmPayment: ConfirmAppointmentPaymentUseCase,
    private readonly expirePending: ExpirePendingAppointmentUseCase,
  ) {}

  async handle({ type, payload, occurredAt }: PaymentDepositEvent): Promise<void> {
    switch (type) {
      case 'payment.deposit.paid':
        return this.confirmPayment.execute({
          appointmentId: payload.appointmentId,
          paidAt: new Date(occurredAt),
        });
      case 'payment.deposit.expired':
        return this.expirePending.execute({ appointmentId: payload.appointmentId });
    }
  }
}
