import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { UserStatus } from '@/domain/entities/user.entity';

export class UpdateUserStatusRequestDto {
  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  status!: UserStatus;
}
