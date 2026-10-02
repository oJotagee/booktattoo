import { IsEnum, IsOptional } from 'class-validator';
import { FilterDto } from '@bookink/shared/common';
import { ApiProperty } from '@nestjs/swagger';

import { GaleryStyle } from '@/domain/entities/galery.entity';

export class FilterGaleriesRequestDto extends FilterDto {
  @ApiProperty({ enum: GaleryStyle, required: false, description: 'Filtra pelo estilo' })
  @IsOptional()
  @IsEnum(GaleryStyle, { message: 'Estilo inválido' })
  style?: GaleryStyle;
}
