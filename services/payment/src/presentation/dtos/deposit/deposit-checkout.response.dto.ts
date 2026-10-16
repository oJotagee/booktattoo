import { ApiProperty } from '@nestjs/swagger';

export class DepositCheckoutResponseDto {
  @ApiProperty({ example: 'cs_test_...' })
  checkoutSessionId!: string;

  @ApiProperty({ example: 'https://checkout.stripe.com/c/pay/cs_test_...' })
  url!: string;
}
