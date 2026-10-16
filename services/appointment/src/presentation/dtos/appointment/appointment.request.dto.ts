import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const PHONE_PATTERN = /^[\d\s()+-]{10,20}$/;

export class DateQueryDto {
  @ApiProperty({ example: '2026-10-16', description: 'Dia no formato yyyy-MM-dd' })
  @Matches(DATE_PATTERN, { message: 'A data deve estar no formato yyyy-MM-dd.' })
  date!: string;
}

export class BlockedTimesQueryDto extends DateQueryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  @IsString()
  @IsNotEmpty()
  artistId!: string;
}

export class CreatePublicAppointmentRequestDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  @IsString()
  @IsNotEmpty()
  artistId!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  @IsString()
  @IsNotEmpty()
  galeryId!: string;

  @ApiProperty({ example: '2026-10-16', description: 'Dia no formato yyyy-MM-dd' })
  @Matches(DATE_PATTERN, { message: 'A data deve estar no formato yyyy-MM-dd.' })
  date!: string;

  @ApiProperty({ example: '10:00', description: 'Horário de início no formato HH:mm' })
  @Matches(TIME_PATTERN, { message: 'O horário deve estar no formato HH:mm.' })
  time!: string;

  @ApiProperty({ example: 'Mariana Costa' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'mariana@email.com' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email!: string;

  @ApiProperty({ example: '(11) 99999-9999' })
  @Matches(PHONE_PATTERN, { message: 'Informe um telefone válido.' })
  phone!: string;
}
