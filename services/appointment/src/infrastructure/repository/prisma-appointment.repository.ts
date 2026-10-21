import { Injectable } from '@nestjs/common';

import { AppointmentMapper } from '../persistence/appointment.mapper';
import { PrismaService } from '../prisma/prisma.service';
import type { DayRange } from '@/domain/schedule';
import {
  ACTIVE_APPOINTMENT_STATUSES,
  type AppointmentEntity,
  AppointmentStatus,
} from '@/domain/entities/appointment.entity';
import { BookingOfferStatus } from '@/domain/entities/booking-offer.entity';
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
      where: { userId, paidAt: { gte: start, lt: end }, refundedAt: null },
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

      const [sameDay, galeryTaken, clientPending, offer] = await Promise.all([
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
        appointment.bookingOfferId
          ? tx.bookingOffer.findUnique({
              where: { id: appointment.bookingOfferId },
              select: { status: true },
            })
          : Promise.resolve(null),
      ]);

      assertAvailable({
        sameDay: sameDay.map(AppointmentMapper.toDomain),
        galeryTaken: galeryTaken > 0,
        clientHasPending: clientPending > 0,
        offerAvailable: !appointment.bookingOfferId || offer?.status === BookingOfferStatus.PENDING,
      });

      await tx.appointment.create({ data: AppointmentMapper.toPersistence(appointment) });
    });
  }

  async update(appointment: AppointmentEntity): Promise<void> {
    const {
      id,
      bookingRequestId: _request,
      bookingOfferId: _offer,
      ...data
    } = AppointmentMapper.toPersistence(appointment);

    await this.prisma.appointment.update({ where: { id }, data });
  }

  // Update condicional: entregas concorrentes do mesmo webhook passam pela leitura
  // juntas, mas só uma encontra a linha ainda sem `paidAt`
  async recordPayment(
    appointment: AppointmentEntity,
    expectedStatus: AppointmentStatus,
  ): Promise<boolean> {
    const {
      id,
      bookingRequestId: _request,
      bookingOfferId: _offer,
      ...data
    } = AppointmentMapper.toPersistence(appointment);

    const { count } = await this.prisma.appointment.updateMany({
      where: { id, status: expectedStatus, paidAt: null },
      data,
    });

    return count === 1;
  }
}
