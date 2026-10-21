import { ApiProperty } from '@nestjs/swagger';

import type { ConnectRequirementKind } from '@/application/port/connect-gateway.port';

const REQUIREMENT_KINDS: ConnectRequirementKind[] = [
  'name',
  'address',
  'date_of_birth',
  'id_number',
  'identity_document',
  'phone',
  'email',
  'bank_account',
  'business',
  'terms',
  'other',
];

export class ConnectRequirementDto {
  @ApiProperty({ enum: REQUIREMENT_KINDS, example: 'address' })
  kind!: ConnectRequirementKind;

  @ApiProperty({ example: true, description: 'O Stripe recusou o dado enviado' })
  rejected!: boolean;
}

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

  @ApiProperty({
    type: [ConnectRequirementDto],
    description: 'Dados que o tatuador ainda precisa enviar ou corrigir no Stripe',
  })
  pendingRequirements!: ConnectRequirementDto[];
}
