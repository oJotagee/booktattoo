import type { AppointmentEntity, AppointmentStatus } from '@/domain/entities/appointment.entity';
import type { DayRange } from '@/domain/schedule';

export const APPOINTMENT_REPOSITORY = Symbol('APPOINTMENT_REPOSITORY');

export type FindInRangeParams = DayRange & {
  userId: string;
  statuses: AppointmentStatus[];
};

export type AvailabilityContext = {
  sameDay: AppointmentEntity[];
  galeryTaken: boolean;
  clientHasPending: boolean;
  offerAvailable: boolean;
};

export type CreateExclusiveParams = {
  appointment: AppointmentEntity;
  day: DayRange;
  assertAvailable: (context: AvailabilityContext) => void;
};

export interface AppointmentRepository {
  findById(id: string): Promise<AppointmentEntity | null>;
  findInRange(params: FindInRangeParams): Promise<AppointmentEntity[]>;
  countInRange(params: FindInRangeParams): Promise<number>;
  countActiveWithGalery(userId: string): Promise<number>;
  sumDepositsPaidInRange(params: DayRange & { userId: string }): Promise<number>;
  createExclusive(params: CreateExclusiveParams): Promise<void>;
  update(appointment: AppointmentEntity): Promise<void>;
}
