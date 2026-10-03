import type { SubscriptionPlan } from '@bookink/shared/events';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

const PLANS: SubscriptionPlan[] = ['BASIC', 'PROFESSIONAL'];

export class SelectPlanRequestDto {
  @ApiProperty({ enum: PLANS, example: 'BASIC' })
  @IsIn(PLANS)
  plan!: SubscriptionPlan;
}
