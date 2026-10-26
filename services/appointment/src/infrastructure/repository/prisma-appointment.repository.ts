import { Injectable } from '@nestjs/common';

import { BookingOfferStatus } from '@/domain/entities/booking-offer.entity';
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
      where: { userId, paidAt: { gte: start, lt: end }, refundedAt: null },
      _sum: { depositAmount: true },
    });

    return result._sum.depositAmount ?? 0;
  }

  async createExclusive({
    appointment,
    day,
    assertAvailable,
  }: CreateExclusiveParams): Promise<void> {
    // O advisory lock serializa reservas concorrentes do mesmo tatuador.
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

    await this.prisma.$transaction(async (tx) => {
      const previous = await tx.appointment.findUnique({
        where: { id },
        select: { status: true, scheduledAt: true, duration: true },
      });
      const calendarTask = await tx.calendarSync.findUnique({
        where: { appointmentId: id },
        select: { id: true },
      });
      await tx.appointment.update({ where: { id }, data });
      if (
        data.status === AppointmentStatus.CANCELLED &&
        (previous?.status === AppointmentStatus.CONFIRMED || calendarTask)
      ) {
        await tx.calendarSync.upsert({
          where: { appointmentId: id },
          create: { appointmentId: id, operation: 'DELETE' },
          update: {
            operation: 'DELETE',
            status: 'PENDING',
            attempts: 0,
            nextAttemptAt: new Date(),
          },
        });
      } else if (
        data.status === AppointmentStatus.CONFIRMED &&
        previous &&
        (previous.status !== AppointmentStatus.CONFIRMED ||
          previous.scheduledAt.getTime() !== data.scheduledAt.getTime() ||
          previous.duration !== data.duration)
      ) {
        await tx.calendarSync.upsert({
          where: { appointmentId: id },
          create: { appointmentId: id, operation: 'UPSERT' },
          update: {
            operation: 'UPSERT',
            status: 'PENDING',
            attempts: 0,
            lastError: null,
            nextAttemptAt: new Date(),
          },
        });
      }
    });
  }

  async recordPayment(
    appointment: AppointmentEntity,
    expectedStatus: AppointmentStatus,
  ): Promise<boolean> {
    // A atualização condicional garante que só uma entrega confirma o pagamento.
    const {
      id,
      bookingRequestId: _request,
      bookingOfferId: _offer,
      ...data
    } = AppointmentMapper.toPersistence(appointment);

    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.appointment.updateMany({
        where: { id, status: expectedStatus, paidAt: null },
        data,
      });
      if (count === 1 && data.status === AppointmentStatus.CONFIRMED) {
        await tx.calendarSync.upsert({
          where: { appointmentId: id },
          create: { appointmentId: id, operation: 'UPSERT' },
          update: {
            operation: 'UPSERT',
            status: 'PENDING',
            attempts: 0,
            nextAttemptAt: new Date(),
          },
        });
      }
      return count === 1;
    });
  }
}
