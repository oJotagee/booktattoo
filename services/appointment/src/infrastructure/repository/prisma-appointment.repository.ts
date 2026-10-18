import { Injectable } from '@nestjs/common';

import { AppointmentMapper } from '../persistence/appointment.mapper';
import { PrismaService } from '../prisma/prisma.service';
import type { DayRange } from '@/domain/schedule';
import {
  ACTIVE_APPOINTMENT_STATUSES,
  type AppointmentEntity,
  AppointmentStatus,
} from '@/domain/entities/appointment.entity';
import type {
  AppointmentRepository,
  CreateExclusiveParams,
  FindInRangeParams,
} from '@/application/port/appointment-repository.port';

@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AppointmentEntity | null> {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });

    return appointment ? AppointmentMapper.toDomain(appointment) : null;
  }

  async findInRange({
    userId,
    start,
    end,
    statuses,
  }: FindInRangeParams): Promise<AppointmentEntity[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { userId, scheduledAt: { gte: start, lt: end }, status: { in: statuses } },
      orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
    });

    return appointments.map(AppointmentMapper.toDomain);
  }

  countInRange({ userId, start, end, statuses }: FindInRangeParams): Promise<number> {
    return this.prisma.appointment.count({
      where: { userId, scheduledAt: { gte: start, lt: end }, status: { in: statuses } },
    });
  }

  countActiveWithGalery(userId: string): Promise<number> {
    return this.prisma.appointment.count({
      where: { userId, galeryId: { not: null }, status: { in: ACTIVE_APPOINTMENT_STATUSES } },
    });
  }

  async sumDepositsPaidInRange({
    userId,
    start,
    end,
  }: DayRange & { userId: string }): Promise<number> {
    const result = await this.prisma.appointment.aggregate({
      where: { userId, paidAt: { gte: start, lt: end } },
      _sum: { depositAmount: true },
    });

    return result._sum.depositAmount ?? 0;
  }

  // O advisory lock por tatuador serializa reservas concorrentes: a checagem de
  // conflito e o insert enxergam o mesmo estado
  async createExclusive({
    appointment,
    day,
    assertAvailable,
  }: CreateExclusiveParams): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${appointment.userId}))`;

      const [sameDay, galeryTaken, clientPending] = await Promise.all([
        tx.appointment.findMany({
          where: {
            userId: appointment.userId,
            scheduledAt: { gte: day.start, lt: day.end },
            status: { in: ACTIVE_APPOINTMENT_STATUSES },
          },
        }),
        appointment.galeryId
          ? tx.appointment.count({
              where: {
                galeryId: appointment.galeryId,
                status: { in: ACTIVE_APPOINTMENT_STATUSES },
              },
            })
          : Promise.resolve(0),
        tx.appointment.count({
          where: {
            status: AppointmentStatus.PENDING,
            OR: [
              { clientEmail: appointment.clientEmail },
              { clientPhone: appointment.clientPhone },
            ],
          },
        }),
      ]);

      assertAvailable({
        sameDay: sameDay.map(AppointmentMapper.toDomain),
        galeryTaken: galeryTaken > 0,
        clientHasPending: clientPending > 0,
      });

      await tx.appointment.create({ data: AppointmentMapper.toPersistence(appointment) });
    });
  }

  async update(appointment: AppointmentEntity): Promise<void> {
    const { id, bookingRequestId: _, ...data } = AppointmentMapper.toPersistence(appointment);

    await this.prisma.appointment.update({ where: { id }, data });
  }
}
