import { Inject, Injectable } from '@nestjs/common';

import type { AppointmentRepository } from '../../port/appointment-repository.port';
import { APPOINTMENT_REPOSITORY } from '../../port/appointment-repository.port';
import { InvalidAppointmentError } from '@/domain/errors/appointment.error';
import { AppointmentStatus } from '@/domain/entities/appointment.entity';
import { dayRange, isValidDate, toSlotTime } from '@/domain/schedule';

type DayAppointmentOutput = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  scheduledAt: Date;
  time: string;
  duration: number;
  price: number;
  depositAmount: number;
  status: AppointmentStatus;
  galeryId: string | null;
  galeryTitle: string | null;
  galeryImageUrl: string | null;
  paidAt: Date | null;
};

const LISTED_STATUSES = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.COMPLETED,
];

@Injectable()
export class FindDayAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointments: AppointmentRepository,
  ) {}

  async execute({
    userId,
    date,
  }: {
    userId: string;
    date: string;
  }): Promise<DayAppointmentOutput[]> {
    if (!isValidDate(date)) throw new InvalidAppointmentError('Data inválida.');

    const appointments = await this.appointments.findInRange({
      userId,
      ...dayRange(date),
      statuses: LISTED_STATUSES,
    });

    return appointments.map((appointment) => ({
      id: appointment.id,
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      clientPhone: appointment.clientPhone,
      scheduledAt: appointment.scheduledAt,
      time: toSlotTime(appointment.scheduledAt, date),
      duration: appointment.duration,
      price: appointment.price,
      depositAmount: appointment.depositAmount,
      status: appointment.status,
      galeryId: appointment.galeryId,
      galeryTitle: appointment.galeryTitle,
      galeryImageUrl: appointment.galeryImageUrl,
      paidAt: appointment.paidAt,
    }));
  }
}
