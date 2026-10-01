import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { GaleryStyle } from '@/domain/entities/galery.entity';

export class UpdateGaleryInfoRequestDto {
  @ApiProperty({ example: 'Rosa fineline', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ example: '10x15cm', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  size?: string;

  @ApiProperty({ example: 35000, description: 'Preço em centavos', required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  price?: number;

  @ApiProperty({ enum: GaleryStyle, example: GaleryStyle.FINELINE, required: false })
  @IsOptional()
  @IsEnum(GaleryStyle)
  style?: GaleryStyle;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  serviceId?: string;
}
