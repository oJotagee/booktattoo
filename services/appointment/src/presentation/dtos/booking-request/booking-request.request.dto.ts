import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FilterDto } from '@bookink/shared/common';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { BookingRequestStatus, MESSAGE_MAX_LENGTH } from '@/domain/entities/booking-request.entity';
import {
  OFFER_MAX_DURATION,
  OFFER_MIN_DEPOSIT,
  OFFER_TITLE_MAX_LENGTH,
} from '@/domain/entities/booking-offer.entity';

const PHONE_PATTERN = /^[\d\s()+-]{10,20}$/;

export class CreateBookingRequestRequestDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  @IsString()
  @IsNotEmpty()
  artistId!: string;

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

  @ApiProperty({ example: 'Quero uma rosa fineline no antebraço, uns 10cm.' })
  @IsString()
  @IsNotEmpty({ message: 'Escreva uma mensagem.' })
  @MaxLength(MESSAGE_MAX_LENGTH)
  message!: string;
}

export class SendMessageRequestDto {
  @ApiProperty({ example: 'Consigo fazer na próxima semana. Qual dia fica melhor?' })
  @IsString()
  @IsNotEmpty({ message: 'Escreva uma mensagem.' })
  @MaxLength(MESSAGE_MAX_LENGTH)
  body!: string;
}

export class CreateBookingOfferRequestDto {
  @ApiProperty({ example: 'Rosa fineline no antebraço' })
  @IsString()
  @IsNotEmpty({ message: 'Informe um título.' })
  @MaxLength(OFFER_TITLE_MAX_LENGTH)
  title!: string;

  @ApiProperty({ example: '2026-11-05', description: 'Dia no formato yyyy-MM-dd' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato yyyy-MM-dd.' })
  date!: string;

  @ApiProperty({ example: '14:00', description: 'Horário de início no formato HH:mm' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'O horário deve estar no formato HH:mm.' })
  time!: string;

  @ApiProperty({ example: 120, description: 'Duração em minutos, em blocos de 30' })
  @IsInt()
  @Min(30)
  @Max(OFFER_MAX_DURATION)
  duration!: number;

  @ApiProperty({ example: 60000, description: 'Valor total em centavos' })
  @IsInt()
  @Min(OFFER_MIN_DEPOSIT)
  price!: number;

  @ApiProperty({ example: 15000, description: 'Sinal em centavos' })
  @IsInt()
  @Min(OFFER_MIN_DEPOSIT)
  depositAmount!: number;
}

export class BookingRequestFilterDto extends FilterDto {
  @ApiPropertyOptional({ enum: BookingRequestStatus, default: BookingRequestStatus.OPEN })
  @IsOptional()
  @IsEnum(BookingRequestStatus)
  status?: BookingRequestStatus;
}
