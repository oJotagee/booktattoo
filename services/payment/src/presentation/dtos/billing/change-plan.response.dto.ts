import type { SubscriptionPlan } from '@bookink/shared/events';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePlanResponseDto {
  @ApiProperty({ enum: ['BASIC', 'PROFESSIONAL'], example: 'PROFESSIONAL' })
  plan!: SubscriptionPlan;
}
