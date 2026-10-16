import type { AppointmentModel as PrismaAppointment } from '@generated/prisma/models';

import { AppointmentEntity, type AppointmentStatus } from '@/domain/entities/appointment.entity';

export class AppointmentMapper {
  static toDomain(appointment: PrismaAppointment): AppointmentEntity {
    return AppointmentEntity.restore({
      id: appointment.id,
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      clientPhone: appointment.clientPhone,
      scheduledAt: appointment.scheduledAt,
      duration: appointment.duration,
      price: appointment.price,
      depositAmount: appointment.depositAmount,
      status: appointment.status as AppointmentStatus,
      userId: appointment.userId,
      serviceId: appointment.serviceId,
      galeryId: appointment.galeryId,
      galeryTitle: appointment.galeryTitle,
      galeryImageUrl: appointment.galeryImageUrl,
      checkoutSessionId: appointment.checkoutSessionId,
      paidAt: appointment.paidAt,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    });
  }

  static toPersistence(appointment: AppointmentEntity): PrismaAppointment {
    return {
      ...appointment.toSafeJSON(),
      bookingRequestId: null,
    };
  }
}
