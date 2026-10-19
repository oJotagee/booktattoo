import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExpireDepositCheckoutRequestDto {
  @ApiProperty({ example: 'cs_test_...' })
  @IsString()
  @IsNotEmpty()
  checkoutSessionId!: string;
}
