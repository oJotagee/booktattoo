import type { AppointmentEntity } from '@/domain/entities/appointment.entity';

export const APPOINTMENT_NOTIFIER = Symbol('APPOINTMENT_NOTIFIER');

export interface AppointmentNotifier {
  confirmed(appointment: AppointmentEntity): Promise<void>;
  cancelledWithRefund(appointment: AppointmentEntity): Promise<void>;
  latePaymentRefunded(appointment: AppointmentEntity): Promise<void>;
}
