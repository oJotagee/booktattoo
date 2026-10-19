import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefundDepositRequestDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @ApiProperty({ example: 'cs_test_...' })
  @IsString()
  @IsNotEmpty()
  checkoutSessionId!: string;
}
