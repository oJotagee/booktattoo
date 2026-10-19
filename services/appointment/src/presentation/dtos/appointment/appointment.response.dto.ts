import { ApiProperty } from '@nestjs/swagger';

import { AppointmentStatus } from '@/domain/entities/appointment.entity';

export class BlockedTimesResponseDto {
  @ApiProperty({ example: ['10:00', '10:30'] })
  blockedTimes!: string[];
}

export class PublicAppointmentCreatedResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  appointmentId!: string;

  @ApiProperty({ example: 'https://checkout.stripe.com/c/pay/cs_test_...' })
  checkoutUrl!: string;
}

export class DayAppointmentResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'Mariana Costa' })
  clientName!: string;

  @ApiProperty({ example: 'mariana@email.com' })
  clientEmail!: string;

  @ApiProperty({ example: '(11) 99999-9999' })
  clientPhone!: string;

  @ApiProperty()
  scheduledAt!: Date;

  @ApiProperty({ example: '09:00' })
  time!: string;

  @ApiProperty({ example: 60 })
  duration!: number;

  @ApiProperty({ example: 28000 })
  price!: number;

  @ApiProperty({ example: 8000 })
  depositAmount!: number;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.CONFIRMED })
  status!: AppointmentStatus;

  @ApiProperty({ nullable: true, type: String })
  galeryId!: string | null;

  @ApiProperty({ example: 'Rosa Tradicional', nullable: true, type: String })
  galeryTitle!: string | null;

  @ApiProperty({ nullable: true, type: String })
  galeryImageUrl!: string | null;

  @ApiProperty({ nullable: true, type: Date })
  paidAt!: Date | null;

  @ApiProperty({ nullable: true, type: Date })
  refundedAt!: Date | null;
}

export class AppointmentStatsResponseDto {
  @ApiProperty({ example: 3 })
  todayConfirmed!: number;

  @ApiProperty({ example: 1 })
  todayPending!: number;

  @ApiProperty({ example: 3, description: 'Flashs com agendamento pendente ou confirmado' })
  reservedFlashes!: number;

  @ApiProperty({ example: 27000, description: 'Sinais pagos no mês, em centavos' })
  depositsThisMonth!: number;
}
