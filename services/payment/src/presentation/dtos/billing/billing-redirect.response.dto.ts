import { ApiProperty } from '@nestjs/swagger';

export class BillingRedirectResponseDto {
  @ApiProperty({ example: 'https://checkout.stripe.com/c/pay/cs_test_...' })
  url!: string;
}
