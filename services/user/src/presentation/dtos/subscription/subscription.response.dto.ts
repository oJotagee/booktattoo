import { ApiProperty } from '@nestjs/swagger';

import { SubscriptionPlan } from '@/domain/entities/subscription.entity';

export class SubscriptionResponseDto {
  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiProperty({ enum: SubscriptionPlan, example: SubscriptionPlan.BASIC })
  plan!: SubscriptionPlan;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ example: '2026-11-03T18:00:00.000Z', nullable: true })
  currentPeriodEnd!: Date | null;

  @ApiProperty({ example: false })
  cancelAtPeriodEnd!: boolean;
}
