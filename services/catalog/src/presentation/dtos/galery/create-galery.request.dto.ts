import { IsEnum, IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { GaleryStyle } from '@/domain/entities/galery.entity';

export class CreateGaleryRequestDto {
  @ApiProperty({ example: 'Rosa fineline' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: '10x15cm' })
  @IsString()
  @IsNotEmpty()
  size!: string;

  @ApiProperty({ example: 35000, description: 'Preço em centavos' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  price!: number;

  @ApiProperty({ enum: GaleryStyle, example: GaleryStyle.FINELINE })
  @IsEnum(GaleryStyle)
  style!: GaleryStyle;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file!: unknown;
}
