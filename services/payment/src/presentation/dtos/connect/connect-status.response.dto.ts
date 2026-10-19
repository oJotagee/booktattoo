import { ApiProperty } from '@nestjs/swagger';

export class ConnectStatusResponseDto {
  @ApiProperty({ example: true, description: 'Já existe conta Stripe criada para o tatuador' })
  connected!: boolean;

  @ApiProperty({ example: true })
  chargesEnabled!: boolean;

  @ApiProperty({ example: true })
  payoutsEnabled!: boolean;

  @ApiProperty({ example: true })
  detailsSubmitted!: boolean;

  @ApiProperty({ example: true, description: 'Pode receber sinais de agendamentos' })
  paymentsEnabled!: boolean;
}
