import { ApiProperty } from '@nestjs/swagger';

import { SubscriptionPlan } from '@/domain/entities/subscription.entity';
import { PlanAccessStatus } from '@/domain/plan/plan-access';

export class PlanLimitsResponseDto {
  @ApiProperty({ example: 3 })
  services!: number;

  @ApiProperty({ example: 5 })
  galeries!: number;
}

export class SubscriptionSummaryResponseDto {
  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiProperty({ enum: SubscriptionPlan, example: SubscriptionPlan.BASIC })
  plan!: SubscriptionPlan;

  @ApiProperty({ example: '2026-11-03T18:00:00.000Z', nullable: true })
  currentPeriodEnd!: Date | null;

  @ApiProperty({ example: false })
  cancelAtPeriodEnd!: boolean;
}

export class PlanAccessResponseDto {
  @ApiProperty({ enum: PlanAccessStatus, example: PlanAccessStatus.TRIAL })
  status!: PlanAccessStatus;

  @ApiProperty({ enum: SubscriptionPlan, nullable: true, example: null })
  plan!: SubscriptionPlan | null;

  @ApiProperty({ type: PlanLimitsResponseDto, nullable: true })
  limits!: PlanLimitsResponseDto | null;

  @ApiProperty({ example: '2026-10-10T18:00:00.000Z' })
  trialEndsAt!: Date;

  @ApiProperty({ example: 5 })
  trialDaysLeft!: number;

  @ApiProperty({ type: SubscriptionSummaryResponseDto, nullable: true })
  subscription!: SubscriptionSummaryResponseDto | null;
}
