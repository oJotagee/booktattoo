import { ApiProperty } from '@nestjs/swagger';

export class RefundDepositResponseDto {
  @ApiProperty({ example: 're_...' })
  refundId!: string;
}
