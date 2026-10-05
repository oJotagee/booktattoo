import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { FilterGaleriesRequestDto } from './filter-galeries.request.dto';

export class FilterPublicGaleriesRequestDto extends FilterGaleriesRequestDto {
  @ApiProperty({ required: false, description: 'Filtra pelo artista' })
  @IsOptional()
  @IsString({ message: 'Artista inválido' })
  userId?: string;
}
