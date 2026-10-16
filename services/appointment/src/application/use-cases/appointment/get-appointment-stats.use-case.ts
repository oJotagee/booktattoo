import { Inject, Injectable } from '@nestjs/common';

import type { AppointmentRepository } from '../../port/appointment-repository.port';
import { APPOINTMENT_REPOSITORY } from '../../port/appointment-repository.port';
import { AppointmentStatus } from '@/domain/entities/appointment.entity';
import { dayRange, monthRange, toStudioDate } from '@/domain/schedule';

type GetAppointmentStatsOutput = {
  todayConfirmed: number;
  todayPending: number;
  reservedFlashes: number;
  depositsThisMonth: number;
};

@Injectable()
export class GetAppointmentStatsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointments: AppointmentRepository,
  ) {}

  async execute({
    userId,
    now = new Date(),
  }: {
    userId: string;
    now?: Date;
  }): Promise<GetAppointmentStatsOutput> {
    const today = dayRange(toStudioDate(now));

    const [todayConfirmed, todayPending, reservedFlashes, depositsThisMonth] = await Promise.all([
      this.appointments.countInRange({
        userId,
        ...today,
        statuses: [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED],
      }),
      this.appointments.countInRange({ userId, ...today, statuses: [AppointmentStatus.PENDING] }),
      this.appointments.countActiveWithGalery(userId),
      this.appointments.sumDepositsPaidInRange({ userId, ...monthRange(now) }),
    ]);

    return { todayConfirmed, todayPending, reservedFlashes, depositsThisMonth };
  }
}
